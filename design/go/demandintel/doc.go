// Package demandintel defines design-only contracts for an evidence-grounded
// demand intelligence and active probing system.
//
// The package deliberately contains no connector implementation, persistence,
// network transport, scheduler, retry loop, model invocation, or DSH assembly.
// It is a typed architecture artifact, not a promise of runtime capability and
// not an independent runtime source of truth. Before implementation, every
// durable type must point to one normative versioned schema; Go and JavaScript
// types are generated projections or explicitly verified compatibility views.
package demandintel
