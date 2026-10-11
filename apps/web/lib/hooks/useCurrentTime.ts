"use client";
import { useState, useEffect } from "react";

/**
 * Returns current timestamp in milliseconds, deferred until client mount
 * to prevent Next.js 16 prerender errors (blocking-prerender-current-time-client).
 */
export function useCurrentTime() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

export function isBreachedSafe(deadline?: string | null, now?: number | null): boolean {
  if (!deadline || now == null) return false;
  return new Date(deadline).getTime() < now;
}
