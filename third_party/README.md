# Pinned sidecars

`sidecars.json` is the single version manifest for the two browser execution projects and the optional Douyin research project used by the runtime. `scripts/bootstrap-sidecars.mjs` clones exactly those commits into a local DSH state root; it does not vendor upstream source into this repository.

Reuse policy:

- `xpzouying/xiaohongshu-mcp`: unchanged Apache-2.0 sidecar. The DSH HTTP adapter adds private-only test mode and creator-profile verification outside upstream code.
- `broadcast-kit`: MIT sidecar with `social-workbench.patch`. The patch fixes the conflicting package license metadata, makes doctor honor the configured state root, supports immediate publish, adds fail-closed private visibility selection, and prevents the generic dispatcher from reporting success without all verification gates.
- `imageio-ffmpeg==0.6.0`: optional local installer for the ffmpeg executable required by the Douyin cover flow. The binary stays in local sidecar state and is not redistributed by this repository.
- `NanmiCoder/MediaCrawler`: optional, pinned, non-commercial-learning-only Douyin research sidecar. It is installed only with `--with-douyin-research`/`--only-douyin-research` plus explicit `--accept-mediacrawler-license`; the DSH wrapper disables CDP access to the user's normal Chrome and uses a dedicated persistent Playwright profile.
- `faster-whisper==1.2.1`: optional local ASR dependency installed only with `--with-local-asr`; media and model execution stay on the local machine.
- `uv==0.8.12`: pinned bootstrap-only installer kept in the local sidecar root when no explicit `--uv` binary is supplied; it applies MediaCrawler's committed `uv.lock` without modifying the system Python environment.

The default research runtime is Docker: `npm run bootstrap:douyin-research:docker -- --accept-mediacrawler-license` builds the pinned image, starts a loopback-only noVNC surface, and mounts only the dedicated profile state and research-artifact directories. The container is never privileged and does not mount the Docker socket, the normal browser profile, the Workspace, or `$DSH_HOME` broadly.

The patch is intentionally kept as a normal `git apply` artifact so the fork delta is reviewable and can be proposed upstream. `npm run bootstrap:sidecars -- --root <absolute-path>` checks the pinned commit and patch applicability before installation. It never logs in or publishes.
