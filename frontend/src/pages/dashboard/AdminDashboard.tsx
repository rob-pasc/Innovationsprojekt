import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuthStore } from '@/store/useAuthStore';
import { simulationAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Send,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  Users,
  BarChart2,
  FileText,
  Radio,
} from 'lucide-react';

interface EmailTemplateSummary {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  difficultyScore: number;
}

interface SimulationResult {
  attemptId: string;
  targetEmail: string;
  templateName: string;
  trackingLink: string;
  sentAt: string;
  status: string;
  message: string;
}

interface SimulationClickedEvent {
  attemptId: string;
  trackingToken: string;
  clickedAt: string;
  status: string;
  targetEmail?: string;
  templateName?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/api$/, '');

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const [templates, setTemplates] = useState<EmailTemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [targetEmail, setTargetEmail] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const [copied, setCopied] = useState(false);

  const [liveEvents, setLiveEvents] = useState<SimulationClickedEvent[]>([]);
  const [signalRStatus, setSignalRStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    simulationAPI.getTemplates()
      .then((res) => {
        setTemplates(res.data);
        if (res.data.length > 0) setSelectedTemplateId(res.data[0].id);
      })
      .catch(() => setTemplatesError('Failed to load templates.'))
      .finally(() => setTemplatesLoading(false));
  }, []);

  useEffect(() => {
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/simulation`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('SimulationClicked', (event: SimulationClickedEvent) => {
      setLiveEvents((prev) => [event, ...prev].slice(0, 10));
    });

    connection.onreconnecting(() => {
      setSignalRStatus('connecting');
    });

    connection.onreconnected(() => {
      setSignalRStatus('connected');
    });

    connection.onclose(() => {
      setSignalRStatus('disconnected');
    });

    connection.start()
      .then(() => setSignalRStatus('connected'))
      .catch((error) => {
        console.error('SignalR connection failed:', error);
        setSignalRStatus('disconnected');
      });

    return () => {
      connection.stop().catch((error) => {
        console.error('SignalR disconnect failed:', error);
      });
    };
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!targetEmail || !selectedTemplateId) return;

    setSending(true);
    setSendError(null);
    setResult(null);

    try {
      const res = await simulationAPI.sendSimulation(targetEmail, selectedTemplateId);
      setResult(res.data);
      setTargetEmail('');
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setSendError(detail ?? 'Failed to send simulation. Check that the target email exists.');
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!user) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
              Admin
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                signalRStatus === 'connected'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : signalRStatus === 'connecting'
                  ? 'bg-muted text-muted-foreground border-border'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              Live updates: {signalRStatus}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage phishing simulations and monitor user activity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                  <Send className="w-5 h-5" />
                  Send Phishing Simulation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a template and enter a target email to dispatch a simulated phishing email.
                </p>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="targetEmail" className="text-sm font-medium text-foreground">
                    Target Email
                  </label>
                  <input
                    id="targetEmail"
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="template" className="text-sm font-medium text-foreground">
                    Email Template
                  </label>
                  {templatesLoading ? (
                    <div className="w-full px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground animate-pulse">
                      Loading templates...
                    </div>
                  ) : templatesError ? (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {templatesError}
                    </div>
                  ) : (
                    <select
                      id="template"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — difficulty {t.difficultyScore}/5
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="rounded-md bg-muted/50 border border-border p-3 space-y-1 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Subject:</span> {selectedTemplate.subject}</p>
                    <p><span className="font-medium text-foreground">Sender:</span> {selectedTemplate.senderName}</p>
                    <p><span className="font-medium text-foreground">Difficulty:</span> {selectedTemplate.difficultyScore}/5</p>
                  </div>
                )}

                {sendError && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {sendError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={sending || templatesLoading || !!templatesError}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Simulation'}
                </Button>
              </form>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 border-primary/30 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="font-semibold text-foreground">Simulation Sent</h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium text-foreground">{result.targetEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium text-foreground">{result.templateName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-foreground capitalize">{result.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sent at</span>
                      <span className="font-medium text-foreground">
                        {new Date(result.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Tracking Link</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate text-foreground">
                        {result.trackingLink}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="flex-shrink-0 p-1.5 rounded hover:bg-muted transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <Copy className="w-4 h-4 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Live Click Events</h3>
              </div>

              {liveEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No live click events yet. Open a tracking link to test SignalR.
                </p>
              ) : (
                <div className="space-y-3">
                  {liveEvents.map((event) => (
                    <div
                      key={`${event.attemptId}-${event.clickedAt}`}
                      className="rounded-md border border-border bg-muted/30 p-3 space-y-1"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {event.targetEmail ?? 'Unknown user'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Template: {event.templateName ?? 'Unknown template'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Clicked: {new Date(event.clickedAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        Token: {event.trackingToken}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <ComingSoonCard
              icon={<BarChart2 className="w-5 h-5" />}
              title="Simulation Stats"
              description="Per-template sent, clicked, and remediated counts"
            />
            <ComingSoonCard
              icon={<Users className="w-5 h-5" />}
              title="Attempt Table"
              description="Paginated list of all phishing attempts with status filters"
            />
            <ComingSoonCard
              icon={<FileText className="w-5 h-5" />}
              title="Template Editor"
              description="Create and edit phishing email templates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5 border-dashed opacity-60">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground">{title}</h4>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Soon
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}