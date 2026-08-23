# Pinned sidecars

`sidecars.json` is the single version manifest for the two browser execution projects used by the walking skeleton. `scripts/bootstrap-sidecars.mjs` clones exactly those commits into a local DSH state root; it does not vendor upstream source into this repository.

Reuse policy:

- `xpzouying/xiaohongshu-mcp`: unchanged Apache-2.0 sidecar. The DSH HTTP adapter adds private-only test mode and creator-profile verification outside upstream code.
- `broadcast-kit`: MIT sidecar with `social-workbench.patch`. The patch fixes the conflicting package license metadata, makes doctor honor the configured state root, supports immediate publish, adds fail-closed private visibility selection, and prevents the generic dispatcher from reporting success without all verification gates.
- `imageio-ffmpeg==0.6.0`: optional local installer for the ffmpeg executable required by the Douyin cover flow. The binary stays in local sidecar state and is not redistributed by this repository.

The patch is intentionally kept as a normal `git apply` artifact so the fork delta is reviewable and can be proposed upstream. `npm run bootstrap:sidecars -- --root <absolute-path>` checks the pinned commit and patch applicability before installation. It never logs in or publishes.
