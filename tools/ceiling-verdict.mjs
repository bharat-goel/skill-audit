// Ceiling-adjusted verdict for a task whose author claim is a percentage-point delta at
// (or effectively at) the +100pp ceiling. tools/verdict.mjs's point-claim rule degenerates
// there: at claimPp=100, "claim holds" requires the measured interval to *contain* 100,
// which -- since no pass rate can exceed 100% -- only ever happens at a perfect n/n vs 0/n
// sweep. A near-perfect result (e.g. 0/10 vs 9/10, interval [+48.8, +98.2]) then reads as
// "claim not reproduced" even though it sits entirely inside the author's own n=3 interval
// for the same claim (0/3 vs 3/3, interval [+20.6, +100]). Under ollygarden's name, that
// would misreport an audit result consistent with their own evidence as a refutation of it.
//
// The fix compares the audit's interval against the AUTHOR'S OWN interval for their claim,
// not against the point value 100: an audit result is credited as holding the claim if it
// excludes zero (lo > 0) and is consistent with (overlaps) what the author's own n=3 data
// support, rather than requiring it to reproduce a perfect sweep exactly.
//
// This is deliberately narrower than a general two-sided interval comparison: it is written
// to the ruling's exact three-way rule, for a claim whose author interval's upper bound is
// the 100pp ceiling. It is not a general "do intervals disagree" tool -- see the ruling in
// progress.md ("otel-go review (opus)" section, Ruling (C-2)) for the reasoning, and
// DEVIATIONS.md for why otel-go uses this instead of tools/verdict.mjs's point rule while
// uap-release-analyzer and cds-code (whose claims are not at the ceiling, and whose
// registrations were frozen and run before this ruling existed) keep it.
//
// Units: percentage points throughout (matching tools/verdict.mjs's convention), not
// proportions in [0, 1].
export function ceilingVerdict({ audit, author }) {
  const checkInterval = (iv, name) => {
    if (iv == null || typeof iv !== "object") {
      throw new TypeError(`${name} must be an object with numeric lo/hi, got ${JSON.stringify(iv)}`);
    }
    const { lo, hi } = iv;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      throw new RangeError(`${name} interval must have finite lo/hi, got [${lo}, ${hi}]`);
    }
    if (lo > hi) {
      throw new RangeError(`${name} interval is inverted: lo (${lo}) > hi (${hi})`);
    }
    return { lo, hi };
  };

  const a = checkInterval(audit, "audit");
  const b = checkInterval(author, "author");

  // Two closed intervals overlap iff each one's low end is at or below the other's high
  // end. Touching endpoints count as overlap, the same inclusive convention nullbench's
  // own discriminates() uses for "touches zero" -- a boundary case is not treated as a
  // free pass to the stricter verdict.
  const overlaps = a.lo <= b.hi && b.lo <= a.hi;

  if (a.lo > 0 && overlaps) return "claim holds";
  if (a.hi < b.lo || a.hi < 0) return "claim not reproduced";
  return "inconclusive";
}
