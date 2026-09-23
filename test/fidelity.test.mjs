import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compare, render, renderProvenance } from "../tools/fidelity-lib.mjs";

// A stand-in for nullbench's verify(): substring "any" only. The CLI test below
// exercises the real one.
const fakeVerify = (spec, reply) => ({ pass: spec.patterns.some((p) => reply.includes(p)) });
const task = { id: "t1", verify: { type: "any", patterns: ["alpha"] } };
const samples = { t1: [{ label: "has-it", reply: "alpha here" }, { label: "lacks-it", reply: "beta" }] };

test("a port that grades like the author's grader is ok", async () => {
  const grade = async (_id, reply) => reply.includes("alpha");
  const r = await compare({ tasks: [task], samples, verify: fakeVerify, grade });
  assert.equal(r.ok, true);
  assert.equal(r.rows.length, 2);
  assert.deepEqual(r.problems, []);
});

test("one disagreement fails the check and names the sample", async () => {
  const grade = async () => true;
  const r = await compare({ tasks: [task], samples, verify: fakeVerify, grade });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("t1/lacks-it")));
});

test("samples must include one the author passes and one the author fails", async () => {
  const grade = async (_id, reply) => reply.includes("alpha");
  const onlyPass = { t1: [{ label: "has-it", reply: "alpha" }] };
  const r = await compare({ tasks: [task], samples: onlyPass, verify: fakeVerify, grade });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("no sample the author's grader fails")));
});

test("a deterministic task with no samples fails the check", async () => {
  const r = await compare({ tasks: [task], samples: {}, verify: fakeVerify, grade: async () => true });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("t1: no samples")));
});

test("judge tasks are skipped, and samples for them are a problem", async () => {
  const judged = { id: "j1", verify: { type: "judge", rubric: "x" } };
  const r = await compare({
    tasks: [judged],
    samples: { j1: [{ label: "x", reply: "y" }] },
    verify: () => { throw new Error("verify must not be called for judge tasks"); },
    grade: async () => true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.rows.length, 0);
  assert.ok(r.problems.some((p) => p.includes("j1: samples for a task")));
});

test("render marks disagreements and the overall result", async () => {
  const r = await compare({ tasks: [task], samples, verify: fakeVerify, grade: async () => true });
  const text = render(r);
  assert.match(text, /DIFF\s+t1\s+lacks-it/);
  assert.match(text, /RESULT: FAILED/);
});

test("zero deterministic tasks is a problem, not a vacuous pass", async () => {
  const judged = { id: "j1", verify: { type: "judge", rubric: "x" } };
  const r = await compare({ tasks: [judged], samples: {}, verify: fakeVerify, grade: async () => true });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("no deterministic tasks to compare")));
});

test("a grader that returns something other than a boolean is a problem, not a coercion", async () => {
  const grade = async () => "yes"; // truthy string, not a real boolean
  const r = await compare({ tasks: [task], samples, verify: fakeVerify, grade });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("t1/has-it") && p.includes("not a boolean")));
  assert.ok(r.problems.some((p) => p.includes("t1/lacks-it") && p.includes("not a boolean")));
});

test("renderProvenance prints the nullbench commit, verify.mjs hash, and each task file's hash", () => {
  const text = renderProvenance({
    nullbenchSha: "a".repeat(40),
    verifySha256: "b".repeat(64),
    tasks: [{ id: "t1", file: "tasks/t1.json", sha256: "c".repeat(64) }],
  });
  assert.match(text, new RegExp(`nullbench commit: ${"a".repeat(40)}`));
  assert.match(text, new RegExp(`verify\\.mjs sha256: ${"b".repeat(64)}`));
  assert.match(text, /t1 \(tasks\/t1\.json\): c{64}/);
});

function suite(graderBody) {
  const dir = mkdtempSync(join(tmpdir(), "fidelity-"));
  mkdirSync(join(dir, "tasks"));
  mkdirSync(join(dir, "fidelity"));
  writeFileSync(join(dir, "nullbench.json"), JSON.stringify({
    model: "sonnet", judge_model: "sonnet", reps: 10,
    tasks: [{ id: "t1", file: "tasks/t1.json", sha256: "0".repeat(64), kind: "signal", predict: "helps" }],
  }));
  writeFileSync(join(dir, "tasks", "t1.json"), JSON.stringify({ id: "t1", prompt: "p", ...task }));
  writeFileSync(join(dir, "fidelity", "samples.json"), JSON.stringify(samples));
  writeFileSync(join(dir, "fidelity", "author-grader.mjs"), graderBody);
  return dir;
}

test("CLI against the real nullbench verify: agreement exits 0 and writes fidelity.txt", () => {
  const dir = suite(`export async function grade(_id, reply) { return reply.toLowerCase().includes("alpha"); }`);
  const r = spawnSync(process.execPath, ["tools/fidelity.mjs", dir], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const text = readFileSync(join(dir, "fidelity", "fidelity.txt"), "utf8");
  assert.match(text, /agree on all 2 samples/);
  // I5: fidelity.txt begins with a provenance header so a later run can check it
  // still matches before spending on a paid call.
  assert.match(text, /^nullbench commit: [0-9a-f]{40}/);
  assert.match(text, /verify\.mjs sha256: [0-9a-f]{64}/);
  assert.match(text, /t1 \(tasks\/t1\.json\): [0-9a-f]{64}/);
});

test("CLI: disagreement exits 1", () => {
  const dir = suite(`export async function grade() { return true; }`);
  const r = spawnSync(process.execPath, ["tools/fidelity.mjs", dir], { encoding: "utf8" });
  assert.equal(r.status, 1);
});
