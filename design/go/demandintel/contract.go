package demandintel

import (
	"context"
	"time"
)

type ContractStatus string

const (
	ContractCandidate  ContractStatus = "candidate"
	ContractNormative  ContractStatus = "normative"
	ContractDeprecated ContractStatus = "deprecated"
	ContractRetired    ContractStatus = "retired"
)

// ContractDefinition identifies the single normative schema for a durable or
// exchanged object. Language-specific types are projections of this contract.
type ContractDefinition struct {
	ID          string
	Version     string
	Schema      SchemaRef
	Status      ContractStatus
	Owner       string
	PublishedAt time.Time
	Supersedes  *SchemaRef
}

type CompatibilityKind string

const (
	CompatibilityLossless CompatibilityKind = "lossless"
	CompatibilityLossy    CompatibilityKind = "lossy"
	CompatibilityRejected CompatibilityKind = "rejected"
)

// ContractMapping is required when an existing runtime slice and the generic
// demand-intelligence contract use different vocabulary or cardinality.
type ContractMapping struct {
	From       SchemaRef
	To         SchemaRef
	Kind       CompatibilityKind
	Profile    string
	Rules      []string
	Evidence   []EvidenceLink
	VerifiedAt time.Time
}

type ContractCatalog interface {
	Resolve(context.Context, string, string) (ContractDefinition, error)
	ListMappings(context.Context, SchemaRef) ([]ContractMapping, error)
}
