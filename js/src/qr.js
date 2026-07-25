/**
 * admitiq/qr — optional QR image generation helpers.
 *
 * Requires the 'qrcode' package:
 *   npm install qrcode
 *
 * You can encode either a raw token or a full URL (from issueUrl / embedInUrl).
 */
const { issue } = require("./core");
const { issueUrl } = require("./url");

/**
 * Render a string (token or URL) as a QR code image.
 * @param {string} content - token or URL to encode
 * @param {string} [outputPath] - if provided, saves a PNG and returns the path;
 *   if omitted, returns a data URL string instead.
 */
async function generateQR(content, outputPath) {
  let QRCode;
  try {
    QRCode = require("qrcode");
  } catch (e) {
    throw new Error(
      "Generating QR images requires the 'qrcode' package. Install it with: npm install qrcode"
    );
  }

  if (outputPath) {
    await QRCode.toFile(outputPath, content);
    return outputPath;
  }
  return QRCode.toDataURL(content);
}

/**
 * Issue a token and render it as a QR image in one step.
 * @returns {Promise<{ token: string, qr: string }>} qr is a file path or data URL
 */
async function issueQR(payload, ttlSeconds, secret, outputPath) {
  const token = issue(payload, ttlSeconds, secret);
  const qr = await generateQR(token, outputPath);
  return { token, qr };
}

/**
 * Issue a token embedded in a URL, then render that URL as a QR image.
 * Scanning opens/carries the full link (useful for web check-in).
 * @returns {Promise<{ token: string, url: string, qr: string }>}
 */
async function issueUrlQR(baseUrl, payload, ttlSeconds, secret, outputPath, param) {
  const url = issueUrl(baseUrl, payload, ttlSeconds, secret, param);
  const { tokenFromUrl } = require("./url");
  const token = tokenFromUrl(url, param || "token");
  const qr = await generateQR(url, outputPath);
  return { token, url, qr };
}

module.exports = { generateQR, issueQR, issueUrlQR };
