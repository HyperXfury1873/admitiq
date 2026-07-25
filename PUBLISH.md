# Publishing AdmitiQ (`admitiq`) to npm and PyPI

This is the checklist to make `npm install admitiq` and `pip install admitiq` work for everyone.

Do **TestPyPI / npm dry-run first**. Do not skip account setup.

---

## Before you publish (once)

1. Create the public GitHub repo: `https://github.com/logiclitz/admitiq`
2. Push this monorepo (`python/`, `js/`, `docs/`, etc.)
3. Confirm CI is green (`.github/workflows/ci.yml`)
4. Version in both packages matches (currently **0.3.0**):
   - `python/pyproject.toml` → `version`
   - `js/package.json` → `version`
   - `python/admitiq/__init__.py` → `__version__`

---

## Publish to PyPI (Python)

### 1. Accounts & tools

1. Create an account on [https://pypi.org](https://pypi.org) (and [https://test.pypi.org](https://test.pypi.org) for practice)
2. Enable 2FA
3. Create an **API token** (PyPI → Account settings → API tokens)
4. Install build tools:

```bash
python -m pip install --upgrade build twine
```

### 2. Build the package

```bash
cd python
python -m build
```

This creates `dist/` with a `.whl` and a `.tar.gz`.

### 3. Dry run on TestPyPI (recommended)

```bash
python -m twine upload --repository testpypi dist/*
```

Then try:

```bash
pip install -i https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ admitiq==0.3.0
```

### 4. Publish for real

```bash
cd python
rm -rf dist build *.egg-info   # clean old builds (Windows: Remove-Item -Recurse -Force dist, build)
python -m build
python -m twine upload dist/*
```

When prompted, username is `__token__` and password is your PyPI API token (including the `pypi-` prefix).

### 5. Verify

```bash
pip install admitiq
python -c "from admitiq import issue, verify; print(verify(issue({'ok': True}, 60, 's'), secret='s')['data'])"
```

---

## Publish to npm (JavaScript)

### 1. Account

1. Create an account on [https://www.npmjs.com](https://www.npmjs.com)
2. Enable 2FA
3. Log in locally:

```bash
npm login
```

### 2. Dry run (see what would be published)

```bash
cd js
npm pack --dry-run
```

Optional: create a local tarball and install it in a throwaway folder:

```bash
npm pack
# produces admitiq-0.3.0.tgz
```

### 3. Publish

```bash
cd js
npm publish --access public
```

(Use `--access public` the first time if the scope/package would otherwise be private.)

### 4. Verify

```bash
npm install admitiq
node -e "const {issue,verify}=require('admitiq'); verify(issue({ok:true},60,'s'),'s').then(p=>console.log(p.data))"
```

---

## After publishing

- [ ] Update both READMEs: remove “not published yet” notes if any remain
- [ ] Add version badges (optional): Shields.io for npm + PyPI
- [ ] Tag the git release: `git tag v0.3.0 && git push --tags`
- [ ] Deploy the landing page (`landing/` or `admitiq-landing/`) and link install commands
- [ ] Announce (HN / Product Hunt / etc.) — see `TASKS.md` Phase 2

---

## Bumping a new version later

1. Change version in `python/pyproject.toml`, `python/admitiq/__init__.py`, `js/package.json`
2. Update `CHANGELOG.md` (create one if needed)
3. Run both test suites
4. Commit, tag, rebuild, upload/publish again

Never reuse a version number that already exists on PyPI or npm.
