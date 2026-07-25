# What is AdmitiQ?

## The problem (in one sentence)

A normal QR code is just text. Anyone can copy it and reuse it forever.

## The solution

**AdmitiQ** creates a short **signed token** (like a tiny digital ticket stub).
You can put it in a QR code, a URL, or anywhere else.

When someone presents it, your app asks AdmitiQ:

1. Was this token really made by us? (signature)
2. Is it still within the time limit? (expiry)
3. Optional: Has it already been used? (revocation / single-use)

If any check fails, you reject the scan.

Install it as the **`admitiq`** package (`pip install admitiq` / `npm install admitiq`).

## Simple picture

```text
┌─────────────┐     issue()      ┌──────────────────┐
│ Your data   │ ───────────────► │ Signed token     │ ──► print / show QR
│ seat, id…   │                  │ (expires later)  │
└─────────────┘                  └──────────────────┘
                                          │
                                          │ scan
                                          ▼
                                 ┌──────────────────┐
                                 │ verify()         │
                                 │ ✓ real           │
                                 │ ✓ not expired    │
                                 │ ✓ not used yet?  │
                                 └──────────────────┘
```

## Why it’s different

| Plain QR library | AdmitiQ |
|------------------|--------|
| Encodes text | Encodes a **signed** token |
| No expiry | Built-in expiry |
| No reuse check | Optional single-use / revoke |
| Usually QR only | **QR + URL** helpers (token works anywhere) |
| One language app | **Same token** works in Python *and* Node |

## Who is this for?

- Event tickets / check-in
- Class attendance
- One-time coupons
- Access passes

You do **not** need an AdmitiQ account or cloud server for the free library. Everything can run on your own machine.

## Who makes it?

AdmitiQ is a [LogicLitz](https://logiclitz.org) open-source project (MIT license).

## Next step

→ [Getting started](getting-started.md)
