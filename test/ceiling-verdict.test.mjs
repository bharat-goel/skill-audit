import { test } from "node:test";
import assert from "node:assert/strict";
import { ceilingVerdict } from "../tools/ceiling-verdict.mjs";

// Author's own interval for otel-go's claim: 0/3 vs 3/3, newcombe(0,3,3,3) from
// nullbench's src/stats.mjs (recomputed and pinned here as a literal so this test does
// not depend on nullbench being importable): [+20.591, +100].
const AUTHOR = { lo: 20.5910, hi: 100 };

test("review table: 0/10 vs 10/10 (perfect sweep) — holds", () => {
  // newcombe(0,10,10,10) -> [60.7499, 100]
  assert.equal(ceilingVerdict({ audit: { lo: 60.7499, hi: 100 }, author: AUTHOR }), "claim holds");
});

test("review table: 0/10 vs 9/10 (one control failure) — holds against the author's own interval", () => {
  // newcombe(0,10,9,10) -> [48.8248, 98.2124]. Old point rule (verdict.mjs against
  // claimPp:100) reported "claim not reproduced" here even though this interval sits
  // entirely inside the author's own [20.6, 100] — exactly what this tool exists to fix.
  assert.equal(ceilingVerdict({ audit: { lo: 48.8248, hi: 98.2124 }, author: AUTHOR }), "claim holds");
});

test("review table: 1/10 vs 10/10 (one treatment failure) — holds", () => {
  // newcombe(1,10,10,10) -> [48.8248, 98.2124], same interval as the row above.
  assert.equal(ceilingVerdict({ audit: { lo: 48.8248, hi: 98.2124 }, author: AUTHOR }), "claim holds");
});

test("review table: 0/10 vs 8/10 — holds", () => {
  // newcombe(0,10,8,10) -> [38.4030, 94.3319]
  assert.equal(ceilingVerdict({ audit: { lo: 38.4030, hi: 94.3319 }, author: AUTHOR }), "claim holds");
});

test("wrong-direction result (control beats treatment): not reproduced", () => {
  // newcombe(9,10,2,10) -> [-86.5181, -26.5818]
  assert.equal(ceilingVerdict({ audit: { lo: -86.5181, hi: -26.5818 }, author: AUTHOR }), "claim not reproduced");
});

test("weak effect that includes zero: inconclusive, not holds", () => {
  // newcombe(4,10,5,10) -> [-28.98, 45.09]: overlaps the author interval, but does not
  // exclude zero, so it must not read as "holds" merely because it overlaps.
  assert.equal(ceilingVerdict({ audit: { lo: -28.98, hi: 45.0894 }, author: AUTHOR }), "inconclusive");
});

test("positive but below the author's own floor: not reproduced", () => {
  // Excludes zero, but the whole interval sits below what the author's own n=3 data
  // support — the audit found *something*, but not enough to be consistent with the claim.
  assert.equal(ceilingVerdict({ audit: { lo: 5, hi: 15 }, author: AUTHOR }), "claim not reproduced");
});

// --- Boundary / mutation-resistance tests -----------------------------------------
// Each pair below straddles one comparison operator in ceilingVerdict by an epsilon, so
// flipping that operator's direction or strictness (a classic mutation) flips at least
// one of these two results.

test("boundary: audit.lo exactly 0 does not exclude zero — not 'holds' even with overlap", () => {
  // a.lo > 0 is false at exactly 0; overlap and hi>=0 both hold, so this falls through
  // to 'inconclusive', not 'claim holds'. Catches a '>' -> '>=' mutant.
  assert.equal(ceilingVerdict({ audit: { lo: 0, hi: 60 }, author: AUTHOR }), "inconclusive");
});

test("boundary: audit.lo just above 0 with overlap — holds", () => {
  assert.equal(ceilingVerdict({ audit: { lo: 0.0001, hi: 60 }, author: AUTHOR }), "claim holds");
});

test("boundary: audit.hi exactly equal to author.lo counts as overlap — holds", () => {
  // b.lo <= a.hi is true at equality. Catches a '<=' -> '<' mutant on the overlap check.
  assert.equal(ceilingVerdict({ audit: { lo: 1, hi: 20.5910 }, author: AUTHOR }), "claim holds");
});

test("boundary: audit.hi just below author.lo — not reproduced", () => {
  assert.equal(ceilingVerdict({ audit: { lo: 1, hi: 20.5909 }, author: AUTHOR }), "claim not reproduced");
});

test("boundary: audit.hi exactly 0, author interval spans zero — inconclusive, not 'not reproduced'", () => {
  // hi < 0 is false at exactly 0. Author interval here includes negative values so the
  // hi<author.lo branch also does not fire; isolates the 'hi < 0' comparison itself.
  const authorSpansZero = { lo: -50, hi: 100 };
  assert.equal(ceilingVerdict({ audit: { lo: -30, hi: 0 }, author: authorSpansZero }), "inconclusive");
});

test("boundary: audit.hi just below 0, same author interval — not reproduced", () => {
  const authorSpansZero = { lo: -50, hi: 100 };
  assert.equal(ceilingVerdict({ audit: { lo: -30, hi: -0.0001 }, author: authorSpansZero }), "claim not reproduced");
});

test("disjoint intervals entirely above the author's (asymmetric case, documented): inconclusive", () => {
  // ceilingVerdict implements the ruling's exact rule, which only names audit.hi <
  // author.lo as a 'not reproduced' condition — it does not name the mirror case
  // (audit entirely above author). That asymmetry is intentional here: this tool is
  // scoped to a claim whose author interval's upper bound is the 100pp ceiling, so an
  // audit interval can never sit entirely above it. Documented, not silently assumed.
  assert.equal(ceilingVerdict({ audit: { lo: 25, hi: 30 }, author: { lo: 10, hi: 20 } }), "inconclusive");
});

test("rejects an inverted or non-finite interval", () => {
  assert.throws(() => ceilingVerdict({ audit: { lo: 10, hi: 5 }, author: AUTHOR }), /inverted/);
  assert.throws(() => ceilingVerdict({ audit: { lo: NaN, hi: 5 }, author: AUTHOR }), /finite/);
  assert.throws(() => ceilingVerdict({ audit: AUTHOR, author: { lo: 5, hi: NaN } }), /finite/);
  assert.throws(() => ceilingVerdict({ audit: null, author: AUTHOR }), /must be an object/);
});
