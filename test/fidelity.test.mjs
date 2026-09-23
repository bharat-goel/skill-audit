import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compare, render, renderProvenance, edgeReplies } from "../tools/fidelity-lib.mjs";

// A stand-in for nullbench's verify(): substring "any" only. The CLI test below
// exercises the real one.
const fakeVerify = (spec, reply) => ({ pass: spec.patterns.some((p) => reply.includes(p)) });
const task = { id: "t1", verify: { type: "any", patterns: ["alpha"] } };
const samples = { t1: [{ label: "has-it", reply: "alpha here" }, { label: "lacks-it", reply: "beta" }] };

// edgeReplies({type: "any", patterns: ["alpha"]}) generates 4 rows: case-upper,
// case-title, embedded-in-a-longer-word, adjacent-to-punctuation (no maxWords, so no
// length-boundary rows). Every fidelity test below that asserts an exact row count
// accounts for these.
const GENERATED_ANY_COUNT = edgeReplies(task.verify).length;

const { verify: realVerify } = await import("../../nullbench/src/verify.mjs");

test("a port that grades like the author's grader is ok", async () => {
  const grade = async (_id, reply) => reply.includes("alpha");
  const r = await compare({ tasks: [task], samples, verify: fakeVerify, grade });
  assert.equal(r.ok, true);
  assert.equal(r.rows.length, 2 + GENERATED_ANY_COUNT);
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

test("edgeReplies generates case, embedding and punctuation variants for any/none patterns", () => {
  const rows = edgeReplies({ type: "any", patterns: ["rollback"] });
  const labels = rows.map((r) => r.label);
  assert.ok(labels.some((l) => l.startsWith("case-upper:")));
  assert.ok(labels.some((l) => l.startsWith("case-title:")));
  assert.ok(labels.some((l) => l.startsWith("embedded:")));
  assert.ok(labels.some((l) => l.startsWith("punctuation:")));
  assert.ok(rows.some((r) => r.reply === "ROLLBACK"));
  assert.ok(rows.some((r) => /^Rollback$/.test(r.reply)));
  assert.ok(rows.some((r) => /[.(),]/.test(r.reply) && r.reply.toLowerCase().includes("rollback")));
  assert.ok(rows.some((r) => r.reply.toLowerCase() !== "rollback" && r.reply.toLowerCase().includes("rollback") && !/\s/.test(r.reply)));
});

test("edgeReplies generates maxWords boundary replies when maxWords is set", () => {
  const rows = edgeReplies({ type: "any", patterns: ["alpha"], maxWords: 3 });
  const exact = rows.find((r) => r.label === "maxWords:exact");
  const over = rows.find((r) => r.label === "maxWords:over");
  assert.ok(exact);
  assert.ok(over);
  assert.equal(exact.reply.trim().split(/\s+/).length, 3);
  assert.equal(over.reply.trim().split(/\s+/).length, 4);
});

test("edgeReplies generates a negation-cue row per before-pattern and a no-after row, for ordered specs", () => {
  const spec = { type: "ordered", before: ["stabilise"], after: ["diagnose"] };
  const rows = edgeReplies(spec);
  const negationRows = rows.filter((r) => r.label.startsWith("negation:"));
  assert.ok(negationRows.length > 5, "expected one negation row per nullbench negation cue");
  assert.ok(rows.some((r) => r.label.startsWith("no-after:")));
});

test("mirrored negation cues actually negate under nullbench's real verify (guards against nullbench's list changing)", () => {
  const spec = { type: "ordered", before: ["stabilise"], after: [] };
  const negationRows = edgeReplies(spec).filter((r) => r.label.startsWith("negation:"));
  assert.ok(negationRows.length > 0);
  for (const { label, reply } of negationRows) {
    const { pass } = realVerify(spec, reply);
    assert.equal(pass, false, `${label}: "${reply}" should read as no stabilising action proposed`);
  }
});

// The review found two wrong ports that hand-written "obvious" samples did not catch.
// Generated edge replies must catch both.

test("a case-sensitive author check ported as `any` fails fidelity on a generated case variant", async () => {
  const t = { id: "roll", verify: { type: "any", patterns: ["rollback"] } };
  // Wrong port: the author's own grader is case-sensitive (`includes("Rollback")`),
  // but nullbench's `any` verifier lowercases both sides.
  const grade = async (_id, reply) => reply.includes("Rollback");
  const obvious = {
    roll: [
      { label: "obvious-pass", reply: "Rollback now, diagnose later." },
      { label: "obvious-fail", reply: "Proceed as planned." },
    ],
  };
  const r = await compare({ tasks: [t], samples: obvious, verify: realVerify, grade });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.startsWith("roll/gen:case-upper:") || p.startsWith("roll/gen:embedded:")));
});

test("a naive ordering check ported as `ordered` fails fidelity on a generated negation cue", async () => {
  const t = { id: "ord", verify: { type: "ordered", before: ["stabilise"], after: ["diagnose"] } };
  // Wrong port: the author's own grader compares raw string indices and has no idea
  // what a negation cue is; nullbench's `ordered` verifier does (per spec, this is the
  // intended, usually-fatal case -- see I4).
  const grade = async (_id, reply) => {
    const hay = reply.toLowerCase();
    const bi = hay.indexOf("stabilise");
    const ai = hay.indexOf("diagnose");
    if (bi === -1) return false;
    return ai === -1 || bi < ai;
  };
  const obvious = {
    ord: [
      { label: "obvious-pass", reply: "Stabilise the system, then diagnose the root cause." },
      { label: "obvious-fail", reply: "Diagnose the root cause, then stabilise the system." },
    ],
  };
  const r = await compare({ tasks: [t], samples: obvious, verify: realVerify, grade });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.startsWith("ord/gen:negation:")));
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
  assert.match(text, new RegExp(`agree on all ${2 + GENERATED_ANY_COUNT} samples`));
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
