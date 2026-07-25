/**
 * admitiq/express — drop-in Express middleware.
 *
 * Saves you the boilerplate of calling verify() by hand in every route.
 * This is optional — verify() alone works fine without it.
 */
const { verify } = require("./core");

/**
 * Build an Express middleware that verifies an AdmitiQ token and attaches the
 * decoded payload to `req.admitiq`.
 *
 * @param {object} options
 * @param {string} options.secret - HMAC secret (for core.issue/verify tokens)
 * @param {(jti: string) => (boolean|Promise<boolean>)} [options.isRevoked]
 * @param {(req: import('express').Request) => string} [options.getToken] -
 *   how to extract the token from the request. Defaults to `req.body.token`.
 *
 * @example
 *   const { admitiqMiddleware } = require('admitiq/express');
 *   app.post('/scan', admitiqMiddleware({ secret, isRevoked }), (req, res) => {
 *     res.json({ ok: true, data: req.admitiq.data });
 *   });
 */
function admitiqMiddleware({ secret, isRevoked, getToken } = {}) {
  if (!secret) {
    throw new Error("admitiqMiddleware requires a `secret`");
  }
  const extractToken = getToken || ((req) => req.body && req.body.token);

  return async function (req, res, next) {
    const token = extractToken(req);
    if (!token) {
      return res.status(400).json({ error: "Missing QR token" });
    }
    try {
      const payload = await verify(token, secret, isRevoked);
      req.admitiq = payload;
      next();
    } catch (err) {
      res.status(401).json({ error: err.message, type: err.constructor.name });
    }
  };
}

module.exports = { admitiqMiddleware };
