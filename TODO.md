# TODO — Deferred / In-Progress Items

This file tracks known gaps in the implementation that need to be implemented.

---

## [Phase 2] — TrackController: log click event to DB

**File:** `backend/Api/Controllers/TrackController.cs`

The controller currently only redirects. The core Phase 2 logic is stubbed:
```csharp
// Member 1: Log ClickedAt, update status, and broadcast SignalR event to Admin Dashboard.
```

**Needs:**
- Inject `IPhishingAttemptRepository` (or `InnovationsprojektDbContext`)
- Look up `PhishingAttempt` by `token`
- Set `attempt.ClickedAt = DateTime.UtcNow` and `attempt.Status = PhishingStatus.Clicked`
- Persist via `SaveChangesAsync()`
- Broadcast via SignalR hub (see below)

---

## [Phase 2] — SignalR Hub for live Admin Dashboard updates

**Expected by:** User-Flow Phase 2, Project Blueprint

No `Hub` class exists, `AddSignalR()` is not registered in `Program.cs`, and there is no `@microsoft/signalr` client in the frontend.

**Needs (backend):**
1. Create `Hubs/PhishingEventHub.cs` extending `Hub`
2. Register in `Program.cs`: `builder.Services.AddSignalR()` + `app.MapHub<PhishingEventHub>("/hubs/phishing")`
3. Inject `IHubContext<PhishingEventHub>` into `TrackController` and broadcast on click

**Needs (frontend):**
1. `npm install @microsoft/signalr`
2. Connect to hub in the Admin Dashboard and subscribe to click events

---

## [Phase 1] Admin Simulation UI — frontend page missing

**Backend:** `POST /api/simulations/send` is fully implemented in `SimulationController.cs`

There is no React page where an Admin can pick a template, enter a target email, and trigger a send. The feature is inaccessible from the browser.

**Needs:**
- A protected `/admin/simulate` route (Admin role only)
- Form: target victim email address input + template selector (fetched from DB via API endpoint)
- Calls `POST /api/simulations/send` with `{ targetEmail, templateId }`
- Shows result (tracking link, status)

---

## [Blueprint] Missing entities: `LURE_DOMAIN` and `PHISHING_MODULE`

The Project Blueprint defines two entities not yet implemented:

- **`LURE_DOMAIN`**: Stores look-alike domains (e.g., `personalabteilung.eu`) and subdomains used in phishing simulations. `EmailTemplate` should have a `lure_domain_id FK`.
- **`PHISHING_MODULE`**: A specialization of `GAME_MODULE` with template-specific metadata (`subject`, `sender_name`, `slug`, `body_html`, etc.).