# Deploy notes

**Status:** Live  
**Production:** https://habitcheck-nine.vercel.app  
**Team alias:** https://habitcheck-wshi.vercel.app  
**Custom domain (added in Vercel; Cloudflare DNS not created yet):** https://habitcheck.weidong-shi.com  
**GitHub:** https://github.com/weidong808/HabitCheck  
**Vercel project:** `wshi/habitcheck`  

> `habitcheck.vercel.app` is **not** this project (name taken by another Habit Tracker). Prefer `habitcheck-nine.vercel.app` or the custom domain once DNS is set.

## Cloudflare DNS (owner action required)

Domain is already on the Vercel project. Cloudflare has **no** `habitcheck` record yet (`NXDOMAIN`). Nameservers stay on Cloudflare (`kirk` / `tani`).

Create **DNS only** (grey cloud / proxy off), same pattern as Readiness/SleepCheck:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `habitcheck` | `76.76.21.21` | DNS only |

### Dashboard steps

1. Cloudflare → zone **weidong-shi.com** → **DNS** → **Records** → **Add record**
2. Type **A**, Name **`habitcheck`**, IPv4 **`76.76.21.21`**, Proxy status **DNS only** (grey cloud)
3. Save. Do not enable the orange cloud.

### Optional API (if `CLOUDFLARE_API_TOKEN` + zone id available)

```powershell
# Token needs Zone.DNS Edit on weidong-shi.com. Never commit the token.
$zoneId = "<zone-id>"
$headers = @{ Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN" }
$body = @{
  type    = "A"
  name    = "habitcheck"
  content = "76.76.21.21"
  ttl     = 1
  proxied = $false
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
  -Headers $headers -ContentType "application/json" -Body $body
```

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
