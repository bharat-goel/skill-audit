import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verdictForTask } from "../tools/verdict-task.mjs";

// A stand-in for nullbench's newcombe(kC, nC, kT, nT) -> { lo, hi } as fractions.
// The CLI test below exercises the real one.
const fakeNewcombe = (kC, nC, kT, nT) => {
  const delta = kT / nT - kC / nC;
  return { lo: delta - 0.05, hi: delta + 0.05 };
};

function rec(task, cond, pass, failed = false) {
  return { task, cond, pass, failed };
}

test("counts k/n per arm from graded records only, dead runs excluded", () => {
  const records = [
    rec("t1", "control", true),
    rec("t1", "control", false),
    rec("t1", "control", true, true), // dead: must not count
    rec("t1", "treatment", true),
    rec("t1", "treatment", true),
    rec("t1", "treatment", false, true), // dead: must not count
    rec("other-task", "control", true), // different task: must not count
  ];
  const r = verdictForTask({ records, taskId: "t1", claimPp: 20, newcombe: fakeNewcombe });
  assert.equal(r.kC, 1);
  assert.equal(r.nC, 2);
  assert.equal(r.kT, 2);
  assert.equal(r.nT, 2);
});

test("a missing taskId throws", () => {
  const records = [rec("t1", "control", true), rec("t1", "treatment", true)];
  assert.throws(() => verdictForTask({ records, taskId: "nope", claimPp: 20, newcombe: fakeNewcombe }), /nope/);
});

test("a task with records on only one arm throws", () => {
  const records = [rec("t1", "control", true), rec("t1", "control", false)];
  assert.throws(() => verdictForTask({ records, taskId: "t1", claimPp: 20, newcombe: fakeNewcombe }), /t1/);
});

// Constructed against the REAL newcombe (kC=0, nC=6, kT=3, nT=6): the true lower bound
// is +0.0047pp, which report.md's one-decimal pp() would round to "+0.0pp" and a reader
// would take as inconclusive. Reading raw counts instead of the rounded report text is
// the entire point of this tool -- it must still say "claim holds".
test("a true lower bound that rounds to +0.0pp in the report still holds, via the real newcombe", async () => {
  const { newcombe } = await import("../../nullbench/src/stats.mjs");
  const records = [
    ...Array.from({ length: 6 }, () => rec("t1", "control", false)),
    ...Array.from({ length: 3 }, () => rec("t1", "treatment", true)),
    ...Array.from({ length: 3 }, () => rec("t1", "treatment", false)),
  ];
  const r = verdictForTask({ records, taskId: "t1", claimPp: 40, newcombe });
  assert.ok(r.lo > 0, `expected lo > 0, got ${r.lo}`);
  assert.equal(r.lo.toFixed(1), "0.0", "the report's one-decimal rounding would print +0.0pp");
  assert.equal(r.verdict, "claim holds");
});

test("CLI prints the result as JSON, reading records.json from a results dir", () => {
  const dir = mkdtempSync(join(tmpdir(), "verdict-task-"));
  mkdirSync(dir, { recursive: true });
  const records = [
    rec("t1", "control", true), rec("t1", "control", false),
    rec("t1", "treatment", true), rec("t1", "treatment", true),
  ];
  writeFileSync(join(dir, "records.json"), JSON.stringify({ records }));
  const r = spawnSync(process.execPath, ["tools/verdict-task.mjs", dir, "t1", "20"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.kC, 1);
  assert.equal(out.nC, 2);
  assert.equal(out.kT, 2);
  assert.equal(out.nT, 2);
  assert.ok(["claim holds", "claim not reproduced", "inconclusive"].includes(out.verdict));
});
