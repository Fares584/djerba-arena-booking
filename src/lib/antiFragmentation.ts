export function timeToMinutes(timeStr: string): number {
  const [hRaw, mRaw] = timeStr.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/**
 * Returns the most common remainder (modulo) among the provided start times.
 * Useful for anti-fragmentation on 30-min grids with fixed durations (ex: 90min).
 */
export function getDominantStartModulo(
  startTimes: Array<string | null | undefined>,
  moduloMinutes: number
): number | null {
  const mod = Math.abs(moduloMinutes);
  if (!mod) return null;

  const counts = new Map<number, number>();
  for (const t of startTimes) {
    if (!t) continue;
    const mins = timeToMinutes(t);
    const r = ((mins % mod) + mod) % mod;
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }

  if (counts.size === 0) return null;

  let best: number | null = null;
  let bestCount = -1;
  for (const [r, c] of counts) {
    if (c > bestCount) {
      best = r;
      bestCount = c;
    }
  }

  return best;
}
