# Source — otel-go

- Repository: https://github.com/ollygarden/opentelemetry-agent-skills
- Pinned commit: `73a557bd3a79c0590995f90ab2cebaae203409b3` (PR #218 merge; the exact "proposed PR skill" revision the author measured — re-pinned from HEAD per Task 4b review, since the original selection pinned the wrong revision)
- License: Apache-2.0 — https://github.com/ollygarden/opentelemetry-agent-skills/blob/73a557bd3a79c0590995f90ab2cebaae203409b3/LICENSE
- Claim: "Target skill withheld: 0 pass, 3 fail; Proposed PR skill: 3 pass, 0 fail" (1 case × 3 reps per arm; a rep passes only if all four `expectations` are met) — https://github.com/ollygarden/opentelemetry-agent-skills/blob/73a557bd3a79c0590995f90ab2cebaae203409b3/skills/otel-go/evals/results.md and PR #218 body (commit message at the pinned SHA)
- Method: task prompt and pass criteria — https://github.com/ollygarden/opentelemetry-agent-skills/blob/73a557bd3a79c0590995f90ab2cebaae203409b3/skills/otel-go/evals/evals.json, single case `go-v145-upgrade-review`; fixture at https://github.com/ollygarden/opentelemetry-agent-skills/blob/73a557bd3a79c0590995f90ab2cebaae203409b3/skills/otel-go/evals/files/go-v145-upgrade.md
- nullbench commit used: `260e867` (worktree `~/code/nullbench-skilldir`, branch `feat/skill-dir` — this suite needs `skill_dir`, not yet on `~/code/nullbench`'s `main`)
