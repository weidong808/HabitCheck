# HabitCheck visual parity — Phase 1 review

**Status:** ready for owner visual review (not pushed)  
**App:** HabitCheck · first-run `/`  
**Plan:** [weidong-website/docs/apps-visual-parity/PLAN.md](https://github.com/weidong808/weidong-website/blob/main/docs/apps-visual-parity/PLAN.md)

## What changed

| Surface | Before | After |
| ------- | ------ | ----- |
| First-run H1 | Brand name only | Human headline: *Missed a day? Recover without starting over.* |
| Brand | Was H1 | Display name above headline (still hero-level) |
| Benefit | “Recover without fake completion.” | Flexible targets / kind recovery / no fake checkmarks |
| CTAs | One primary | **Start with one habit** + **Read the story** → hub case study |
| Product proof | None | `HabitProductPreview` — Today board with rings + recovery (not architecture) |
| Tagline (chrome / meta) | Recover after missed days | Recover without starting over |
| Privacy | Privacy-only intro | Tagline + trust line + case study link |
| Footer | Name + disclaimer | + tagline under name |

## Acceptance checklist

- [x] Human headline + benefit above the fold (mobile composition)
- [x] Real product visual (Today preview, not architecture diagram)
- [x] Dominant Try CTA + secondary hub story link
- [x] Light + dark captured (see `review/`)
- [x] No horizontal overflow observed at 390 / 1440 in captures
- [ ] CI green + Vercel success (after push)
- [ ] Owner approve → commit/push

## Review shots

| File | Viewport | Theme |
| ---- | -------- | ----- |
| [review/after-390-light.png](./review/after-390-light.png) | 390 | light |
| [review/after-390-dark.png](./review/after-390-dark.png) | 390 | dark |
| [review/after-1440-light.png](./review/after-1440-light.png) | 1440 | light |
| [review/after-1440-dark.png](./review/after-1440-dark.png) | 1440 | dark |

Re-capture: `node scripts/capture-visual-parity.mjs` (requires local `npm run dev` + `playwright`).

## How to review locally

```powershell
cd C:\Users\weido\Projects\HabitCheck
npm run dev
# open http://localhost:3000 — clear site data if habits already seeded
```

Toggle theme; check 390px width and privacy page.

## Files

- `src/lib/brand.ts`
- `src/components/today/HabitEntrySurface.tsx`
- `src/components/today/HabitProductPreview.tsx` (new)
- `src/components/AppFooter.tsx`
- `src/app/privacy/page.tsx`
- `public/images/product/*.png` (hub captures archived for later hub refresh)

## Out of scope this PR

- Recapturing hub collage with seeded board (follow-up after this ships)
- Round 2 craft (skeletons / empty-state variants beyond this hero)
- Other three apps
