package demandintel

import (
	"context"
	"io"
	"time"
)

type BlobDescriptor struct {
	ID        BlobID
	Scope     ScopeRef
	Hash      ContentHash
	MediaType string
	Size      int64
	Rights    Rights
	CreatedAt time.Time
}

type SourceItemRevision struct {
	ID                SourceItemID
	Scope             ScopeRef
	Revision          uint64
	Previous          *RevisionRef
	KnowledgeSnapshot KnowledgeSnapshotID
	Concept           PlatformConceptRef
	ExternalID        ExternalID
	CanonicalURL      string
	SourceType        string
	Title             string
	BodyBlob          BlobID
	PublishedAt       *time.Time
	ObservedAt        time.Time
	Extensions        []ExtensionPayload
	Rights            Rights
	DataHandling      *DataHandlingMetadata
	DerivedFrom       []ObservationID
	CommittedAt       time.Time
}

type ObservationFilter struct {
	Scope     ScopeRef
	Connector ConnectorID
	Run       CollectionRunID
	Window    *TimeWindow
	Limit     int
	Cursor    *Cursor
}

// FactQuery is analytical rather than operational: it filters append-only
// observations by platform ontology, event time, and the knowledge snapshot
// used to interpret them. Payload blobs remain in EvidenceRepository.
type FactQuery struct {
	Scope               ScopeRef
	Platform            PlatformID
	Concepts            []PlatformConceptRef
	KnowledgeSnapshot   *KnowledgeSnapshotID
	ObservedWindow      *TimeWindow
	SourceUpdatedWindow *TimeWindow
	Limit               int
	Cursor              *Cursor
}

type SourceItemFilter struct {
	Scope      ScopeRef
	SourceType string
	ExternalID ExternalID
	AsOf       *time.Time
	Limit      int
	Cursor     *Cursor
}

type EvidenceRepository interface {
	PutBlob(context.Context, BlobDescriptor, io.Reader) (BlobDescriptor, error)
	OpenBlob(context.Context, BlobID, PrincipalID, string) (io.ReadCloser, error)
	AppendObservation(context.Context, Observation) error
	GetObservation(context.Context, ObservationID) (Observation, error)
	ListObservations(context.Context, ObservationFilter) (Page[Observation], error)
	AppendTombstone(context.Context, Tombstone) error
}

// AnalyticalFactWarehouse is the query-oriented sink for concrete platform
// data. It may share physical storage with EvidenceRepository at small scale,
// but its retention, partitioning, and materialization concerns are separate
// from versioned platform knowledge.
type AnalyticalFactWarehouse interface {
	AppendFacts(context.Context, []Observation) error
	QueryFacts(context.Context, FactQuery) (Page[Observation], error)
}

type CanonicalRepository interface {
	CommitSourceItem(context.Context, SourceItemCandidate, *uint64) (SourceItemRevision, error)
	GetSourceItem(context.Context, RevisionRef) (SourceItemRevision, error)
	GetLatestSourceItem(context.Context, SourceItemID) (SourceItemRevision, error)
	ListSourceItems(context.Context, SourceItemFilter) (Page[SourceItemRevision], error)
	ApplyTombstone(context.Context, SourceItemID, Tombstone, *uint64) (SourceItemRevision, error)
}

type CheckpointRepository interface {
	GetCheckpoint(context.Context, CollectionPlanID, ConnectorID) (*Cursor, error)
	AdvanceCheckpoint(context.Context, CollectionPlanID, ConnectorID, *Cursor, Cursor) error
}
