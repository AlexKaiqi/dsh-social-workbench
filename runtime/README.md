# Dual-platform runtime spike

This directory is the dependency-free execution core for the Social Workbench publication truth gate. The root DSH plugin imports its content pipeline for staging, while live sidecar execution remains a user-side CLI boundary.

It implements:

- content revisions hashed from canonical JSON, including media and execution-manifest file fingerprints;
- private-only test mode;
- one-time, expiring confirmations bound to platform/account/visibility/revision;
- cross-process file locks for confirmation consumption and attempt transitions;
- durable temporary-file publication, corrupt-object quarantine, stale-lock recovery, and bounded recovery-artifact cleanup;
- deterministic attempt identity, idempotent receipt replay, and conservative `unknown` recovery after submission may have started;
- explicit `submitted` versus `confirmed` states;
- an HTTP adapter for the pinned `xpzouying/xiaohongshu-mcp` REST surface;
- a Douyin adapter that invokes the strict per-platform `broadcast-kit` CLI and independently checks its verdict triple;
- immutable receipts without cookies, tokens or raw credentials.
- immutable plan hashes, explicit user plan approval, and deterministic outbox ids;
- per-item execution that still consumes the existing per-revision confirmation;
- evidence-only reconciliation for unknown outcomes without automatic resubmission;
- append-only raw metric snapshots and authorized feedback items;
- hypothesis reviews that create the next brief with explicit review lineage.

Run the executable contract suite with Node 24:

```sh
source ~/.nvm/nvm.sh
nvm use 24.17.0
cd runtime
npm run check
```

No command in the test suite logs in or writes to a platform. A live call must go through `PublicationLoop.execute`, which consumes a one-time confirmation. The Douyin adapter additionally refuses live execution until its pinned fork proves that it selected private visibility.

The root Cordis service exposes only ingress, brief, package, status, and bounded ledger reads. Plan approval, enqueue, `confirm`, execution, reconciliation, feedback writes, and review acceptance intentionally remain absent from the model tool surface.

The root command is `npm run social -- <command>`; installed packages also expose the same interface as `dsh-social`. See `docs/DUAL_PLATFORM_RUNBOOK.md` and `docs/RELEASE_FEEDBACK_LOOP.md`; confirmation tokens are accepted only through `DSH_SOCIAL_CONFIRMATION_TOKEN`, never as command-line arguments.
