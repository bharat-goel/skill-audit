// Mirrors nullbench's NEGATIONS list -- it is not exported, so this is copied by hand
// from <NULLBENCH_DIR>/src/verify.mjs (top of file, `firstUnnegated`'s cue list). If
// nullbench's list is ever extended or trimmed, the test in test/fidelity.test.mjs that
// runs each of these cues through the real verify() and checks it still negates will
// fail, which is the signal to update this copy.
const NEGATION_CUES = [
  "don't", "do not", " not ", "never", "avoid", "rather than", "instead of",
  "without", "no need to", "before you", "premature", "resist", "skip",
  "hold off", "defer", "later", "only once", "only after", "after you",
];

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Generates edge-case replies from a task's own verify spec -- no fixture, no author
// knowledge required. These probe exactly the corners a hand-written sample usually
// doesn't: case, a pattern buried inside a longer word, a pattern next to punctuation,
// the maxWords boundary, and (for `ordered`) a before-pattern preceded by a negation
// cue nullbench's real verifier understands and a naive port typically does not.
export function edgeReplies(spec) {
  const out = [];
  const push = (label, reply) => out.push({ label, reply });

  if (spec.type === "any" || spec.type === "none") {
    for (const p of spec.patterns ?? []) {
      push(`case-upper:${p}`, p.toUpperCase());
      push(`case-title:${p}`, titleCase(p));
      push(`embedded:${p}`, `pre${p}post`);
      push(`punctuation:${p}`, `(${p}).`);
    }
  }

  if (spec.type === "ordered") {
    const afters = spec.after ?? [];
    for (const b of spec.before ?? []) {
      for (const cue of NEGATION_CUES) {
        // Don't trim the cue: " not " is word-anchored with leading/trailing spaces
        // (see NEGATION_CUES' source comment), and trimming it to "not" would drop the
        // leading space firstUnnegated's context match requires.
        const sep = cue.endsWith(" ") ? "" : " ";
        const reply = afters.length ? `${cue}${sep}${b}. ${afters[0]}` : `${cue}${sep}${b}.`;
        push(`negation:${cue.trim()}:${b}`, reply);
      }
      push(`no-after:${b}`, `${b}.`);
    }
  }

  if (spec.maxWords) {
    const words = (n) => {
      const w = [];
      if (spec.type === "any" && spec.patterns?.length) w.push(spec.patterns[0]);
      while (w.length < n) w.push(`word${w.length}`);
      return w.slice(0, n).join(" ");
    };
    push("maxWords:exact", words(spec.maxWords));
    push("maxWords:over", words(spec.maxWords + 1));
  }

  return out;
}

// Checks that a ported deterministic verifier grades exactly as the author's own
// grader does, on hand-written sample replies plus generated edge replies (I3), before
// any paid call. One disagreement means the port is wrong (spec, "Fidelity check").
// Judge-graded tasks are out of scope: nothing deterministic exists to compare them
// against.
export async function compare({ tasks, samples, verify, grade }) {
  const rows = [];
  const problems = [];
  const deterministic = tasks.filter((t) => t.verify.type !== "judge");

  // Nothing deterministic to check is not a vacuous pass -- it means the check ran
  // against no evidence at all, which is worse than a disagreement.
  if (deterministic.length === 0) {
    problems.push("no deterministic tasks to compare");
  }

  // A grader that returns "yes" or 1 instead of true is not diagnosed by silently
  // coercing it -- that hides exactly the kind of author-side bug this check exists to
  // surface. Name the task/label and treat it as a problem instead. Returns null (and
  // records the problem) rather than a row, for both hand-written and generated replies.
  const gradeOne = async (t, s) => {
    const ours = verify(t.verify, s.reply).pass;
    const raw = await grade(t.id, s.reply);
    if (typeof raw !== "boolean") {
      problems.push(`${t.id}/${s.label}: author's grader returned ${JSON.stringify(raw)}, not a boolean`);
      return null;
    }
    return { task: t.id, label: s.label, ours, theirs: raw, agree: ours === raw };
  };

  for (const t of deterministic) {
    const list = samples[t.id] ?? [];
    if (list.length === 0) {
      problems.push(`${t.id}: no samples`);
      continue;
    }
    // Coverage (a pass and a fail) is required of the hand-written samples, not the
    // generated ones -- samples.json is what the spec's "at least one sample the
    // author's grader passes and one it fails" refers to.
    const mine = [];
    for (const s of list) {
      const row = await gradeOne(t, s);
      if (row) mine.push(row);
    }
    rows.push(...mine);
    if (!mine.some((r) => r.theirs)) problems.push(`${t.id}: no sample the author's grader passes`);
    if (!mine.some((r) => !r.theirs)) problems.push(`${t.id}: no sample the author's grader fails`);

    // Generated rows are graded the same way and fail the check exactly like a
    // hand-written disagreement (see the loop below), labelled `gen:<label>`.
    const generated = edgeReplies(t.verify).map((g) => ({ label: `gen:${g.label}`, reply: g.reply }));
    for (const s of generated) {
      const row = await gradeOne(t, s);
      if (row) rows.push(row);
    }
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
