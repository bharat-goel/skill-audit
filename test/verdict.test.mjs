import { test } from "node:test";
import assert from "node:assert/strict";
import { verdict } from "../tools/verdict.mjs";

test("interval contains the claim and excludes zero: holds", () => {
  assert.equal(verdict({ claimPp: 40, lo: 12.1, hi: 61.3 }), "claim holds");
});

test("interval contains both zero and the claim: inconclusive", () => {
  assert.equal(verdict({ claimPp: 20, lo: -8.5, hi: 44.0 }), "inconclusive");
});

test("a real effect smaller than claimed is not a reproduction", () => {
  assert.equal(verdict({ claimPp: 70, lo: 5.0, hi: 40.0 }), "claim not reproduced");
});

test("an interval wholly on the wrong side of zero: not reproduced", () => {
  assert.equal(verdict({ claimPp: 30, lo: -50, hi: -2 }), "claim not reproduced");
});

test("a claim outside an interval that spans zero: not reproduced", () => {
  assert.equal(verdict({ claimPp: 80, lo: -20, hi: 30 }), "claim not reproduced");
});

test("negative claims mirror positive ones", () => {
  assert.equal(verdict({ claimPp: -25, lo: -40, hi: -10 }), "claim holds");
  assert.equal(verdict({ claimPp: -25, lo: -40, hi: 5 }), "inconclusive");
});

test("a claim on the interval boundary counts as contained", () => {
  assert.equal(verdict({ claimPp: 40, lo: 10, hi: 40 }), "claim holds");
});

test("a zero or non-finite claim, or a bad interval, is refused", () => {
  assert.throws(() => verdict({ claimPp: 0, lo: -1, hi: 1 }), /claim/);
  assert.throws(() => verdict({ claimPp: NaN, lo: -1, hi: 1 }), /claim/);
  assert.throws(() => verdict({ claimPp: 10, lo: 5, hi: 1 }), /interval/);
  assert.throws(() => verdict({ claimPp: 10, lo: -Infinity, hi: 1 }), /interval/);
});
