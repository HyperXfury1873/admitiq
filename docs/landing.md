# AdmitiQ website (static React)

**Live:** https://admitiq.logiclitz.org

Frontend-only Vite + React SPA. No backend required.

## Design

Quiet precision: Instrument Serif + Manrope, mist field, teal accent (`#0F5C61`), glass panels, restrained motion.

## Deploy to https://admitiq.logiclitz.org

1. Push `main` — GitHub Actions workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) builds `admitiq-landing` and deploys to GitHub Pages.
2. In the repo: **Settings → Pages → Source = GitHub Actions**.
3. Custom domain: `admitiq.logiclitz.org` (CNAME file is in `public/CNAME`).
4. At your DNS provider for `logiclitz.org`, add a **CNAME** record:
   - Name: `admitiq`
   - Target: `HyperXfury1873.github.io` (or the Pages URL GitHub shows)
5. **Do not** point `admitiq` at Hostinger A/AAAA records. If `admitiq.logiclitz.org`
   resolves to Hostinger (`hcdn`) instead of GitHub Pages, deep links like `/tutorial`
   will 404 even though the home page works. Remove those Hostinger records for the
   `admitiq` subdomain only.
6. Wait for DNS + TLS; verify `/`, `/tutorial`, `/debugger`, `/why`, `/robots.txt`.

### If you keep Hostinger file hosting instead of Pages

Upload the contents of `admitiq-landing/dist/` (including **`.htaccess`**) to the
`admitiq` subdomain document root. The `.htaccess` rewrites unknown paths to
`index.html` so React Router routes work.

Local build:

```powershell
cd admitiq-landing
npm install
npm run build   # → dist/
```

## Crawler / SEO files (copied into dist)

| File | Purpose |
|------|---------|
| `robots.txt` | Allow humans + major AI crawlers |
| `sitemap.xml` | All routes |
| `llms.txt` | LLM / agent install guidance |
| `agents.txt` | Short agent policy |
| `humans.txt` | Credits |
| `.well-known/security.txt` | Security contact |
| `_redirects` / `404.html` / `web.config` | SPA fallbacks |

## Pages

Home, Tutorial (8 live demos), Use cases (8 sectors / 35+ scenarios), Getting started, Python, JavaScript, Security, For agents, Compare, FAQ.
