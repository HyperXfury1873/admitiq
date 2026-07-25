/**
 * admitiq/stores/redisStore — optional Redis-backed revocation store.
 *
 * A ready-made, race-condition-safe "has this token been used" store for
 * anyone running multiple servers/processes checking the same tokens,
 * without needing the hosted AdmitiQ API. Still fully self-hosted and free.
 *
 * Requires the 'redis' package (node-redis v4+):
 *   npm install redis
 *
 * Usage:
 *   const client = redis.createClient({ url: 'redis://localhost:6379' });
 *   await client.connect();
 *   const store = new RedisRevocationStore({ client });
 *   const payload = await verify(token, SECRET, store.isRevoked.bind(store));
 *   // only after you've decided to actually honor this scan:
 *   await store.markUsed(payload.jti);
 */
class RedisRevocationStore {
  /**
   * @param {object} options
   * @param {object} options.client - an already-connected node-redis v4 client
   * @param {number} [options.ttlSeconds=86400] - how long to remember a used jti
   * @param {string} [options.prefix="admitiq:used:"]
   */
  constructor({ client, ttlSeconds = 86400, prefix = "admitiq:used:" } = {}) {
    if (!client) {
      throw new Error(
        "RedisRevocationStore requires an already-connected 'redis' client. " +
          "Install with: npm install redis — see README for setup."
      );
    }
    this.client = client;
    this.ttlSeconds = ttlSeconds;
    this.prefix = prefix;
  }

  /**
   * Atomically mark a token as used. Returns true if this was the FIRST time
   * (the scan should be allowed), false if already used (block as reuse).
   */
  async markUsed(jti) {
    const key = `${this.prefix}${jti}`;
    const result = await this.client.set(key, "1", { NX: true, EX: this.ttlSeconds });
    return result === "OK";
  }

  /** Pass this bound method directly as the isRevoked argument to verify(). */
  async isRevoked(jti) {
    const key = `${this.prefix}${jti}`;
    const exists = await this.client.exists(key);
    return exists > 0;
  }
}

module.exports = { RedisRevocationStore };
