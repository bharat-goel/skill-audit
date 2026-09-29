# Run ledger

Every nullbench run in this repository, in order, including runs that were voided,
exploratory, or showed nothing. Appended automatically; do not edit by hand.

## 2026-09-28T15:12:55Z · VOID · H=823994c3476651eb
```
model=sonnet judge=sonnet reps=10
note: task "cds-e2-create-team-modal" treatment: 0 graded runs, 8 required
note: task "cds-e3-banner-progress" control: 0 graded runs, 8 required
note: task "cds-e3-banner-progress" treatment: 0 graded runs, 8 required
note: task "cds-e4-sidebar-nav" control: 0 graded runs, 8 required
note: task "cds-e4-sidebar-nav" treatment: 0 graded runs, 8 required
note: task "cds-e5-empty-state" control: 0 graded runs, 8 required
note: task "cds-e5-empty-state" treatment: 0 graded runs, 8 required
```

## 2026-09-29T14:58:45Z · EXPLORATORY · H=823994c3476651eb
```
model=sonnet judge=sonnet reps=10
audit-harm-routine       harm   predict=no-effect   9/10 ->   9/10    +0.0pp [-31.5pp, +31.5pp]  HIT  (non-discriminating)
cds-e1-profile-card      signal predict=helps       0/10 ->   0/10    +0.0pp [-27.8pp, +27.8pp]  MISS  (non-discriminating)
cds-e2-create-team-modal signal predict=helps       0/10 ->   3/10   +30.0pp [-3.8pp, +60.3pp]  MISS  (non-discriminating)
cds-e3-banner-progress   signal predict=no-effect   0/10 ->   0/10    +0.0pp [-27.8pp, +27.8pp]  HIT  (non-discriminating)
cds-e4-sidebar-nav       signal predict=no-effect   0/10 ->   0/10    +0.0pp [-27.8pp, +27.8pp]  HIT  (non-discriminating)
cds-e5-empty-state       signal predict=helps       0/10 ->   0/10    +0.0pp [-27.8pp, +27.8pp]  MISS  (non-discriminating)
average across signal tasks: suppressed — run is exploratory
note: judge canaries misgraded; judged tasks cannot be confirmed
```
