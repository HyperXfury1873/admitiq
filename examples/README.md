# Examples

Copy-paste demos. Run them from this repo after installing the local packages.

| Example | What it shows |
|---------|----------------|
| [express-ticket-check](express-ticket-check/) | Issue + scan tickets with Express |
| [flask-attendance](flask-attendance/) | Issue + scan attendance codes with Flask |
| [cross-language](cross-language/) | Python issues → Node verifies (and reverse) |

## Quick setup

```bash
# Python package (for Flask + cross-language)
cd python && pip install -e ".[dev]"

# JS package (for Express + cross-language)
cd ../js   # already usable via require("../..") paths in examples
```
