import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verdictForTask, pooledVerdictForTasks } from "../tools/verdict-task.mjs";

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

test("pooled: counts equal the per-task sums, dead runs excluded", () => {
  const records = [
    rec("t1", "control", true),
    rec("t1", "control", false),
    rec("t1", "control", true, true), // dead: must not count
    rec("t1", "treatment", true),
    rec("t1", "treatment", true),
    rec("t1", "treatment", false, true), // dead: must not count
    rec("t2", "control", true),
    rec("t2", "control", false),
    rec("t2", "treatment", true),
  ];
  const r = pooledVerdictForTasks({ records, taskIds: ["t1", "t2"], claimPp: 20, newcombe: fakeNewcombe });
  assert.equal(r.kC, 2);
  assert.equal(r.nC, 4);
  assert.equal(r.kT, 3);
  assert.equal(r.nT, 3);
  assert.deepEqual(r.perTask, [
    { taskId: "t1", kC: 1, nC: 2, kT: 2, nT: 2 },
    { taskId: "t2", kC: 1, nC: 2, kT: 1, nT: 1 },
  ]);
});

// Unequal n and skewed per-task rates: summing counts and averaging per-task rates give
// different answers here on purpose, so this test tells the two pooling methods apart
// (a same-n, same-rate fixture cannot -- see the mutation check in the task report).
test("pooled: counts are the weighted sum, not an unweighted average of per-task rates", () => {
  const records = [
    rec("t1", "control", false), // t1: kC=0, nC=1
    rec("t2", "control", true), rec("t2", "control", true), rec("t2", "control", true),
    rec("t2", "control", true), rec("t2", "control", true), rec("t2", "control", true),
    rec("t2", "control", true), rec("t2", "control", true), rec("t2", "control", true), // t2: kC=9, nC=9
    rec("t1", "treatment", true), // t1: kT=1, nT=1
    rec("t2", "treatment", false), rec("t2", "treatment", false), rec("t2", "treatment", false),
    rec("t2", "treatment", false), rec("t2", "treatment", false), rec("t2", "treatment", false),
    rec("t2", "treatment", false), rec("t2", "treatment", false), rec("t2", "treatment", false), // t2: kT=0, nT=9
  ];
  const r = pooledVerdictForTasks({ records, taskIds: ["t1", "t2"], claimPp: 20, newcombe: fakeNewcombe });
  // Weighted sum: kC = 0+9 = 9, nC = 1+9 = 10. An unweighted average of per-task rates
  // (0/1 and 9/9 -> mean 0.5) times nC would give kC = 5, not 9.
  assert.equal(r.kC, 9);
  assert.equal(r.nC, 10);
  // Weighted sum: kT = 1+0 = 1, nT = 1+9 = 10. Average of rates (1/1 and 0/9 -> mean 0.5)
  // times nT would give kT = 5, not 1.
  assert.equal(r.kT, 1);
  assert.equal(r.nT, 10);
});

test("pooled: interval equals newcombe on the summed counts, via the real newcombe", async () => {
  const { newcombe } = await import("../../nullbench/src/stats.mjs");
  const records = [
    ...Array.from({ length: 5 }, () => rec("t1", "control", false)),
    ...Array.from({ length: 1 }, () => rec("t1", "control", true)),
    ...Array.from({ length: 2 }, () => rec("t1", "treatment", false)),
    ...Array.from({ length: 4 }, () => rec("t1", "treatment", true)),
    ...Array.from({ length: 5 }, () => rec("t2", "control", false)),
    ...Array.from({ length: 1 }, () => rec("t2", "control", true)),
    ...Array.from({ length: 2 }, () => rec("t2", "treatment", false)),
    ...Array.from({ length: 4 }, () => rec("t2", "treatment", true)),
  ];
  const r = pooledVerdictForTasks({ records, taskIds: ["t1", "t2"], claimPp: 30, newcombe });
  const expected = newcombe(2, 12, 8, 12);
  assert.ok(Math.abs(r.lo - expected.lo * 100) < 1e-9);
  assert.ok(Math.abs(r.hi - expected.hi * 100) < 1e-9);
});

test("pooled: two tasks each alone inconclusive, pooled claim holds", async () => {
  const { newcombe } = await import("../../nullbench/src/stats.mjs");
  const cell = (taskId) => [
    ...Array.from({ length: 5 }, () => rec(taskId, "control", false)),
    ...Array.from({ length: 1 }, () => rec(taskId, "control", true)),
    ...Array.from({ length: 2 }, () => rec(taskId, "treatment", false)),
    ...Array.from({ length: 4 }, () => rec(taskId, "treatment", true)),
  ];
  const records = [...cell("t1"), ...cell("t2")];
  const claimPp = 30;

  const single1 = verdictForTask({ records, taskId: "t1", claimPp, newcombe });
  const single2 = verdictForTask({ records, taskId: "t2", claimPp, newcombe });
  assert.equal(single1.verdict, "inconclusive");
  assert.equal(single2.verdict, "inconclusive");

  const pooled = pooledVerdictForTasks({ records, taskIds: ["t1", "t2"], claimPp, newcombe });
  assert.equal(pooled.verdict, "claim holds");
});

test("pooled: records for tasks outside taskIds are ignored", () => {
  const records = [
    rec("t1", "control", true),
    rec("t1", "control", false),
    rec("t1", "treatment", true),
    rec("t1", "treatment", true),
    rec("harm-task", "control", true),
    rec("harm-task", "treatment", false),
  ];
  const r = pooledVerdictForTasks({ records, taskIds: ["t1"], claimPp: 20, newcombe: fakeNewcombe });
  assert.equal(r.kC, 1);
  assert.equal(r.nC, 2);
  assert.equal(r.kT, 2);
  assert.equal(r.nT, 2);
});

test("pooled: a taskId with no records at all throws, naming the id", () => {
  const records = [rec("t1", "control", true), rec("t1", "treatment", true)];
  assert.throws(
    () => pooledVerdictForTasks({ records, taskIds: ["t1", "nope"], claimPp: 20, newcombe: fakeNewcombe }),
    /nope/,
  );
});

test("pooled: empty taskIds throws", () => {
  const records = [rec("t1", "control", true), rec("t1", "treatment", true)];
  assert.throws(() => pooledVerdictForTasks({ records, taskIds: [], claimPp: 20, newcombe: fakeNewcombe }), /empty/i);
});

test("pooled: duplicate taskIds throws", () => {
  const records = [rec("t1", "control", true), rec("t1", "treatment", true)];
  assert.throws(
    () => pooledVerdictForTasks({ records, taskIds: ["t1", "t1"], claimPp: 20, newcombe: fakeNewcombe }),
    /duplicate/i,
  );
});

test("CLI --pooled prints the pooled result as JSON, reading records.json from a results dir", () => {
  const dir = mkdtempSync(join(tmpdir(), "verdict-task-pooled-"));
  mkdirSync(dir, { recursive: true });
  const records = [
    rec("t1", "control", true), rec("t1", "control", false),
    rec("t1", "treatment", true), rec("t1", "treatment", true),
    rec("t2", "control", true), rec("t2", "control", false),
    rec("t2", "treatment", true), rec("t2", "treatment", false),
  ];
  writeFileSync(join(dir, "records.json"), JSON.stringify({ records }));
  const r = spawnSync(process.execPath, ["tools/verdict-task.mjs", dir, "--pooled", "20", "t1", "t2"], {
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.kC, 2);
  assert.equal(out.nC, 4);
  assert.equal(out.kT, 3);
  assert.equal(out.nT, 4);
  assert.ok(["claim holds", "claim not reproduced", "inconclusive"].includes(out.verdict));
  assert.equal(out.perTask.length, 2);
});
