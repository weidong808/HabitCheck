# HabitCheck

**Recover after missed days** — local-first weekly habit coach (AI in Action #4).

- Live (planned): https://habitcheck.weidong-shi.com
- Hub: https://weidong-shi.com
- Roadmap / MVP: https://github.com/weidong808/ai-in-action-roadmap/blob/main/docs/discovery/habitcheck-02-mvp-specification.md

## Status

**P2 Today loop** — create ≤3 habits, done/skip + difficulty, week ring, 7-day backfill, archive (IndexedDB).

**P1 tracking core** — pure Mon–Sun week math; Vitest scoring contract.

**P0 scaffold** — Next.js App Router, Tailwind v4, Privacy, AI stubs, CI.

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · `next-themes`
- IndexedDB via Dexie (browser)
- Vitest for `src/lib/tracking/`
- Optional AI coach behind a privacy gate (later phases)

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
| P3 | Recovery & pause |
| P4 | Review Facts + ±1 targets |
| P5–P6 | AI platform + coach features |
| P7 | Polish & ship |

## License

MIT educational showcase — personal lab, not a commercial product.
