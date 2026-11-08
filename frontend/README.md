# Brightloop Frontend

Responsive React + TypeScript frontend with a muted slate-blue landing page, the user-provided developer illustration, and a dashboard preview inspired by the supplied Pinterest dashboard/UI references and blue-and-gold Brightloop logo. Includes a landing page, login, and initial authenticated dashboard.

## Run in VS Code (Windows PowerShell)

```powershell
cd C:\Users\user\Desktop\brightloop\frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

Keep your Spring Boot backend running at **http://localhost:8080**. The Vite development proxy forwards `/api/*` to Spring Boot.

### Routes

- `/` — public landing page
- `/login` — login using `POST /api/auth/login`
- `/dashboard` — protected initial dashboard. ADMIN / STAFF use `GET /api/dashboard/financial`; CUSTOMER uses `GET /api/customer/invoices`.

### Notes

- No mock dashboard data is used after login. Public landing page shows an **illustrative** dashboard preview (sample figures based on earlier testing).
- JWT is kept in **sessionStorage** for this development prototype, not in the URL. Production should consider server-managed HttpOnly secure cookies, CSRF strategy, refresh-token policy, and detailed authorization review.
- The provided Brightloop reference logo is included at `public/brightloop-reference-logo.png`. The interface uses a simple scalable SVG mark inspired by it.
- Other sidebar sections show upcoming navigation; they are not yet implemented. Build them alongside real backend endpoints.
- User registration is deliberately not displayed in this first version; new accounts are created via the existing backend registration/admin flows.
- On production deployments, configure the server-side API proxy; Vite `server.proxy` is for local development only.

## Visual update
- Landing page hero uses `public/brightloop-developer-illustration.png` supplied by the user.
- The previously prominent dashboard mock moved below the hero into a dedicated platform section.
- Background and cards use muted gray/slate to avoid a bright, overly polished AI-template feel.
