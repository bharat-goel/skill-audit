// Assigns one task's verdict from the author's claimed delta and the measured
// Newcombe interval, both in percentage points. Written and tested before any data
// exists, so an arguable case cannot be decided generously at write-up time --
// nullbench FAILURES.md entry 12, applied to the auditor.
export function verdict({ claimPp, lo, hi }) {
  if (!Number.isFinite(claimPp) || claimPp === 0) {
    throw new Error(`claim must be a finite, non-zero delta; got ${claimPp}`);
  }
  // Claims are recorded in nullbench's direction (treatment minus control pass rate):
  // every author task registers predict: helps, so a claimed improvement is always
  // positive in this frame. A negative claimPp is not "the same claim mirrored" --
  // it is a different, unstated direction, and deciding a direction here would be
  // exactly the write-up-time judgement call this tool exists to avoid.
  if (claimPp < 0) {
    throw new Error(
      `claim must be a positive delta; restate the claim as a change in pass rate ` +
        `(treatment − control), got ${claimPp}`,
    );
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) {
    throw new Error(`bad interval [${lo}, ${hi}]`);
  }
  const containsClaim = lo <= claimPp && claimPp <= hi;
  if (!containsClaim) return "claim not reproduced";
  const excludesZeroInClaimedDirection = claimPp > 0 ? lo > 0 : hi < 0;
  return excludesZeroInClaimedDirection ? "claim holds" : "inconclusive";
}
