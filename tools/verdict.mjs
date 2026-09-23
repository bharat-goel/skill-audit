// Assigns one task's verdict from the author's claimed delta and the measured
// Newcombe interval, both in percentage points. Written and tested before any data
// exists, so an arguable case cannot be decided generously at write-up time --
// nullbench FAILURES.md entry 12, applied to the auditor.
export function verdict({ claimPp, lo, hi }) {
  if (!Number.isFinite(claimPp) || claimPp === 0) {
    throw new Error(`claim must be a finite, non-zero delta; got ${claimPp}`);
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) {
    throw new Error(`bad interval [${lo}, ${hi}]`);
  }
  const containsClaim = lo <= claimPp && claimPp <= hi;
  if (!containsClaim) return "claim not reproduced";
  const excludesZeroInClaimedDirection = claimPp > 0 ? lo > 0 : hi < 0;
  return excludesZeroInClaimedDirection ? "claim holds" : "inconclusive";
}
