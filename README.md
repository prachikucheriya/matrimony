# BandhanMil — Multi-caste Matrimony

Phase 1: OTP Login & Registration with cascading Religion → Caste → Sub-caste onboarding.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (local). Switch `DATABASE_URL` to PostgreSQL when ready.
- JWT session cookie (`jose`)
- Dev OTP provider (prints code to the server console / API response)

## Quick start

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Register with mobile or email
2. On the verify screen, use the **demo OTP** shown on the page
3. Complete the 5-step onboarding wizard
4. Land on `/home`

## OTP (important)

Right now the app runs in **demo OTP mode**. Codes are **not** delivered to real SMS/email yet.

After you click **Send OTP**, the verify screen shows the 6-digit code on the page. Use that code to continue.

To enable real delivery later:
- SMS: MSG91 / Twilio
- Email: Resend / Nodemailer SMTP

Set `OTP_DEV_MODE=false` only after a real provider is wired.

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite `file:./dev.db` or Postgres URL |
| `SESSION_SECRET` | Secret for signing session cookies (min 16 chars) |
| `OTP_DEV_MODE` | `true` shows OTP on screen (set `false` when wiring SMS/email) |

## Phase status

**Done (Phase 1)**

- Landing, login, register, verify OTP
- Multi-step onboarding (gender, identity, community, career)
- Cascading community masters from seeded DB
- Session middleware for `/home` and `/onboarding`

**Later**

- Profiles search & filters
- Interests / chat / shortlist
- Admin panel (approvals, caste master CRUD)
- Subscriptions / freemium
- Real SMS/email OTP (MSG91 / Twilio / Resend)

See `plan.txt` for the full product vision.
