<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## GridKita CMS — Project Notes

**Stack**: Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (radix variant) · Recharts

### Key conventions
- **Async params**: Next 16 requires `params: Promise<{...}>` — always `await params` in page components.
- **Server Actions**: use `"use server"` directive inside async functions, defined either inline (`action={async () => { "use server"; ... }}`) or in `src/app/actions/`.
- **Auth (mock)**: Cookie `gk_user_id` set by server actions in `src/app/actions/auth.ts`. Read via `getCurrentUser()` / `requireRole()` from `src/lib/auth-mock.ts`.
- **Mock data**: All data lives in `src/lib/mock/`. No real DB. Backend (Prisma + MySQL + Auth.js) is out-of-scope for this front-end phase.
- **No `middleware.ts`**: Next 16 renamed it to `proxy.ts`. RBAC is enforced via `requireRole()` in each layout.
- **Tailwind**: Using Tailwind v4 with CSS variables (`oklch` color space). Custom tokens in `globals.css` — `--primary`, `--success`, `--warning`, `--info`, sidebar tokens, and chart tokens.
- **shadcn components**: Radix-based variant (has `asChild` prop). Located in `src/components/ui/`.
- **Charts**: Recharts with `"use client"` wrapper in `src/components/charts/admin-charts.tsx`.

### Commands
```bash
npm run dev       # dev server (Turbopack default)
npm run build     # production build + type check
npm run typecheck # tsc --noEmit
npm run lint      # eslint src
```

### Route structure
```
/                      → landing page (public)
/portfolio             → galeri karya
/katalog               → katalog paket
/login  /register      → auth
/dashboard/**          → CLIENT role
/designer/**           → DESIGNER role
/admin/**              → ADMIN role
```

### Business rules (PRD §4.5)
- Komisi selalu **70% desainer / 30% kas** — `COMMISSION_RATE = 0.70` di `src/lib/payroll.ts`
- `PayrollEntry` dibuat 1× per order saat `DELIVERED`
- `RecurringExpense` generator idempoten — cek `lastGeneratedAt` sebelum insert
- State machine order (11 status) di `src/lib/state-machine.ts`
