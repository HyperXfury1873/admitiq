/**
 * admitiq/url — embed tokens in URLs / deep links (and pull them back out).
 *
 * The token is still a plain signed string. These helpers only attach it to a
 * URL you provide (default query param: "token").
 */
const { issue } = require("./core");

const DEFAULT_PARAM = "token";

/**
 * Attach an existing token to a base URL.
 * @param {string} baseUrl - e.g. "https://example.com/scan" or "myapp://checkin"
 * @param {string} token - from issue()
 * @param {string} [param="token"] - query parameter name
 * @returns {string}
 */
function embedInUrl(baseUrl, token, param = DEFAULT_PARAM) {
  if (typeof baseUrl !== "string" || !baseUrl) {
    throw new Error("baseUrl must be a non-empty string");
  }
  if (typeof token !== "string" || !token) {
    throw new Error("token must be a non-empty string");
  }

  try {
    const absolute = new URL(baseUrl);
    absolute.searchParams.set(param, token);
    return absolute.toString();
  } catch {
    const hashIndex = baseUrl.indexOf("#");
    const withoutHash = hashIndex >= 0 ? baseUrl.slice(0, hashIndex) : baseUrl;
    const hash = hashIndex >= 0 ? baseUrl.slice(hashIndex) : "";
    const qIndex = withoutHash.indexOf("?");
    const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
    const existingQuery = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "";
    const params = new URLSearchParams(existingQuery);
    params.set(param, token);
    return `${path}?${params.toString()}${hash}`;
  }
}

/**
 * Issue a token and return a URL with it embedded.
 */
function issueUrl(baseUrl, payload, ttlSeconds, secret, param = DEFAULT_PARAM) {
  const token = issue(payload, ttlSeconds, secret);
  return embedInUrl(baseUrl, token, param);
}

/**
 * Extract a token from a URL (query param).
 * @returns {string}
 */
function tokenFromUrl(urlString, param = DEFAULT_PARAM) {
  if (typeof urlString !== "string" || !urlString) {
    throw new Error("url must be a non-empty string");
  }
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    parsed = new URL(urlString, "http://admitiq.local");
  }
  const token = parsed.searchParams.get(param);
  if (!token) {
    throw new Error(`No "${param}" query parameter found in URL`);
  }
  return token;
}

module.exports = {
  DEFAULT_PARAM,
  embedInUrl,
  issueUrl,
  tokenFromUrl,
};
