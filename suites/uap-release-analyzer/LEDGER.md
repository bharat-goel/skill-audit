# Run ledger

Every nullbench run in this repository, in order, including runs that were voided,
exploratory, or showed nothing. Appended automatically; do not edit by hand.

## 2026-09-24T00:18:01Z · VOID · H=ef9be7b4ff77bd4a
```
model=sonnet judge=sonnet reps=10
note: task "fresh-tranche-bootstrap-e1" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e1" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e2" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e2" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e3" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e3" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e4" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e4" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e5" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e5" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e6" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e6" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e7" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e7" treatment: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e8" control: 0 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e8" treatment: 0 graded runs, 8 required
```

## 2026-09-24T15:33:06Z · VOID · H=ef9be7b4ff77bd4a
```
model=sonnet judge=sonnet reps=10
note: task "fresh-tranche-bootstrap-e8" control: 4 graded runs, 8 required
note: task "fresh-tranche-bootstrap-e8" treatment: 0 graded runs, 8 required
```

## 2026-09-24T21:19:06Z · EXPLORATORY · H=ef9be7b4ff77bd4a
```
model=sonnet judge=sonnet reps=10
audit-harm-routine       harm   predict=no-effect  10/10 ->  10/10    +0.0pp [-27.8pp, +27.8pp]  HIT  (non-discriminating)
fresh-tranche-bootstrap-e1 signal predict=helps       0/10 ->   1/10   +10.0pp [-18.9pp, +40.4pp]  MISS  (non-discriminating)
fresh-tranche-bootstrap-e2 signal predict=helps       0/10 ->  10/10  +100.0pp [+60.7pp, +100.0pp]  HIT
fresh-tranche-bootstrap-e3 signal predict=helps       0/10 ->   9/10   +90.0pp [+48.8pp, +98.2pp]  HIT
fresh-tranche-bootstrap-e4 signal predict=helps       0/10 ->   2/10   +20.0pp [-11.2pp, +51.0pp]  MISS  (non-discriminating)
fresh-tranche-bootstrap-e5 signal predict=helps       0/10 ->   1/10   +10.0pp [-18.9pp, +40.4pp]  MISS  (non-discriminating)
fresh-tranche-bootstrap-e6 signal predict=helps       0/10 ->  10/10  +100.0pp [+60.7pp, +100.0pp]  HIT
fresh-tranche-bootstrap-e7 signal predict=helps      10/10 ->  10/10    +0.0pp [-27.8pp, +27.8pp]  MISS  (non-discriminating)
fresh-tranche-bootstrap-e8 signal predict=helps       0/10 ->   1/10   +10.0pp [-18.9pp, +40.4pp]  MISS  (non-discriminating)
average across signal tasks: suppressed — run is exploratory
note: judge canaries misgraded; judged tasks cannot be confirmed
```
