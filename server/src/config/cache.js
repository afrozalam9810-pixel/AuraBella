/**
 * cache.js
 * Lightweight in-process TTL cache for AuraBella's API server.
 *
 * Why in-process instead of Redis?
 *   Redis requires an additional hosted service and secrets management.
 *   For a single-instance deployment (Railway/Render) an in-process Map-based
 *   LRU cache eliminates 80-90% of repeated DB queries with zero infrastructure
 *   cost. When you scale to multiple instances, swap the `store` map for a
 *   Redis client by implementing the same get/set/del interface.
 *
 * Usage:
 *   const cache = require("./cache");
 *   const data = cache.get("categories");
 *   if (!data) {
 *     const fresh = await fetchFromDB();
 *     cache.set("categories", fresh, 300); // 300 s TTL
 *   }
 */

const DEFAULT_TTL_SECONDS = 60; // 1 minute

class TtlCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this.store = new Map();

    // Purge expired entries every minute to prevent unbounded growth
    this._interval = setInterval(() => this._purge(), 60_000).unref();
  }

  /**
   * Retrieve a cached value. Returns `undefined` if the key is missing or expired.
   * @param {string} key
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Store a value with an optional TTL.
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlSeconds]
   */
  set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1_000,
    });
  }

  /**
   * Remove a specific key (e.g. on mutation so stale data is not served).
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys that start with a given prefix.
   * Useful for busting grouped caches (e.g. "products:*").
   * @param {string} prefix
   */
  delByPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Flush the entire cache (e.g. during tests or forced refresh). */
  flush() {
    this.store.clear();
  }

  /** Remove all expired entries. Called automatically on an interval. */
  _purge() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  /** Current number of live (non-expired) cache entries. */
  get size() {
    this._purge();
    return this.store.size;
  }
}

// Export a singleton — same instance shared across all imports
module.exports = new TtlCache();
