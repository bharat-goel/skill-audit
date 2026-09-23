# skill-audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-measure the published effect claims of three third-party Claude skills by porting each author's own eval into nullbench, and publish every result with the author's reply.

**Architecture:** Mostly procedure and data, not code. A few small Node tools carry the only logic that must be decided before data exists: `tools/verdict.mjs` (claim + interval → verdict), `tools/verdict-task.mjs` (a run's raw records → verdict, bypassing report.md's rounded text), and `tools/fidelity.mjs` (ported verifier vs. author's grader on hand-written and generated sample replies). Everything else is nullbench suites, run from the sibling nullbench checkout, plus Markdown records committed in phase order.

**Tech Stack:** Node >= 22, `node:test`, zero dependencies (matching nullbench). `gh` CLI for screening. nullbench at `~/code/nullbench` (commit `aca29d2` or later).

**Spec:** `docs/superpowers/specs/2026-09-23-skill-audit-design.md` — read it first. This plan argues from it.

## Global Constraints

- Node >= 22, ESM (`"type": "module"`), zero runtime or dev dependencies.
- Subject and judge model: `sonnet`. `reps`: 10. Never override either with `--model`, `--judge-model` or `--reps` on a registered run.
- nullbench is invoked as `node ../nullbench/bin/nullbench.mjs <suite-dir>` from the `skill-audit` repo root. `NULLBENCH_CLAUDE_BIN` must be **unset** for every paid run (set, it points nullbench at a stub or local model).
- **Every paid call needs the user's explicit "yes" in chat first**, with the invocation count from `--dry-run`. This is outward spend; approval for one run does not carry to the next.
- **Nothing is sent to a skill author by Claude.** Claude drafts; the user sends.
- A registration is frozen by a commit **before** its first paid call. Never edit a task file, `SKILL.md` or `nullbench.json` after that commit; a change means a new registration, and the old ledger entries stay.
- Never loosen `SELECTION.md` criteria after a candidate has been seen. A rule change is a new commit stating the reason; the earlier log stays.
- Git: work on a feature branch per task, merge to `main` only after review. Never commit directly to `main`. End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prose follows the house style of nullbench's docs: plain, specific, open items stated as open.

---

## File Structure

```
skill-audit/
  package.json                 test script only
  .gitignore
  README.md                    status table, updated at every phase gate
  tools/
    verdict.mjs                verdict({claimPp, lo, hi}) -> string
    verdict-task.mjs           verdictForTask({records, taskId, claimPp, newcombe}) -> object; CLI: node tools/verdict-task.mjs <results-dir> <taskId> <claimPp>
    fidelity-lib.mjs           compare(), render(), renderProvenance(), edgeReplies() — pure logic
    fidelity.mjs               CLI: node tools/fidelity.mjs <suite-dir>
  test/
    verdict.test.mjs
    verdict-task.test.mjs
    fidelity.test.mjs
  phase0/
    bracket-sonnet.md          gate decision   bracket-sonnet.log  raw output
  SELECTION.md                 rule, then log
  selection/
    anthropics-skills.json     frozen listing, source 1
    github-search.json         frozen search results, source 2
  suites/<skill>/              one per selected skill (or as-published/ + rubric/ subdirs)
    SOURCE.md  DEVIATIONS.md  SKILL.md  nullbench.json  canaries.json
    tasks/*.json  <fixture>/   (fixture dirs sit beside nullbench.json; a task's "fixture" names one)
    preflight.txt              --dry-run output at freeze time
    fidelity/samples.json  fidelity/author-grader.mjs  fidelity/fidelity.txt
    LEDGER.md  results/        written by nullbench
  findings/<skill>.md
  FINDINGS.md
  correspondence/<skill>.md
```

---

### Task 1: Repository scaffold and the verdict rule

**Files:**
- Create: `package.json`, `.gitignore`, `README.md`
- Create: `tools/verdict.mjs`
- Test: `test/verdict.test.mjs`

**Interfaces:**
- Produces: `verdict({ claimPp: number, lo: number, hi: number }) => "claim holds" | "claim not reproduced" | "inconclusive"`. Throws `Error` whose message contains `claim` for a zero/non-finite claim, and `interval` for a non-finite or inverted interval. Used by Task 7.

- [ ] **Step 1: Branch and scaffold**

```bash
cd ~/code/skill-audit
git checkout main && git checkout -b feat/tools
```

`package.json`:

```json
{
  "name": "skill-audit",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "test": "node --test 'test/*.test.mjs'"
  }
}
```

`.gitignore`:

```
node_modules/
.DS_Store
```

`README.md`:

```markdown
# skill-audit

Re-measuring the published effect claims of three Claude skills, using each author's
own evaluation method ported into [nullbench](https://github.com/bharat-goel/nullbench).
Every result is published, including the ones where the claim holds, with the author's
reply beside it.

Third project in a series: cobra → nullbench → skill-audit. Design:
[`docs/superpowers/specs/2026-09-23-skill-audit-design.md`](docs/superpowers/specs/2026-09-23-skill-audit-design.md).

## Status

| Phase | State |
|---|---|
| 0 — nullbench bracket on Sonnet | not started |
| 1 — selection rule frozen | not started |
| 2 — screening | not started |
| 3 — ports registered | not started |
| 4 — runs | not started |
| 5 — authors notified, published | not started |
```

- [ ] **Step 2: Write the failing test**

`test/verdict.test.mjs`:

```js
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../tools/verdict.mjs'`.

- [ ] **Step 4: Implement**

`tools/verdict.mjs`:

```js
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: 8 tests, 8 pass.

- [ ] **Step 6: Mutation check — the test must fail when the rule changes**

Temporarily change `lo <= claimPp && claimPp <= hi` to `lo < claimPp && claimPp < hi` and run `npm test`. Expected: the boundary test fails. Then change `lo > 0 : hi < 0` to `lo >= 0 : hi <= 0` — expected: no test fails yet, so add to the "holds" test:

```js
  assert.equal(verdict({ claimPp: 40, lo: 0, hi: 60 }), "inconclusive");
```

Re-run with the mutant (fails) and with the original (passes). Revert all mutations; `git diff tools/` must be empty against Step 4's content.

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore README.md tools/verdict.mjs test/verdict.test.mjs
git commit -m "Add verdict rule, fixed before any data exists

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Fidelity checker

**Files:**
- Create: `tools/fidelity-lib.mjs`, `tools/fidelity.mjs`
- Test: `test/fidelity.test.mjs`

**Interfaces:**
- Consumes: nullbench's `verify(spec, output) => { pass: boolean, why: string }` from `<NULLBENCH_DIR>/src/verify.mjs` (default `NULLBENCH_DIR` is `../nullbench` relative to this repo root).
- Produces:
  - `compare({ tasks, samples, verify, grade }) => Promise<{ rows, problems, ok }>` where `tasks` is an array of parsed task files (`{ id, verify }`), `samples` is `{ [taskId]: [{ label, reply }] }`, `grade` is `async (taskId, reply) => boolean`. `rows[i] = { task, label, ours, theirs, agree }`.
  - `render(result) => string`.
  - CLI `node tools/fidelity.mjs <suite-dir>`: reads `<suite>/nullbench.json`, its task files, `<suite>/fidelity/samples.json`, imports `grade` from `<suite>/fidelity/author-grader.mjs`, writes `<suite>/fidelity/fidelity.txt`, exits 0 when `ok`, 1 otherwise. Used by Task 5.

- [ ] **Step 1: Write the failing tests**

`test/fidelity.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compare, render } from "../tools/fidelity-lib.mjs";

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
  assert.match(text, /RESULT: DISAGREE/);
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
  assert.match(readFileSync(join(dir, "fidelity", "fidelity.txt"), "utf8"), /agree on all 2 samples/);
});

test("CLI: disagreement exits 1", () => {
  const dir = suite(`export async function grade() { return true; }`);
  const r = spawnSync(process.execPath, ["tools/fidelity.mjs", dir], { encoding: "utf8" });
  assert.equal(r.status, 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../tools/fidelity-lib.mjs'`.

- [ ] **Step 3: Implement the library**

`tools/fidelity-lib.mjs`:

```js
// Checks that a ported deterministic verifier grades exactly as the author's own
// grader does, on hand-written sample replies, before any paid call. One
// disagreement means the port is wrong (spec, "Fidelity check"). Judge-graded
// tasks are out of scope: nothing deterministic exists to compare them against.
export async function compare({ tasks, samples, verify, grade }) {
  const rows = [];
  const problems = [];
  const deterministic = tasks.filter((t) => t.verify.type !== "judge");

  for (const t of deterministic) {
    const list = samples[t.id] ?? [];
    if (list.length === 0) {
      problems.push(`${t.id}: no samples`);
      continue;
    }
    const mine = [];
    for (const s of list) {
      const ours = verify(t.verify, s.reply).pass;
      const theirs = Boolean(await grade(t.id, s.reply));
      mine.push({ task: t.id, label: s.label, ours, theirs, agree: ours === theirs });
    }
    rows.push(...mine);
    if (!mine.some((r) => r.theirs)) problems.push(`${t.id}: no sample the author's grader passes`);
    if (!mine.some((r) => !r.theirs)) problems.push(`${t.id}: no sample the author's grader fails`);
  }

  for (const id of Object.keys(samples)) {
    if (!deterministic.some((t) => t.id === id)) {
      problems.push(`${id}: samples for a task that is not a registered deterministic task`);
    }
  }
  for (const r of rows) {
    if (!r.agree) {
      problems.push(`${r.task}/${r.label}: port says ${r.ours ? "PASS" : "FAIL"}, author's grader says ${r.theirs ? "PASS" : "FAIL"}`);
    }
  }
  return { rows, problems, ok: problems.length === 0 };
}

export function render({ rows, problems, ok }) {
  const v = (b) => (b ? "PASS" : "FAIL");
  const lines = rows.map(
    (r) => `${r.agree ? "ok  " : "DIFF"}  ${r.task}  ${r.label}  port=${v(r.ours)}  author=${v(r.theirs)}`,
  );
  lines.push("", ok ? `RESULT: agree on all ${rows.length} samples` : "RESULT: DISAGREE");
  for (const p of problems) lines.push(`  - ${p}`);
  return lines.join("\n") + "\n";
}
```

- [ ] **Step 4: Implement the CLI**

`tools/fidelity.mjs`:

```js
#!/usr/bin/env node
// Usage: node tools/fidelity.mjs <suite-dir>
// Writes <suite-dir>/fidelity/fidelity.txt and exits 0 only if the port and the
// author's grader agree on every sample.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compare, render } from "./fidelity-lib.mjs";

const suite = resolve(process.argv[2] ?? ".");
const nullbench = resolve(process.env.NULLBENCH_DIR ?? join(import.meta.dirname, "..", "..", "nullbench"));
const { verify } = await import(pathToFileURL(join(nullbench, "src", "verify.mjs")).href);

const reg = JSON.parse(readFileSync(join(suite, "nullbench.json"), "utf8"));
const tasks = reg.tasks.map((t) => JSON.parse(readFileSync(join(suite, t.file), "utf8")));
const samples = JSON.parse(readFileSync(join(suite, "fidelity", "samples.json"), "utf8"));
const { grade } = await import(pathToFileURL(join(suite, "fidelity", "author-grader.mjs")).href);

const result = await compare({ tasks, samples, verify, grade });
const text = render(result);
writeFileSync(join(suite, "fidelity", "fidelity.txt"), text);
process.stdout.write(text);
process.exit(result.ok ? 0 : 1);
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: all verdict and fidelity tests pass (16 total).

- [ ] **Step 6: Mutation check**

Change `agree: ours === theirs` to `agree: true`; run `npm test`; expected: "one disagreement" and "CLI: disagreement exits 1" fail. Revert. Delete the `no sample the author's grader fails` push; expected: its test fails. Revert. Confirm `git diff tools/` is clean against Steps 3–4.

- [ ] **Step 7: Commit, review, merge**

```bash
git add tools/fidelity-lib.mjs tools/fidelity.mjs test/fidelity.test.mjs
git commit -m "Add fidelity checker for ported deterministic graders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Request review (superpowers:requesting-code-review) of `feat/tools` against `main`, fix findings, then merge:

```bash
git checkout main && git merge --no-ff feat/tools -m "Merge feat/tools

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Also merge the spec branch first if it has not been: `git merge --no-ff design/skill-audit-spec`.

- [ ] **Step 8: Ask the user about a remote**

Ask in chat: create `github.com/bharat-goel/skill-audit` now as **private** (recommended — results must not be visible before authors are notified in Task 8), or keep it local until publication? Do not create it without a yes.

---

### Task 3: Phase 0 — the nullbench bracket on Sonnet

**Files:**
- Create: `phase0/bracket-sonnet.md`, `phase0/bracket-sonnet.log` (skill-audit)
- Modified by nullbench itself: `~/code/nullbench/test/live/fixtures/{placebo,positive}/LEDGER.md` and `results/`

**Interfaces:**
- Produces: a pass/fail gate. **If either arm fails, stop the whole plan** and report to the user.

- [ ] **Step 1: Check for a conflicting nullbench session**

A separate session was fixing the stale header in `nullbench/test/live/bracket.test.mjs`. Run `git -C ~/code/nullbench status` and `git -C ~/code/nullbench log --oneline -5`. If that work is uncommitted or on an unmerged branch, wait for it, or run the bracket from a clean checkout of `main`.

- [ ] **Step 2: Dry-run both fixtures for the cost**

```bash
cd ~/code/nullbench
env -u NULLBENCH_CLAUDE_BIN node bin/nullbench.mjs test/live/fixtures/placebo --dry-run
env -u NULLBENCH_CLAUDE_BIN node bin/nullbench.mjs test/live/fixtures/positive --dry-run
```

Expected: each reports 40 invocations, no judge calls, no drift, model `sonnet`.

- [ ] **Step 3: Ask the user to approve the spend**

State: "Phase 0 runs nullbench's live bracket on Sonnet: 80 invocations, estimate $<from dry-run>. Go?" Wait for yes.

- [ ] **Step 4: Run it on a nullbench branch**

```bash
cd ~/code/nullbench
git checkout main && git pull --ff-only 2>/dev/null; git checkout -b chore/bracket-on-sonnet
env -u NULLBENCH_CLAUDE_BIN npm run verify:live 2>&1 | tee ~/code/skill-audit/phase0/bracket-sonnet.log
```

Expected: `2 tests, 2 pass`. The placebo arm's interval spans zero; the positive arm's excludes it.

- [ ] **Step 5: Record the gate in skill-audit**

`phase0/bracket-sonnet.md`, filled from the log and the two new `LEDGER.md` entries:

```markdown
# Phase 0 — nullbench live bracket on Sonnet

Run <UTC timestamp>, nullbench <short SHA>, model `sonnet`, reps 10.

| Arm | Result | Required | Met |
|---|---|---|---|
| placebo | <delta> [<lo>, <hi>], <graded> graded, <dead> dead | spans zero | yes/no |
| known-positive | <delta> [<lo>, <hi>], <graded> graded, <dead> dead | excludes zero | yes/no |

**Gate: PASS / FAIL.**
```

Commit on a skill-audit branch `phase0/bracket`, merge to `main`, and set README status row 0 to `passed <date>` (or `FAILED — audit stopped`).

- [ ] **Step 6: Record it in nullbench**

In nullbench, update `test/live/README.md`'s status to add the Sonnet run (and remove "neither arm has run against a hosted model"), the README "What has actually been run" row, and `PROTOCOL.md`'s placebo block to match. Commit the ledgers, results and docs on `chore/bracket-on-sonnet`, push, open a PR. Update `~/code/SERIES.md`: in the nullbench entry, change "the live bracket has only been run on a 12B local model, never on a hosted one" to state the Sonnet result.

- [ ] **Step 7: Gate**

If either arm failed: stop, report to the user with the log. Do not start Task 4.

---

### Task 4: Phases 1–2 — freeze the selection rule, then screen

**Files:**
- Create: `SELECTION.md`, `selection/anthropics-skills.json`, `selection/github-search.json`

**Interfaces:**
- Produces: `SELECTION.md` log naming up to 3 selected skills with repo URL, pinned SHA, path to `SKILL.md`, and claim/method links. Task 5 reads it.

- [ ] **Step 1: Write the rule — do not look at any candidate before this commit**

Branch `phase1/selection-rule`. `SELECTION.md` — replace `<DATE>` and `DATE_FROZEN` with today's date as `YYYY-MM-DD`, so the qualifier reads e.g. `pushed:<2026-09-24`:

````markdown
# Selection

## Rule

Frozen <DATE>, before any candidate was viewed. Changes after this point are new commits
stating their reason; this section is never edited in place.

### Sources, in order

1. `anthropics/skills` — every skill directory, in the order returned by
   `gh api repos/anthropics/skills/contents/skills --jq '.[].name'`, frozen to
   `selection/anthropics-skills.json`.
2. GitHub repository search, frozen to `selection/github-search.json`:

   ```
   gh search repos 'SKILL.md eval OR benchmark OR "with and without" pushed:<DATE_FROZEN' \
     --sort stars --order desc --limit 100 \
     --json fullName,url,stargazersCount,pushedAt,license
   ```

Candidates are screened in that order: all of source 1, then source 2.

### Eligibility — all required

| | Criterion |
|---|---|
| E1 | An Agent Skill (`SKILL.md` with frontmatter) runnable under the `claude` CLI with no external service, API key or paid tool |
| E2 | Publishes a with-versus-without number. A pass rate with no baseline does not count. |
| E3 | Publishes a portable method: task prompts plus a per-task pass criterion expressible as a nullbench verifier (`any` / `none` / `ordered`, or a rubric for `judge`). A criterion that needs executing generated code is not portable. |
| E4 | License permits redistribution (OSI-approved or CC-BY / CC0) |
| E5 | Not written by Bharat Goel; no two selected skills share an author or organisation |

A repository with several skills counts as one candidate per skill that has its own
published claim; screening stops at the first failed criterion, which is the one logged.

### Stopping

Stop at three eligible skills or 100 candidates screened, whichever comes first. Fewer
than three eligible: the audit proceeds with fewer and reports the shortfall as a
finding.

## Log

| # | Candidate | Source | E1 | E2 | E3 | E4 | E5 | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
````

- [ ] **Step 2: Commit the rule before running any command in it**

```bash
git add SELECTION.md
git commit -m "Freeze the selection rule before viewing candidates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Merge to `main`. README status row 1 → `frozen <DATE>, <short SHA>`.

- [ ] **Step 3: Freeze both listings exactly as the rule states**

Branch `phase2/screening`. Run the two commands from the rule verbatim, writing to the two `selection/*.json` files. If the `skills/` path does not exist in `anthropics/skills`, do **not** improvise: record that in the log as "source 1 path absent", commit, and ask the user whether to amend the rule (an amendment is a new commit with its reason). Commit the frozen listings before screening any entry.

- [ ] **Step 4: Screen in order, one log row per candidate**

For each candidate, read its `SKILL.md`, README and any eval directory at the default branch HEAD. Check E1→E5 in order, stop at the first failure. Row format:

```
| 7 | owner/repo — skill-name | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3, claim in README but no task prompts | https://github.com/owner/repo/blob/<sha>/README.md#L40 |
```

Eligible rows record the pinned SHA (`gh api repos/<owner>/<repo>/commits/HEAD --jq .sha`) and add, under the table, a block per selected skill:

```markdown
### Selected: <skill-name>

- Repo: <url> @ `<full SHA>`
- SKILL.md: <path>
- Claim: <quote of the number, ≤15 words> — <link>
- Method: <link to task prompts> · <link to pass criterion>
- Author's model and n: <as published, or "not stated">
- License: <SPDX id>
```

Commit every ~10 rows so the log's growth is visible in history.

- [ ] **Step 5: Gate and summary**

Append:

```markdown
## Outcome

Screened <N> candidates; <k> eligible. Exclusions by first failed criterion:
E1 <n1>, E2 <n2>, E3 <n3>, E4 <n4>, E5 <n5>.
```

Commit, request review of the log (every row must have an evidence link), merge. README row 2 → `<k> of <N> eligible`. Tell the user the selected skills before starting Task 5. If `k = 0`, stop: the finding is the E-rates, and Task 8's write-up is the only remaining work.

---

### Task 5: Phase 3 — port and register one skill (repeat per selected skill)

Executed once per skill selected in Task 4, each on its own branch `port/<skill>`. The content of each file comes from that skill's published method; the rules below fix *how*.

**Files:** `suites/<skill>/` — `SOURCE.md`, `DEVIATIONS.md`, `SKILL.md`, `nullbench.json`, `canaries.json` (if any judge task), `tasks/*.json`, `<fixture-name>/` (if used), `fidelity/` (if any code grader), `preflight.txt`.

**Interfaces:**
- Consumes: the `Selected:` block from `SELECTION.md`; `tools/fidelity.mjs` from Task 2.
- Produces: a registration committed before any paid call, with its hash `H` (first 16 hex) in the commit message. Task 6 runs it.

- [ ] **Step 1: Copy the skill and fixtures at the pinned SHA (P1)**

```bash
mkdir -p suites/<skill>/tasks
gh api "repos/<owner>/<repo>/contents/<path>/SKILL.md?ref=<SHA>" --jq .content | base64 -d > suites/<skill>/SKILL.md
```

Fixtures the same way, into `suites/<skill>/<fixture-name>/` — nullbench resolves a task's `"fixture"` relative to the registration directory (see `~/code/nullbench/examples/cobra/failing-suite/`). Verify byte-identity: `git hash-object suites/<skill>/SKILL.md` must equal `gh api "repos/<owner>/<repo>/contents/<path>/SKILL.md?ref=<SHA>" --jq .sha`.

- [ ] **Step 2: Write `SOURCE.md`**

```markdown
# Source — <skill>

- Repository: <url>
- Pinned commit: `<full SHA>`
- License: <SPDX> — <link to LICENSE at SHA>
- Claim: <link at SHA>
- Method: <links at SHA>
- nullbench commit used: `<short SHA of ~/code/nullbench HEAD at run time>`
```

- [ ] **Step 3: Port each task (P2, P3, P7)**

Take the author's first 5 tasks in published order. One file per task, `tasks/<id>.json`, using the author's task id where one exists:

```json
{
  "id": "<author's id>",
  "skill": "<skill>",
  "kind": "signal",
  "prompt": "<author's prompt, byte-for-byte>",
  "rationale": "Ported from <link at SHA>. Author's criterion: <their words, verbatim or linked>.",
  "verify": { "type": "<any|none|ordered|judge>", "...": "..." }
}
```

- Their substring/regex-free keyword list → `any` or `none` with the same patterns in the same order.
- Their ordering check → `ordered`.
- Their prose/human/LLM criterion → `judge`, whose `rubric` restates their criterion and nothing more. Do not add the "do not reward vocabulary" line; nullbench's shared judge prompt already carries it.
- A regex, or anything else nullbench cannot express exactly → the task is unportable. Log it in `DEVIATIONS.md` as dropped; take the next task in order to keep 5 if one exists.
- A mapping that looks right on paper is not enough: **a task whose port cannot pass the fidelity check** in Step 7 (hand-written samples *and* generated edge replies) **is also unportable**, dropped per P7 the same way, reason in `DEVIATIONS.md`. Do not fix this by loosening the criterion or hand-picking samples that dodge the disagreement — the fidelity check decides portability, not the porter. In particular, expect most `ordered` ports to land here: nullbench's `ordered` type understands negation cues ("don't", "before you", …) in front of a `before` pattern, and an author's own ordering check usually does not — that is the intended outcome (spec, P2), not a bug to work around.

- [ ] **Step 4: Write the harm task (P4) — from the `description` only**

Before reading further into the author's tasks than Step 3 requires, read only the skill's frontmatter `description` and write `tasks/audit-harm-routine.json`:

```json
{
  "id": "audit-harm-routine",
  "skill": "<skill>",
  "kind": "harm",
  "prompt": "<a routine task inside the description's domain whose correct answer the skill should not change>",
  "rationale": "Written by the auditor from the skill's description alone, before any run. The only task in this suite not written by the skill's author.",
  "verify": { "type": "judge", "rubric": "<PASS: the task answered correctly and completely. FAIL: wrong, incomplete, or padded with material the task did not ask for.>" }
}
```

- [ ] **Step 5: Canaries for every judge task (P5)**

`canaries.json`: for each judge-graded task, at least one clear PASS, one clear FAIL, and one vocabulary-stuffed FAIL (uses the skill's words but misses the criterion) — the shape used in `~/code/nullbench/examples/cobra/canaries.json`.

- [ ] **Step 6: Registration**

```bash
cd suites/<skill> && shasum -a 256 tasks/*.json
```

`nullbench.json`: `"model": "sonnet"`, `"judge_model": "sonnet"`, `"reps": 10`, one entry per task with that hash; author tasks `"kind": "signal", "predict": "helps"` (if the author claims a *decrease* is the improvement, still `helps`: the prediction is "the skill does what its author says"); the harm task `"kind": "harm", "predict": "no-effect"`.

- [ ] **Step 7: Fidelity check (only if any author grader is code)**

`fidelity/author-grader.mjs` wraps the author's grader at the pinned SHA, unmodified in logic:

```js
// Wraps <link to author's grader at SHA>. Logic copied without change; only the
// signature is adapted to grade(taskId, reply) => boolean. If the author's grader
// is not JavaScript, copy it beside this file unchanged and call it here with
// child_process.spawnSync, passing the reply on stdin.
export async function grade(taskId, reply) {
  // author's code
}
```

`fidelity/samples.json`: for each deterministic task, at least one reply their grader passes and one it fails, written to probe the port's edges (case, punctuation, the word inside another word). `tools/fidelity.mjs` also generates its own edge replies from each task's `verify` spec (case variants, a pattern embedded in a longer word, a pattern next to punctuation, the `maxWords` boundary, and, for `ordered`, a `before` pattern preceded by each negation cue nullbench understands) and runs those through both graders too — nothing to write for these, they come from the spec alone. Run from the repo root:

```bash
node tools/fidelity.mjs suites/<skill>
```

Expected: exit 0, `RESULT: agree on all <n> samples`. On `RESULT: FAILED`, and the disagreement is on a hand-written sample, fix the port (never the author's grader), re-hash, re-run. If the disagreement is on a generated row and cannot be resolved without changing the author's criterion, the task is unportable per Step 3's last bullet — drop it, do not force it through.

- [ ] **Step 8: Preflight**

```bash
env -u NULLBENCH_CLAUDE_BIN node ../nullbench/bin/nullbench.mjs suites/<skill> --dry-run | tee suites/<skill>/preflight.txt
```

Expected: no structural errors, no `HASH_MISMATCH`, no `NO_HARM_TASK`. Note the invocation count and `H`.

- [ ] **Step 9: If preflight reports `PATTERN_IN_SKILL`, split into two registrations**

```bash
cd suites/<skill>
mkdir as-published rubric
mv SKILL.md nullbench.json tasks preflight.txt as-published/   # plus canaries.json, fixture dirs, fidelity/ if present (not yet tracked, so plain mv)
cp -R as-published/SKILL.md as-published/tasks rubric/          # plus fixture dirs, if any
```

In `rubric/tasks/`, convert each flagged deterministic task to `"type": "judge"` with a rubric stating the author's criterion as behaviour. Re-hash both, write both `nullbench.json` files and a `rubric/canaries.json`, dry-run both. `as-published` is expected to show `PATTERN_IN_SKILL` (it will run EXPLORATORY); `rubric` must be clean.

`as-published/fidelity/` was already produced by Step 7 against the pre-split suite; it does not carry over automatically. If `rubric/` still has at least one deterministic task after this conversion (not every flagged task need be deterministic-only; some suites mix), give it its own `rubric/fidelity/` — copy `samples.json` for the surviving deterministic tasks and `author-grader.mjs` from `as-published/fidelity/`, then run `node tools/fidelity.mjs suites/<skill>/rubric`. If every deterministic task was converted to `judge` (the common case — that is the whole point of the `rubric` variant), `rubric` has none left; do not run `tools/fidelity.mjs` against it (it now fails with "no deterministic tasks to compare", correctly, since a judge-only suite has nothing for it to check) — instead note in `rubric`'s `DEVIATIONS.md` that no deterministic tasks remain and the fidelity check does not apply to this registration.

- [ ] **Step 10: `DEVIATIONS.md` (P8)**

```markdown
# Deviations — <skill>

| Deviation | Reason |
|---|---|
| Model: sonnet (author used <x / not stated>) | Audit runs one model throughout (spec P6) |
| n: 10 per arm (author used <n / not stated>) | spec P6 |
| `<task>`: <their grader> → nullbench `<type>` | spec P2; fidelity check <passed / not applicable> |
| Dropped `<task>`: <reason> | spec P7 / unportable |
| Added `audit-harm-routine` (auditor-written) | nullbench requires a harm task for CONFIRMATORY (spec P4) |
| Claimed delta per task: <per-task / aggregate used for every task> | spec, Verdicts |
```

- [ ] **Step 11: Freeze**

```bash
git add suites/<skill>
git commit -m "Register <skill> (H=<16 hex>[, rubric H=<16 hex>])

Frozen before any paid call.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Request review of the port against the author's method, fix, merge to `main`. README row 3 → `<k> registered`.

---

### Task 6: Phase 4 — run each registration

**Files:** nullbench writes `suites/<skill>[/<variant>]/LEDGER.md` and `results/<timestamp>/`.

**Interfaces:**
- Consumes: frozen registrations from Task 5.
- Produces: one non-VOID `report.md` per registration. Task 7 reads the per-task row: delta and `[lo, hi]`.

- [ ] **Step 1: Confirm spend, per registration**

Before re-running the dry-run, check `fidelity/fidelity.txt`'s provenance header still matches: `git -C ~/code/nullbench rev-parse HEAD` against its recorded nullbench commit, `shasum -a 256 ~/code/nullbench/src/verify.mjs` against its recorded hash, and `shasum -a 256 suites/<skill>/tasks/*.json` against its recorded per-task hashes. If any differ, the fidelity check no longer reflects what is about to run — do not spend until it is re-run (`node tools/fidelity.mjs suites/<skill>`) and, if the registration itself changed, re-frozen.

Re-run the dry-run, then ask: "Run `<skill>` (<variant>): <n> invocations, est. $<x>. Go?" Wait for yes.

- [ ] **Step 2: Run**

```bash
git checkout -b run/<skill>
env -u NULLBENCH_CLAUDE_BIN node ../nullbench/bin/nullbench.mjs suites/<skill> --yes
```

Confirm the report header shows the committed `H`. If it differs, the files changed after freezing: stop and report.

- [ ] **Step 3: Handle VOID**

A VOID report is no measurement. Commit it (the ledger entry stays), then ask the user before re-running (it is new spend). Repeat Step 2 until non-VOID or the user stops.

- [ ] **Step 4: Commit results**

```bash
git add suites/<skill>
git commit -m "Run <skill>: <CLASS>, H=<16 hex>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Merge. README row 4 → `<done>/<total> registrations run`. **Do not push to any public remote** until Task 8's notification window has closed.

---

### Task 7: Phase 5a — findings and author messages

**Files:**
- Create: `findings/<skill>.md`, `correspondence/<skill>.md`

**Interfaces:**
- Consumes: `verdict()` from Task 1 and `verdictForTask()` from `tools/verdict-task.mjs` (Task 2); records/report from Task 6; `SELECTION.md` claim; `DEVIATIONS.md`.

- [ ] **Step 1: Compute each task's verdict with the tool, not by eye**

For each signal task, from the author's claimed delta (per `DEVIATIONS.md`) and the run's own records — never report.md's rounded delta or CI, which can print "+0.0pp" for a lower bound that is truly just above zero:

```bash
node tools/verdict-task.mjs suites/<skill>/results/<timestamp> <taskId> <claimPp>
```

Use the `kC`/`nC`/`kT`/`nT`/`lo`/`hi`/`verdict` it prints for the finding's table; cross-check `lo`/`hi` against report.md's rounded figures as a sanity check, not as the source of truth.

A registration that ran EXPLORATORY because of `PATTERN_IN_SKILL` gets **not measurable as published** for every task; its `rubric` sibling carries the verdicts.

- [ ] **Step 2: Write `findings/<skill>.md`**

```markdown
# <skill>

**Claim:** <≤15-word quote> — <link at SHA>
**Registration:** H=<16 hex>, nullbench <SHA>, <CLASS>

| Task | Author's claim | Control | Treatment | Delta | 95% CI | Verdict |
|---|---|---|---|---|---|---|
<rows from Step 1's counts and interval>

For every **claim not reproduced** row, state in prose whether the claim fell below or
above the interval (an effect real but smaller than claimed, versus an effect on the
wrong side of zero, versus a claim outside an interval that spans zero — these are
different findings and the table alone does not distinguish them).

<If as-published and rubric both ran: one paragraph on the gap between them.>

Harm task: <result, and whether predict=no-effect was a HIT>.

**What was different from the author's method:** see [`DEVIATIONS.md`](../suites/<skill>/DEVIATIONS.md). <One sentence naming the one most likely to matter, usually the model.>

**Mapped to FAILURES.md:** <entry numbers for each failure mode observed in the author's method, or "none observed">.

## Author's reply

<pending — notified <date>, window closes <date+14>>
```

No average across tasks unless nullbench printed one. Same length and structure whether the claim held or not.

- [ ] **Step 3: Draft the message**

`correspondence/<skill>.md`:

```markdown
# <skill> — correspondence

## Sent <date> via <GitHub issue URL | email>

Title: Independent re-measurement of <skill>'s published eval

Hi <author>, I re-ran the evaluation published in <repo> (at <SHA>) using
nullbench, a pre-registration harness, as part of an audit of three published skills.
Your tasks and pass criteria were ported as faithfully as I could; every difference is
listed in DEVIATIONS.md, and the registration was committed before any run.

Result: <one sentence per task: verdict and interval>.

Draft write-up: <link or attached>. I plan to publish on <date+14>. Any reply you send
will be published verbatim beside the finding unless you ask otherwise, and I will
correct anything I got wrong about your method.

— Bharat

## Reply

<none yet>
```

- [ ] **Step 4: Hand to the user**

Show the user each draft and the finding. **The user sends it.** Once they confirm it was sent and give the date and URL, fill in `Sent <date> via <...>` and the finding's window dates. Commit on `phase5/findings`, merge. README row 5 → `notified <date>; publishing <date+14>`.

---

### Task 8: Phase 5b — publish and feed back

Starts when every notified author has replied or 14 days have passed since their notification.

**Files:**
- Modify: `findings/<skill>.md` (reply section), `correspondence/<skill>.md`, `README.md`, `~/code/SERIES.md`
- Create: `FINDINGS.md`
- nullbench PR: `FAILURES.md`

- [ ] **Step 1: Record replies**

Paste each reply verbatim into `correspondence/<skill>.md` and the finding's "Author's reply" section, or write `No reply by <date>.` If an author asked for their reply not to be published, write `Reply received <date>; not published at the author's request.` If a reply shows a porting error, do **not** edit the frozen registration: note the error in the finding and, with the user's approval, register and run a corrected suite as a new registration, keeping both.

- [ ] **Step 2: Write `FINDINGS.md`**

```markdown
# Findings

Audited <k> skills, selected by the rule in SELECTION.md from <N> candidates.

## Screening

<n3> of <N> candidates were excluded at E3: they publish a number but not a method that
can be re-run. <other E-counts>.

## Per skill

| Skill | Tasks | Holds | Not reproduced | Inconclusive | Not measurable as published |
|---|---|---|---|---|---|

## Failure modes observed in published evals

| FAILURES.md entry | Skills where observed |
|---|---|

## What this audit does not show

- Anything about the authors' own models: every run is Sonnet.
- Replication: one batch per registration (FAILURES.md entry 9).
- Judge independence: the judge is Sonnet grading Sonnet (FAILURES.md entry 3).
- Anything about skills that publish no method.
```

Update README: results table, status row 5 → `published <date>`. Commit, review, merge; with the user's approval, push and make the repository public.

- [ ] **Step 3: FAILURES.md PR in nullbench**

Branch `docs/audit-evidence` in `~/code/nullbench`. For each failure mode observed, add a "Second source" paragraph under the matching entry, citing `skill-audit` findings, or propose a new entry 14+ in the existing format (what it looks like, what it cost, what nullbench does). Update the document's opening "Where the numbers come from" paragraph: figures are no longer from a single harness. Run `npm test`, commit, push, open a PR, and give the user the link.

- [ ] **Step 4: Update the series**

In `~/code/SERIES.md`, move "3. Audit" from Next to Shipped, with its link, and its gaps left: Sonnet only; <k> skills; one batch per registration (entry 9); same-family judge (entry 3) — "the judged replies in `results/*/raw/` are the input for Crossjudge."
