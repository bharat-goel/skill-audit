#!/usr/bin/env node
// Assigns one task's verdict directly from a run's raw per-rep records, never from
// report.md's rounded text. Counts k/n per arm the same way nullbench's own report
// aggregates them -- graded records only, dead runs excluded (see
// <NULLBENCH_DIR>/src/report.mjs, `aggregate()`: `!r.failed` on the per-arm filter) --
// then hands those counts to nullbench's newcombe() for the interval. The reason to
// bypass report.md: pp() there rounds to one decimal, so a true lower bound that sits
// just above zero can print as "+0.0pp" and read as inconclusive when the unrounded
// interval already excludes zero.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { verdict } from "./verdict.mjs";

export function verdictForTask({ records, taskId, claimPp, newcombe }) {
  const graded = records.filter((r) => r.task === taskId && !r.failed);
  const arm = (cond) => {
    const rs = graded.filter((r) => r.cond === cond);
    return { k: rs.filter((r) => r.pass).length, n: rs.length };
  };
  const control = arm("control");
  const treatment = arm("treatment");
  if (control.n === 0 || treatment.n === 0) {
    throw new Error(`no graded records for task ${JSON.stringify(taskId)}`);
  }
  const { lo, hi } = newcombe(control.k, control.n, treatment.k, treatment.n);
  const loPp = lo * 100;
  const hiPp = hi * 100;
  return {
    verdict: verdict({ claimPp, lo: loPp, hi: hiPp }),
    kC: control.k,
    nC: control.n,
    kT: treatment.k,
    nT: treatment.n,
    lo: loPp,
    hi: hiPp,
  };
}

// Pooled mode: sums k/n across a set of tasks (per arm), computes one Newcombe interval
// on the pooled counts, and hands that to verdict() once -- rather than verdicting each
// task separately. Used where a suite's pre-registered analysis rule pools several tasks
// that jointly stand in for one author claim (see suites/uap-release-analyzer/DEVIATIONS.md,
// "Pooled-verdict rule for eval 3"). perTask is reported, not verdicted.
//
// minGraded is required: PROTOCOL.md §5.1's graded-run floor says any cell (one task, one
// arm) below the floor voids the whole batch -- there is no such thing as a pooled verdict
// computed from survivors around a thin or all-dead cell. A task all of whose runs are dead
// (failed: true) would otherwise silently contribute k=0, n=0 to the pool and still produce
// a normal-looking verdict; requiring the caller to state the floor and enforcing it per
// cell, before any counts are summed, is what rules that out. The CLI derives minGraded from
// records.json's requested.reps using nullbench's own formula (PROTOCOL.md §5.1); a caller
// invoking this function directly must supply it explicitly.
export function pooledVerdictForTasks({ records, taskIds, claimPp, newcombe, minGraded }) {
  if (!Number.isInteger(minGraded) || minGraded < 1) {
    throw new Error(`minGraded must be a positive integer; got ${JSON.stringify(minGraded)}`);
  }
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new Error("taskIds must be a non-empty array");
  }
  const seen = new Set();
  for (const id of taskIds) {
    if (seen.has(id)) throw new Error(`duplicate taskId ${JSON.stringify(id)}`);
    seen.add(id);
  }

  let kC = 0;
  let nC = 0;
  let kT = 0;
  let nT = 0;
  const perTask = [];

  for (const taskId of taskIds) {
    const graded = records.filter((r) => r.task === taskId && !r.failed);
    const arm = (cond) => {
      const rs = graded.filter((r) => r.cond === cond);
      return { k: rs.filter((r) => r.pass).length, n: rs.length };
    };
    const control = arm("control");
    const treatment = arm("treatment");
    if (control.n < minGraded) {
      throw new Error(
        `cell below graded-run floor: task ${JSON.stringify(taskId)} control has ${control.n} ` +
          `graded runs, need >= ${minGraded}`,
      );
    }
    if (treatment.n < minGraded) {
      throw new Error(
        `cell below graded-run floor: task ${JSON.stringify(taskId)} treatment has ${treatment.n} ` +
          `graded runs, need >= ${minGraded}`,
      );
    }
    perTask.push({ taskId, kC: control.k, nC: control.n, kT: treatment.k, nT: treatment.n });
    kC += control.k;
    nC += control.n;
    kT += treatment.k;
    nT += treatment.n;
  }

  const { lo, hi } = newcombe(kC, nC, kT, nT);
  const loPp = lo * 100;
  const hiPp = hi * 100;
  return {
    verdict: verdict({ claimPp, lo: loPp, hi: hiPp }),
    kC,
    nC,
    kT,
    nT,
    lo: loPp,
    hi: hiPp,
    perTask,
  };
}

// CLI:
//   node tools/verdict-task.mjs <results-dir> <taskId> <claimPp>
//   node tools/verdict-task.mjs <results-dir> --pooled <claimPp> <taskId> [<taskId> ...]
// <results-dir> holds records.json (e.g. suites/<skill>/results/<timestamp>/).
const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  const args = process.argv.slice(2);
  const [resultsDir, ...rest] = args;
  if (!resultsDir) {
    console.error(
      "usage: node tools/verdict-task.mjs <results-dir> <taskId> <claimPp>\n" +
        "       node tools/verdict-task.mjs <results-dir> --pooled <claimPp> <taskId> [<taskId> ...]",
    );
    process.exit(2);
  }
  const nullbench = resolve(process.env.NULLBENCH_DIR ?? join(import.meta.dirname, "..", "..", "nullbench"));
  const { newcombe } = await import(pathToFileURL(join(nullbench, "src", "stats.mjs")).href);
  const { requested, records } = JSON.parse(readFileSync(join(resolve(resultsDir), "records.json"), "utf8"));

  if (rest[0] === "--pooled") {
    const [, claimArg, ...taskIds] = rest;
    if (claimArg === undefined || taskIds.length === 0) {
      console.error(
        "usage: node tools/verdict-task.mjs <results-dir> --pooled <claimPp> <taskId> [<taskId> ...]",
      );
      process.exit(2);
    }
    const claimPp = Number(claimArg);
    // Graded-run floor, matching nullbench's own formula exactly (PROTOCOL.md §5.1:
    // "floor = max(3, ceil(reps * 0.8))"; confirmed against src/report.mjs, which quotes
    // requested.reps from the same records.json shape read here).
    const reps = requested?.reps;
    if (!Number.isFinite(reps) || reps < 1) {
      throw new Error(
        `records.json is missing a valid requested.reps; cannot derive the graded-run floor ` +
          `(got ${JSON.stringify(reps)})`,
      );
    }
    const minGraded = Math.max(3, Math.ceil(reps * 0.8));
    const result = pooledVerdictForTasks({ records, taskIds, claimPp, newcombe, minGraded });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    const [taskId, claimArg] = rest;
    if (!taskId || claimArg === undefined) {
      console.error("usage: node tools/verdict-task.mjs <results-dir> <taskId> <claimPp>");
      process.exit(2);
    }
    const claimPp = Number(claimArg);
    const result = verdictForTask({ records, taskId, claimPp, newcombe });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
}
