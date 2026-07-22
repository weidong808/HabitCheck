# Deploy notes

**Status:** Live  
**Production:** https://habitcheck-nine.vercel.app  
**Team alias:** https://habitcheck-wshi.vercel.app  
**Custom domain (added in Vercel; DNS pending):** https://habitcheck.weidong-shi.com  
**GitHub:** https://github.com/weidong808/HabitCheck  
**Vercel project:** `wshi/habitcheck`  

> `habitcheck.vercel.app` is **not** this project (name taken by another Habit Tracker). Prefer `habitcheck-nine.vercel.app` or the custom domain once DNS is set.

## Cloudflare DNS (when ready)

Configure **DNS only** (grey cloud), same pattern as Readiness/SleepCheck:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `habitcheck` | `76.76.21.21` | DNS only |

Then in Vercel: Project → Settings → Domains → add `habitcheck.weidong-shi.com`.

## Environment variables (Production + Preview)

| Name | Required | Notes |
|------|----------|-------|
| `OPENAI_API_KEY` | Yes | Server-only; never commit |
| `OPENAI_MODEL` | No | Default `gpt-4.1-mini` |
| `AI_COACH_ENABLED` | No | Default on; `false` disables coach |
| `AI_MAX_OUTPUT_TOKENS` | No | Default `900` |
| `AI_RATE_LIMIT_PER_MIN` | No | Default `20` |

Local `.env` is gitignored and listed in `.vercelignore`.

### Rotate / refresh OpenAI key (Production)

```powershell
# From repo root — uses local .env only (never commit the key)
npx vercel env rm OPENAI_API_KEY production
# confirm y
Get-Content .env | Where-Object { $_ -match '^\s*OPENAI_API_KEY=' } |
  ForEach-Object { ($_ -replace '^\s*OPENAI_API_KEY=', '').Trim() } |
  npx vercel env add OPENAI_API_KEY production --sensitive
npx vercel --prod
```

## Deploy commands

```bash
npm run build
npx vercel --prod
```

GitHub is connected — pushes to `main` can trigger production deploys when enabled in the Vercel project.

## Post-deploy AI probe

```powershell
Invoke-RestMethod https://habitcheck-nine.vercel.app/api/ai
# expect: status "ready"

$payload = @{
  feature = "smaller_version"
  consented = $true
  habitName = "Walk"
  motivation = "feel better"
  currentSmallerVersion = "put on shoes"
} | ConvertTo-Json

$res = Invoke-RestMethod `
  -Uri "https://habitcheck-nine.vercel.app/api/ai" `
  -Method POST -ContentType "application/json" -Body $payload
$res.ok   # expect: True
```
