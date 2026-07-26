# Publishing AdmitiQ to npm and PyPI

This guide is for **maintainers** who want `pip install admitiq` and `npm install admitiq` to work for everyone.

**Status today**

| Registry | Package | Status |
|----------|---------|--------|
| PyPI | [`admitiq`](https://pypi.org/project/admitiq/) | Published (`0.3.2`) |
| npm | `admitiq` | Not published yet (see § npm troubleshooting) |
| TestPyPI | practice only | Optional |

---

## Before you publish (once)

1. Repo is public: https://github.com/HyperXfury1873/admitiq  
2. CI is green on `main`  
3. Version matches everywhere (currently **0.3.2**):
   - `python/pyproject.toml` → `version`
   - `python/admitiq/__init__.py` → `__version__`
   - `js/package.json` → `version`

Never reuse a version that already exists on PyPI or npm.

---

## Publish to PyPI (Python)

### Why TestPyPI failed earlier

TestPyPI ([test.pypi.org](https://test.pypi.org)) and real PyPI ([pypi.org](https://pypi.org)) are **different websites with different accounts and different API tokens**.

A token from **pypi.org** will get `403 Invalid or non-existent authentication information` on TestPyPI. That is expected. Your real PyPI upload already succeeded.

### Publish for real (you already did this)

```powershell
cd D:\LogicLitz_Projects\qrlock\qrlock\python
python -m pip install --upgrade build twine
Remove-Item -Recurse -Force dist, build, *.egg-info -ErrorAction SilentlyContinue
python -m build
python -m twine upload dist/*
```

When prompted:

| Field | Value |
|-------|--------|
| Username | `__token__` (exactly that, with underscores) |
| Password | API token from https://pypi.org/manage/account/token/ (starts with `pypi-`) |

Verify:

```powershell
pip install admitiq==0.3.2
python -c "from admitiq import issue, verify; print(verify(issue({'ok': True}, 60, 's'), secret='s')['data'])"
```

### Optional: practice on TestPyPI

1. Create a **separate** account on https://test.pypi.org  
2. Create a token **on TestPyPI** (not on pypi.org)  
3. Upload:

```powershell
python -m twine upload --repository testpypi dist/*
```

---

## Publish to npm (JavaScript)

### What went wrong (and how to fix it)

npm now requires **2FA** to publish. Your account already has `two-factor auth: auth-and-writes` — good.

Two common mistakes:

1. **Setting `$env:NPM_TOKEN` alone does nothing.**  
   npm only uses a token if it is written into `.npmrc` (user or project). Without that file, `npm publish` keeps using your browser login and still demands 2FA / a proper token.

2. **PowerShell needs quotes around the token.**  
   Wrong: `$env:NPM_TOKEN = npm_xxxx` (PowerShell thinks `npm_xxxx` is a command)  
   Right: `$env:NPM_TOKEN = "npm_xxxx"`

3. **If you pasted a token into chat or a log, revoke it immediately** at https://www.npmjs.com/settings/~/tokens and create a new one.

### Easiest path: publish with a one-time password (OTP)

Use the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.):

```powershell
cd D:\LogicLitz_Projects\qrlock\qrlock\js
npm whoami
# should print: logiclitz

npm pack --dry-run
npm publish --access public --otp=123456
```

Replace `123456` with the **current** code from your app (codes expire every ~30 seconds).

If `npm whoami` fails, log in first:

```powershell
npm login
```

### Alternative path: granular token with Bypass 2FA

Use this for automation / CI, or if OTP keeps failing.

1. Open https://www.npmjs.com/settings/~/tokens  
2. **Generate new token** → **Granular Access Token**  
3. Set:
   - **Expiration**: short (e.g. 7–30 days) while testing  
   - **Packages**: Read and write (or “All packages” if the name does not exist yet)  
   - **Bypass two-factor authentication**: **ON** (required for non-interactive publish)  
4. Copy the token once. Do not commit it. Do not paste it into chat.

Then on your machine (PowerShell):

```powershell
cd D:\LogicLitz_Projects\qrlock\qrlock\js

# Put the token in your USER npmrc (not in the git repo)
npm config set "//registry.npmjs.org/:_authToken" "npm_YOUR_NEW_TOKEN_HERE"

npm publish --access public
```

Confirm it worked, then remove the token from the machine when done:

```powershell
npm config delete "//registry.npmjs.org/:_authToken"
```

Or revoke the token on the npm website.

### Verify after publish

```powershell
npm view admitiq version
npm install admitiq
node -e "const {issue,verify}=require('admitiq'); verify(issue({ok:true},60,'s'),'s').then(p=>console.log(p.data))"
```

Package page will be: https://www.npmjs.com/package/admitiq

---

## After both registries are live

1. Tag the release:

```powershell
git tag v0.3.2
git push origin v0.3.2
```

2. Confirm the [interactive landing](https://admitiq.logiclitz.org) is live (frontend-only static site — see `docs/landing.md`).
3. Announce (optional): HN / Product Hunt — see `TASKS.md`.

---

## Bumping a new version later

1. Bump version in `python/pyproject.toml`, `python/admitiq/__init__.py`, `js/package.json`  
2. Run both test suites  
3. Commit, tag, rebuild, upload/publish again  

Never reuse a version number that already exists on PyPI or npm.
