# Model surface

`prompt.js` and `tool-surface.js` are the only model-visible sources for the staging plugin.

The surface intentionally excludes plan approval, outbox enqueue, confirmation, live execution, reconciliation, feedback recording, and review acceptance. It may read user-managed release and learning ledger objects by stable ID so the Agent can reason from actual results. Login state and one-time tokens must never enter model tool arguments.
