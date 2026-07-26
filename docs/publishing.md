# Publishing AdmitiQ (npm + PyPI)

**Are you a library user?** You do **not** need this page. Just install:

```bash
pip install admitiq
# or
npm install admitiq
```

**Are you a maintainer** publishing a new version? Use the full checklist:

→ **[PUBLISH.md](../PUBLISH.md)** (step-by-step, including npm 2FA / OTP and TestPyPI gotchas)

## Quick facts

| Question | Answer |
|----------|--------|
| Package name | `admitiq` on both PyPI and npm |
| Python live? | Yes — https://pypi.org/project/admitiq/ |
| JavaScript live? | Check https://www.npmjs.com/package/admitiq |
| Interactive demo | https://admitiq.logiclitz.org |
| Source | https://github.com/HyperXfury1873/admitiq |

## Why publish fails (cheat sheet)

| Error | Meaning | Fix |
|-------|---------|-----|
| npm `E403` … Two-factor authentication … | Account needs OTP or a granular token with **Bypass 2FA** | `npm publish --access public --otp=XXXXXX` |
| `$env:NPM_TOKEN = …` but still 403 | Token was never written to `.npmrc` | Use `--otp`, or `npm config set "//registry.npmjs.org/:_authToken" "…"` |
| TestPyPI `403 Invalid … authentication` | Token was created on **pypi.org**, not **test.pypi.org** | Create a token on the matching site |
| PyPI username wrong | Must be `__token__` | Password = full `pypi-…` API token |

## Related links

- PyPI: https://pypi.org  
- TestPyPI: https://test.pypi.org  
- npm: https://www.npmjs.com  
- Landing / tutorial: https://admitiq.logiclitz.org  
- LogicLitz: https://logiclitz.org
