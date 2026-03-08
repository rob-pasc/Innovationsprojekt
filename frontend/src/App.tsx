import { useState, useEffect } from "react"
import { AlertTriangle, ShieldCheck, MailWarning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function App() {
  const [isPhished, setIsPhished] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Detect tracking parameters from the API redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("phished") === "true") {
      setIsPhished(true);
      setToken(params.get("token"));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 space-y-8">
      
      {/* 1. THE "GOTCHA" ALERT SECTION */}
      {isPhished && (
        <Card className="w-full max-w-2xl border-destructive/50 bg-destructive/5 shadow-2xl animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive tracking-tight">
              Oops! You just fell for it.
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
              This was a simulated phishing attack designed to test your awareness.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 py-4">
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 shadow-sm">
              <MailWarning className="w-6 h-6 text-orange-500 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">What happened?</h4>
                <p className="text-sm text-slate-500 mt-1">
                  You clicked a link in an email that appeared to be from <strong>personalabteilung.eu</strong>. 
                  In a real-world scenario, this could have led to credential theft or malware installation.
                </p>
              </div>
            </div>
            {token && (
              <div className="flex justify-center">
                <Badge variant="outline" className="font-mono text-[10px] uppercase opacity-50">
                  Simulation ID: {token}
                </Badge>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white gap-2">
              Start Recovery Training <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 2. MAIN DASHBOARD / DEMO SECTION */}
      <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Vertical Slice: AIS</Badge>
          </div>
          <CardTitle className="text-2xl font-bold">Media Literacy Dashboard</CardTitle>
          <CardDescription>
            Enhancing digital competence through gamified simulations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs text-muted-foreground text-center">
              Your security training data will appear here once the database integration is complete.
            </p>
          </div>
        </CardContent>
        <CardFooter className="text-[10px] text-muted-foreground justify-center">
          Innovationsprojekt 2026 • FH Vorarlberg
        </CardFooter>
      </Card>

    </div>
  )
}