import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function App() {
  const [name, setName] = useState("")
  const [submittedName, setSubmittedName] = useState("")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Innovationsprojekt 🚀</CardTitle>
          <CardDescription>
            Mini Demo mit Tailwind + shadcn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Dein Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={() => setSubmittedName(name)}
            >
              Abschicken
            </Button>
          </div>

          {submittedName && (
            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Willkommen,
              </p>
              <div className="flex items-center gap-2">
                <Badge>{submittedName}</Badge>
                <Badge variant="secondary">bereit für Innovation</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}