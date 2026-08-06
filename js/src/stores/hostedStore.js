/**
 * admitiq/stores/hostedStore — optional hosted revocation store.
 *
 * Calls the AdmitiQ hosted API for multi-scanner single-use without Redis.
 * The core library never requires this.
 *
 *   const store = new HostedRevocationStore({ apiKey: process.env.ADMITIQ_API_KEY });
 *   await verify(token, SECRET, store.isRevoked.bind(store));
 *   await store.markUsed(payload.jti);
 */
class HostedRevocationStore {
  /**
   * @param {object} options
   * @param {string} options.apiKey
   * @param {string} [options.baseUrl="https://api.admitiq.logiclitz.org"]
   * @param {typeof fetch} [options.fetchImpl]
   */
  constructor({
    apiKey,
    baseUrl = "https://api.admitiq.logiclitz.org",
    fetchImpl = globalThis.fetch,
  } = {}) {
    if (!apiKey) throw new Error("HostedRevocationStore requires apiKey");
    if (!fetchImpl) throw new Error("HostedRevocationStore requires fetch (Node 18+)");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchImpl = fetchImpl;
  }

  async _post(path, body) {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `hosted_http_${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async markUsed(jti) {
    const data = await this._post("/v1/tokens/consume", { jti });
    return Boolean(data.first);
  }

  async isRevoked(jti) {
    const data = await this._post("/v1/tokens/check", { jti });
    return Boolean(data.revoked);
  }

  async unrevoke(jti) {
    const data = await this._post("/v1/tokens/unrevoke", { jti });
    return Boolean(data.unrevoked);
  }
}

module.exports = { HostedRevocationStore };
