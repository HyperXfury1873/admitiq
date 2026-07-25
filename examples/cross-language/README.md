# Cross-language demo

Proves the main product claim: **Python issues → Node verifies** (and the reverse).

## Setup

```bash
# terminal 1 — Python package
cd python
pip install -e .

# from repo root
cd examples/cross-language
```

## Run

```bash
# 1) Python creates a token file
python issue_py.py

# 2) Node verifies that file
node verify_js.js

# 3) Node creates a token file
node issue_js.js

# 4) Python verifies that file
python verify_py.py
```

Shared secret is hard-coded as `shared-cross-lang-secret` for the demo only.
