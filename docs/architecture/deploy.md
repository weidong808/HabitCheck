# Deploy notes

**Status:** Live  
**Production (custom domain):** https://habitcheck.weidong-shi.com  
**Vercel fallback:** https://habitcheck-nine.vercel.app  
**Team alias:** https://habitcheck-wshi.vercel.app  
**GitHub:** https://github.com/weidong808/HabitCheck  
**Vercel project:** `wshi/habitcheck`  

> `habitcheck.vercel.app` is **not** this project (name taken by another Habit Tracker). Prefer the custom domain or `habitcheck-nine.vercel.app`.

## Cloudflare DNS

Domain is on the Vercel project. Nameservers stay on Cloudflare (`kirk` / `tani`).

**Record (verified 2026-07-22):** DNS only (grey cloud / proxy off):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `habitcheck` | `76.76.21.21` | DNS only |

Do not enable the orange cloud (keeps Vercel SSL simple).

### Verify

```powershell
nslookup habitcheck.weidong-shi.com
# expect: 76.76.21.21

Invoke-WebRequest https://habitcheck.weidong-shi.com -UseBasicParsing | Select-Object StatusCode
Invoke-RestMethod https://habitcheck.weidong-shi.com/api/ai
# expect: status "ready"
```

Also confirm Vercel → habitcheck → Domains → `habitcheck.weidong-shi.com` shows **Valid**.

See hub inventory: `weidong-website/docs/cloudflare-dns.md`.

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
Invoke-RestMethod https://habitcheck.weidong-shi.com/api/ai
# expect: status "ready"

$payload = @{
  feature = "smaller_version"
  consented = $true
  habitName = "Walk"
  motivation = "feel better"
  currentSmallerVersion = "put on shoes"
} | ConvertTo-Json

$res = Invoke-RestMethod `
  -Uri "https://habitcheck.weidong-shi.com/api/ai" `
  -Method POST -ContentType "application/json" -Body $payload
$res.ok   # expect: True
```
