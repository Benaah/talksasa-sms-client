/**
 * Rate Limiter for API calls
 * Prevents DoS attacks and ensures fair usage
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = {
    maxRequests: 100, // 100 requests
    windowMs: 60000,  // per minute
    blockDurationMs: 300000 // block for 5 minutes if exceeded
  }) {
    this.config = config;
  }

  /**
   * Check if request is allowed for given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Clean up expired entries
    this.cleanup(now);

    // If blocked, check if block period has expired
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // If no entry or window has expired, create new entry
    if (!entry || now >= entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    // If within window, check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      // Block the identifier
      entry.blockedUntil = now + this.config.blockDurationMs;
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return this.config.maxRequests;
    }

    const now = Date.now();
    if (now >= entry.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - entry.count);
  }

  /**
   * Get time until reset for identifier
   */
  getTimeUntilReset(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(now: number): void {
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime && (!entry.blockedUntil || now >= entry.blockedUntil)) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats
   */
  getStats(): { totalIdentifiers: number; config: RateLimitConfig } {
    return {
      totalIdentifiers: this.requests.size,
      config: this.config
    };
  }
}
