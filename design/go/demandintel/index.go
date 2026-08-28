package demandintel

import (
	"context"
	"time"
)

type ProjectionKind string

const (
	ProjectionLexical  ProjectionKind = "lexical"
	ProjectionSemantic ProjectionKind = "semantic"
	ProjectionFacet    ProjectionKind = "facet"
	ProjectionTemporal ProjectionKind = "temporal"
	ProjectionRelation ProjectionKind = "relation"
)

type ProjectionSourceKind string

const (
	ProjectionSourceKnowledge   ProjectionSourceKind = "platform-knowledge"
	ProjectionSourceObservation ProjectionSourceKind = "observation-facts"
	ProjectionSourceCanonical   ProjectionSourceKind = "canonical-revisions"
	ProjectionSourceDerivation  ProjectionSourceKind = "derived-signals"
)

type ProjectionMaintenance string

const (
	MaintenanceRebuild     ProjectionMaintenance = "rebuild"
	MaintenanceIncremental ProjectionMaintenance = "incremental"
	MaintenanceContinuous  ProjectionMaintenance = "continuous"
)

type MaterializationAdmission string

const (
	AdmissionExplicit         MaterializationAdmission = "explicit"
	AdmissionWorkloadAssisted MaterializationAdmission = "workload-assisted"
)

type MaterializationEviction string

const (
	EvictionManual      MaterializationEviction = "manual"
	EvictionLeastUseful MaterializationEviction = "least-useful"
)

// MaterializationPolicy makes adaptive indexing a governed optimization. Query
// telemetry may recommend a projection, but must not silently create an
// unbounded second source of truth.
type MaterializationPolicy struct {
	Admission              MaterializationAdmission
	Eviction               MaterializationEviction
	FreshnessSLO           time.Duration
	MinimumQueryReuse      uint64
	MaximumBuildCost       float64
	MaximumStorageBytes    int64
	MaximumMaintenanceCost float64
}

type ProjectionSpec struct {
	ID                ProjectionID
	Kind              ProjectionKind
	Version           string
	Sources           []ProjectionSourceKind
	SourceSchema      SchemaRef
	Definition        SchemaRef
	Maintenance       ProjectionMaintenance
	Policy            MaterializationPolicy
	KnowledgeSnapshot *KnowledgeSnapshotID
	ChunkerVersion    string
	ModelRoute        string
	VectorDimension   int
}

type MaterializationState string

const (
	MaterializationProposed  MaterializationState = "proposed"
	MaterializationBuilding  MaterializationState = "building"
	MaterializationActive    MaterializationState = "active"
	MaterializationStale     MaterializationState = "stale"
	MaterializationSuspended MaterializationState = "suspended"
)

// ProjectionMaterialization is a rebuildable serving artifact. Source
// snapshots/checkpoints record exactly what it contains; it is never canonical.
type ProjectionMaterialization struct {
	ID                MaterializationID
	Projection        ProjectionID
	ProjectionVersion string
	State             MaterializationState
	KnowledgeSnapshot *KnowledgeSnapshotID
	SourceCheckpoints []Cursor
	CreatedAt         time.Time
	RefreshedAt       time.Time
	Lag               time.Duration
}

type ProjectionTelemetry struct {
	Materialization MaterializationID
	Window          TimeWindow
	QueryCount      uint64
	HitCount        uint64
	LatencySaved    time.Duration
	BuildCost       float64
	MaintenanceCost float64
	StorageBytes    int64
	LastUsedAt      *time.Time
}

type ProjectionResult struct {
	Projection  ProjectionID
	Source      RevisionRef
	Version     string
	ProjectedAt time.Time
	Artifacts   []string
}

type ProjectionCatalog interface {
	Register(context.Context, ProjectionSpec) error
	Get(context.Context, ProjectionID, string) (ProjectionSpec, error)
	GetMaterialization(context.Context, MaterializationID) (ProjectionMaterialization, error)
	RecordTelemetry(context.Context, ProjectionTelemetry) error
}

type RetrievalRequest struct {
	Operation OperationContext
	Principal PrincipalID
	Purpose   string
	Query     string
	Filters   map[string][]string
	AsOf      *time.Time
	Budget    RetrievalBudget
}

type RetrievalBudget struct {
	MaxCandidates int
	MaxEvidence   int
	MaxTokens     int
}

type ScoredEvidence struct {
	Evidence EvidenceSpan
	Scores   map[string]float64
	Rank     int
}

type RetrievalTrace struct {
	ID                 string
	Request            RetrievalRequest
	ProjectionVersions map[ProjectionID]string
	PolicyDecisions    []PolicyDecisionID
	Stages             []RetrievalStage
	CreatedAt          time.Time
}

type RetrievalStage struct {
	Name       string
	Candidates int
	Parameters map[string]string
}

type RetrievalResult struct {
	Evidence []ScoredEvidence
	Trace    RetrievalTrace
}

type ProjectionBatchRequest struct {
	Operation OperationContext
	Spec      ProjectionSpec
	Sources   []SourceItemRevision
	Cursor    *Cursor
	Complete  bool
}

type ProjectionBatchResult struct {
	Results    []ProjectionResult
	NextCursor *Cursor
	Complete   bool
}

type Indexer interface {
	Project(context.Context, OperationContext, ProjectionSpec, SourceItemRevision) (ProjectionResult, error)
	Remove(context.Context, OperationContext, ProjectionSpec, RevisionRef) error
	ProjectBatch(context.Context, ProjectionBatchRequest) (ProjectionBatchResult, error)
}

type Retriever interface {
	Retrieve(context.Context, RetrievalRequest) (RetrievalResult, error)
	Lookup(context.Context, PrincipalID, string, []RevisionRef) ([]SourceItemRevision, error)
	Explain(context.Context, string) (RetrievalTrace, error)
}
