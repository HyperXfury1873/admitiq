# AdmitiQ landing page (interactive tutorial)

The landing page is a small React app that teaches AdmitiQ with a live demo: issue tokens, show QR / URL, scan, and see tamper / reuse fail.

## View it online (recommended)

After GitHub Pages is enabled (one-time setup below), open:

**https://hyperxfury1873.github.io/admitiq/**

That URL is the best “try before you install” link for humans and for README / PyPI / npm pages.

## Run it on your computer

```powershell
cd D:\LogicLitz_Projects\qrlock\qrlock\admitiq-landing
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

Source of truth for the UI:

- Editable app: `admitiq-landing/src/AdmitiQLanding.jsx`
- Mirror copy: `landing/AdmitiQLanding.jsx` (keep in sync if you edit either)

## One-time: turn on GitHub Pages

1. Open https://github.com/HyperXfury1873/admitiq/settings/pages  
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**  
3. Push to `main` (the workflow `.github/workflows/pages.yml` builds `admitiq-landing` and deploys it)

Or trigger manually:

```powershell
gh workflow run pages.yml
```

## Share the landing everywhere

Put this link in:

- GitHub repo **About** → Website  
- PyPI project description / README  
- npm `homepage` field (already pointed at the Pages URL when published)  
- Social posts and demos  

Humans get a visual tutorial; AI assistants and crawlers that follow README links can discover install + usage from the same place.
