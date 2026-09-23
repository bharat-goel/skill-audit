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
