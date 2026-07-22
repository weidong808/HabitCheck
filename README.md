# HabitCheck

**Recover after missed days** — local-first weekly habit coach (AI in Action #4).

- Live (planned): https://habitcheck.weidong-shi.com
- Hub: https://weidong-shi.com
- Roadmap / MVP: https://github.com/weidong808/ai-in-action-roadmap/blob/main/docs/discovery/habitcheck-02-mvp-specification.md

## Status

**P0–P7 code complete** on `main` — Facts tracking, recovery/pause, weekly review ±1, privacy-gated AI coach (Starter · Comeback · Review cards · Plan Adjuster · smaller-version), Settings export/import, PWA manifest. CI green.

**Live:** https://habitcheck-nine.vercel.app · Vercel project `wshi/habitcheck`  
**Still owner-side for public v1.0:** DNS for `habitcheck.weidong-shi.com` (A → `76.76.21.21`, DNS only), hub case study / LinkedIn.

Local AI: copy `.env.example` → `.env` (same `OPENAI_API_KEY` pattern as Readiness). Deploy notes: [`docs/architecture/deploy.md`](docs/architecture/deploy.md).  
Note: `habitcheck.vercel.app` is a different (unrelated) project — use the `-nine` / `-wshi` aliases or the custom domain.

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · `next-themes`
- IndexedDB via Dexie (browser)
- Vitest for tracking + AI privacy gate + export/import
- Optional AI coach: OpenAI behind consent + privacy gate (`/api/ai`)

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Phases

| Phase | Focus |
|-------|--------|
| P0 | Scaffold ✓ |
| P1 | Tracking core ✓ |
| P2 | Today loop ✓ |
| P3 | Recovery & pause ✓ |
| P4 | Review Facts + ±1 targets ✓ |
| P5–P6 | AI platform + coach features ✓ |
| P7 | Polish & ship ✓ · Vercel live · custom domain pending |

## License

MIT educational showcase — personal lab, not a commercial product.
