// Checks that a ported deterministic verifier grades exactly as the author's own
// grader does, on hand-written sample replies, before any paid call. One
// disagreement means the port is wrong (spec, "Fidelity check"). Judge-graded
// tasks are out of scope: nothing deterministic exists to compare them against.
export async function compare({ tasks, samples, verify, grade }) {
  const rows = [];
  const problems = [];
  const deterministic = tasks.filter((t) => t.verify.type !== "judge");

  // Nothing deterministic to check is not a vacuous pass -- it means the check ran
  // against no evidence at all, which is worse than a disagreement.
  if (deterministic.length === 0) {
    problems.push("no deterministic tasks to compare");
  }

  for (const t of deterministic) {
    const list = samples[t.id] ?? [];
    if (list.length === 0) {
      problems.push(`${t.id}: no samples`);
      continue;
    }
    const mine = [];
    for (const s of list) {
      const ours = verify(t.verify, s.reply).pass;
      const raw = await grade(t.id, s.reply);
      // A grader that returns "yes" or 1 instead of true is not diagnosed by silently
      // coercing it -- that hides exactly the kind of author-side bug this check
      // exists to surface. Name the task/label and treat it as a problem instead.
      if (typeof raw !== "boolean") {
        problems.push(`${t.id}/${s.label}: author's grader returned ${JSON.stringify(raw)}, not a boolean`);
        continue;
      }
      mine.push({ task: t.id, label: s.label, ours, theirs: raw, agree: ours === raw });
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

// Pinned evidence for what fidelity.txt actually checked, so a stale run (nullbench
// changed underneath it, or a task file edited after the fidelity check passed) can be
// caught by comparing these against a fresh computation before a paid call, rather than
// trusting that a green fidelity.txt from last week still applies.
export function renderProvenance({ nullbenchSha, verifySha256, tasks }) {
  const lines = [
    `nullbench commit: ${nullbenchSha}`,
    `verify.mjs sha256: ${verifySha256}`,
    "task files:",
    ...tasks.map((t) => `  ${t.id} (${t.file}): ${t.sha256}`),
    "",
  ];
  return lines.join("\n") + "\n";
}

export function render({ rows, problems, ok }) {
  const v = (b) => (b ? "PASS" : "FAIL");
  const lines = rows.map(
    (r) => `${r.agree ? "ok  " : "DIFF"}  ${r.task}  ${r.label}  port=${v(r.ours)}  author=${v(r.theirs)}`,
  );
  lines.push("", ok ? `RESULT: agree on all ${rows.length} samples` : "RESULT: FAILED");
  for (const p of problems) lines.push(`  - ${p}`);
  return lines.join("\n") + "\n";
}
