import { useState, useEffect } from "react"
import { AlertTriangle, ShieldCheck, MailWarning, ArrowRight, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function App() {
  const [isPhished, setIsPhished] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(() => {
    // Initialise from localStorage, falling back to system preference
    const stored = localStorage.getItem("theme")
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Apply / remove the `dark` class on <html> whenever isDark changes
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("phished") === "true") {
      setIsPhished(true)
      setToken(params.get("token"))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8 space-y-8 selection:bg-accent/20">

      {/* Theme toggle — fixed to top-right corner */}
      <button
        onClick={() => setIsDark((prev) => !prev)}
        aria-label="Toggle light/dark mode"
        className="fixed top-4 right-4 z-50 p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* 1. GOTCHA ALERT — Phase 3: The Recovery */}
      {isPhished && (
        <Card className="w-full max-w-2xl border-destructive/30 bg-destructive/5 shadow-2xl animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 border border-destructive/20">
              <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive tracking-tight">
              Oops! You just fell for it.
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              This was a simulated phishing attack designed to test your awareness.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 py-4">
            <div className="flex items-start gap-4 p-5 bg-secondary rounded-xl border border-border shadow-inner">
              <MailWarning className="w-6 h-6 text-destructive mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">What happened?</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  You clicked a link in an email that appeared to be from{" "}
                  <strong className="text-foreground">personalabteilung.eu</strong>.
                  In a real-world scenario, this could have led to credential theft or malware installation.
                </p>
              </div>
            </div>

            {token && (
              <div className="flex justify-center">
                <Badge variant="outline" className="font-mono text-[10px] uppercase text-muted-foreground">
                  Simulation ID: {token}
                </Badge>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pb-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 gap-3"
            >
              Start Recovery Training <ArrowRight className="w-5 h-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 2. MAIN DASHBOARD / DEMO SECTION */}
      <Card className="w-full max-w-md shadow-xl border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
              Vertical Slice: AIS
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Media Literacy Dashboard
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enhancing digital competence through gamified simulations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-6 rounded-xl bg-secondary/50 border border-dashed border-border transition-colors hover:border-accent/30">
            <p className="text-xs text-muted-foreground text-center italic">
              Your security training data will appear here once the database integration is complete.
            </p>
          </div>
        </CardContent>

        <CardFooter className="text-[10px] text-muted-foreground/40 justify-center font-mono tracking-widest">
          INNOVATIONSPROJEKT 2026 • FH VORARLBERG
        </CardFooter>
      </Card>

    </div>
  )
}