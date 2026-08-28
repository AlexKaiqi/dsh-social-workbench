package demandintel

import (
	"context"
	"time"
)

// Platform knowledge describes how a platform is understood. It is low-volume,
// reviewed, and versioned independently from high-volume observations returned
// by connectors.

type PlatformConceptKind string

const (
	ConceptEntity       PlatformConceptKind = "entity"
	ConceptEvent        PlatformConceptKind = "event"
	ConceptMetric       PlatformConceptKind = "metric"
	ConceptRelationship PlatformConceptKind = "relationship"
	ConceptEnumeration  PlatformConceptKind = "enumeration"
	ConceptPolicy       PlatformConceptKind = "policy"
)

type PlatformConceptRef struct {
	Platform PlatformID
	ID       PlatformConceptID
	Version  string
}

type PlatformConceptField struct {
	Name        string
	Schema      SchemaRef
	Required    bool
	Description string
}

type PlatformConceptRelation struct {
	Predicate   string
	Target      PlatformConceptRef
	Cardinality string
}

// PlatformConceptDefinition defines stable platform vocabulary such as video,
// creator, comment, listing, job, view-count, or live-room. It never stores a
// concrete video, comment, metric sample, or account.
type PlatformConceptDefinition struct {
	Ref          PlatformConceptRef
	Kind         PlatformConceptKind
	Name         string
	Summary      string
	Identity     []string
	Fields       []PlatformConceptField
	Relations    []PlatformConceptRelation
	Lifecycle    []string
	Evidence     []EvidenceLink
	Deprecated   bool
	SupersededBy *PlatformConceptRef
	Extensions   []ExtensionPayload
}

type AccessMethodRef struct {
	Platform PlatformID
	ID       AccessMethodID
	Version  string
}

// AccessMethodDefinition records stable knowledge about one documented or
// evidenced way to reach a platform surface. Credentials, account grants,
// current health, and runtime configuration belong to ConnectorInstance.
type AccessMethodDefinition struct {
	Ref               AccessMethodRef
	Name              string
	Mode              AccessMode
	Official          bool
	AccountTypes      []string
	RequiredScopes    []string
	Regions           []string
	InputSchema       SchemaRef
	OutputSchema      SchemaRef
	TermsEvidence     []EvidenceLink
	TechnicalEvidence []EvidenceLink
	CheckedAt         time.Time
	ExpiresAt         *time.Time
	Confidence        Confidence
	Extensions        []ExtensionPayload
}

// PlatformCapabilityDefinition maps one platform-independent capability to
// platform concepts and evidenced access methods. It is knowledge, not a claim
// that any local connector is currently callable.
type PlatformCapabilityDefinition struct {
	Capability     CapabilityRef
	Subjects       []PlatformConceptRef
	Results        []PlatformConceptRef
	AccessMethods  []AccessMethodRef
	AccountTypes   []string
	RequiredScopes []string
	Regions        []string
	Semantics      CapabilitySemantics
	Evidence       []EvidenceLink
	Confidence     Confidence
	CheckedAt      time.Time
	ExpiresAt      *time.Time
	Deprecated     bool
	Extensions     []ExtensionPayload
}

// PlatformDefinition owns platform identity only. Its concepts, capabilities,
// and access methods are committed together in PlatformKnowledgeSnapshot.
type PlatformDefinition struct {
	ID                PlatformID
	Version           string
	DisplayName       string
	ResourceNamespace string
	AccountTypes      []string
	TermsEvidence     []EvidenceLink
	Extensions        []ExtensionPayload
}

// PlatformKnowledgeSnapshot is a content-addressable belief commit. Parent and
// merge parents preserve history; a mutable "latest" pointer is only a view.
type PlatformKnowledgeSnapshot struct {
	ID                       KnowledgeSnapshotID
	Parent                   *KnowledgeSnapshotID
	MergeParents             []KnowledgeSnapshotID
	Platform                 PlatformDefinition
	CapabilityCatalogVersion string
	CapabilityDefinitions    []CapabilityDefinition
	Concepts                 []PlatformConceptDefinition
	Capabilities             []PlatformCapabilityDefinition
	AccessMethods            []AccessMethodDefinition
	Evidence                 []EvidenceLink
	Message                  string
	AuthoredBy               PrincipalID
	CommittedAt              time.Time
}

type KnowledgeObjectKind string

const (
	KnowledgeObjectPlatform     KnowledgeObjectKind = "platform"
	KnowledgeObjectConcept      KnowledgeObjectKind = "concept"
	KnowledgeObjectCapability   KnowledgeObjectKind = "capability"
	KnowledgeObjectAccessMethod KnowledgeObjectKind = "access-method"
)

type KnowledgeChangeOperation string

const (
	KnowledgeAdd       KnowledgeChangeOperation = "add"
	KnowledgeSupersede KnowledgeChangeOperation = "supersede"
	KnowledgeDeprecate KnowledgeChangeOperation = "deprecate"
)

// KnowledgeChange uses a versioned payload because the proposal workflow must
// not invent a second untyped representation of concept/capability objects.
type KnowledgeChange struct {
	Operation KnowledgeChangeOperation
	Kind      KnowledgeObjectKind
	Object    ObjectRef
	Payload   ExtensionPayload
	Reason    string
}

type KnowledgeProposalState string

const (
	KnowledgeProposalPending   KnowledgeProposalState = "pending"
	KnowledgeProposalAccepted  KnowledgeProposalState = "accepted"
	KnowledgeProposalRejected  KnowledgeProposalState = "rejected"
	KnowledgeProposalCommitted KnowledgeProposalState = "committed"
)

// KnowledgeProposal is agent-authored but evidence-bound. Agent output is not
// stable platform knowledge until review/policy accepts and commits it.
type KnowledgeProposal struct {
	ID             KnowledgeProposalID
	Platform       PlatformID
	Base           KnowledgeSnapshotID
	Changes        []KnowledgeChange
	Evidence       []RevisionRef
	EvidenceLinks  []EvidenceLink
	Observations   []ObservationID
	Curator        string
	CuratorVersion string
	PromptHash     ContentHash
	State          KnowledgeProposalState
	ProposedBy     PrincipalID
	ProposedAt     time.Time
}

type KnowledgeDecision struct {
	Proposal  KnowledgeProposalID
	Accepted  bool
	Reason    string
	DecidedBy PrincipalID
	DecidedAt time.Time
}

type KnowledgeDiff struct {
	From    KnowledgeSnapshotID
	To      KnowledgeSnapshotID
	Changes []KnowledgeChange
}

type PlatformKnowledgeFilter struct {
	Platform PlatformID
	AsOf     *time.Time
	Cursor   *Cursor
	Limit    int
}

// VersionedPlatformKnowledge is intentionally storage-neutral. Dolt is a good
// candidate implementation, but connector and analysis contracts do not depend
// on Dolt SQL, branches, or system tables.
type VersionedPlatformKnowledge interface {
	GetSnapshot(context.Context, KnowledgeSnapshotID) (PlatformKnowledgeSnapshot, error)
	GetHead(context.Context, PlatformID, string) (PlatformKnowledgeSnapshot, error)
	GetCapability(context.Context, KnowledgeSnapshotID, CapabilityRef) (CapabilityDefinition, error)
	ListSnapshots(context.Context, PlatformKnowledgeFilter) (Page[PlatformKnowledgeSnapshot], error)
	Diff(context.Context, KnowledgeSnapshotID, KnowledgeSnapshotID) (KnowledgeDiff, error)
	AppendProposal(context.Context, KnowledgeProposal) error
	GetProposal(context.Context, KnowledgeProposalID) (KnowledgeProposal, error)
	RecordDecision(context.Context, KnowledgeDecision) error
	CommitProposal(context.Context, KnowledgeProposalID, KnowledgeSnapshotID) (PlatformKnowledgeSnapshot, error)
}

type PlatformKnowledgeCurationRequest struct {
	Operation     OperationContext
	Platform      PlatformID
	Base          KnowledgeSnapshotID
	Evidence      []RevisionRef
	EvidenceLinks []EvidenceLink
	Observations  []ObservationID
	Question      string
}

// PlatformKnowledgeCurator may prepare proposals only; durable knowledge still
// crosses the repository's explicit decision and compare-and-swap commit gate.
type PlatformKnowledgeCurator interface {
	Propose(context.Context, PlatformKnowledgeCurationRequest) (KnowledgeProposal, error)
}
