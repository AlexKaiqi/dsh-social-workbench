# Model surface

`prompt.js` and `tool-surface.js` are the only model-visible sources for the staging plugin.

The surface intentionally excludes confirmation and live execution. A future product UI may call the user-held publication boundary, but login state and one-time tokens must never enter the model tool arguments.
