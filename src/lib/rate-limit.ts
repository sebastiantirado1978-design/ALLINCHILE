/**
 * Rate limiter en memoria por usuario / clave.
 * Suficiente para single-instance. Para multi-instance, migrar a Upstash Redis.
 */
type Bucket = { count: number; resetAt: number };

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private windowMs: number,
    private max: number,
  ) {}

  check(key: string): { allowed: boolean; resetInSec?: number; remaining?: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1 };
    }

    if (bucket.count >= this.max) {
      return { allowed: false, resetInSec: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count++;
    return { allowed: true, remaining: this.max - bucket.count };
  }

  /** Limpieza periódica de buckets expirados (llamar opcional desde un cron) */
  cleanup() {
    const now = Date.now();
    for (const [k, b] of this.buckets) {
      if (b.resetAt < now) this.buckets.delete(k);
    }
  }
}

// Limites preconfigurados
export const aiLimiter = new RateLimiter(5 * 60 * 1000, 30); // 30/5min
export const exportLimiter = new RateLimiter(60 * 1000, 10); // 10/min
export const inviteLimiter = new RateLimiter(60 * 60 * 1000, 50); // 50/hora
