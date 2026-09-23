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
