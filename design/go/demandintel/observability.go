package demandintel

import (
	"context"
	"time"
)

// DomainEvent records a durable state transition. Payload is schema-bound and
// content-addressed so event consumers can evolve independently.
type DomainEvent struct {
	ID                DomainEventID
	SchemaVersion     string
	Operation         OperationContext
	EventType         string
	Aggregate         ObjectRef
	AggregateRevision uint64
	OccurredAt        time.Time
	ObservedAt        time.Time
	Producer          string
	Payload           ExtensionPayload
}

type OperationStatus string

const (
	OperationOK        OperationStatus = "ok"
	OperationError     OperationStatus = "error"
	OperationUnknown   OperationStatus = "unknown"
	OperationCancelled OperationStatus = "cancelled"
)

// OperationSpan is backend-neutral. An implementation may map it to
// OpenTelemetry, but the semantic fields remain part of this domain contract.
type OperationSpan struct {
	ID         SpanID
	Parent     SpanID
	Operation  OperationContext
	Name       string
	Component  string
	Status     OperationStatus
	StartedAt  time.Time
	FinishedAt time.Time
	Error      *ErrorInfo
}

// Dimension is intentionally low-cardinality and must never contain source
// content, personal identifiers, credentials, URLs, or external object IDs.
type Dimension struct {
	Name  string
	Value string
}

type Measurement struct {
	ID         MeasurementID
	Operation  OperationContext
	Name       string
	Value      float64
	Unit       string
	Dimensions []Dimension
	MeasuredAt time.Time
}

type CostObservation struct {
	Operation  OperationContext
	Provider   string
	Category   string
	Quantity   float64
	Unit       string
	Amount     float64
	Currency   string
	ObservedAt time.Time
}

type RateLimitObservation struct {
	Operation  OperationContext
	Limit      int64
	Remaining  int64
	ResetAt    *time.Time
	ObservedAt time.Time
}

type HealthState string

const (
	HealthReady         HealthState = "ready"
	HealthDegraded      HealthState = "degraded"
	HealthBlocked       HealthState = "blocked"
	HealthUnknown       HealthState = "unknown"
	HealthNotApplicable HealthState = "not-applicable"
)

type ConditionStatus string

const (
	ConditionTrue    ConditionStatus = "true"
	ConditionFalse   ConditionStatus = "false"
	ConditionUnknown ConditionStatus = "unknown"
)

type HealthCondition struct {
	Type        string
	Status      ConditionStatus
	Reason      string
	Summary     string
	ObservedAt  time.Time
	Evidence    []BlobID
	Remediation string
}

type HealthSnapshot struct {
	ID         HealthSnapshotID
	Scope      ScopeRef
	Component  string
	Connector  ConnectorID
	Capability Capability
	State      HealthState
	Conditions []HealthCondition
	DataAge    time.Duration
	ObservedAt time.Time
	ExpiresAt  time.Time
}

type SLOTarget struct {
	Name       string
	Indicator  string
	Target     float64
	Window     time.Duration
	Dimensions []Dimension
}

type SLOObservation struct {
	Target      SLOTarget
	Window      TimeWindow
	Actual      float64
	GoodEvents  uint64
	TotalEvents uint64
	EvaluatedAt time.Time
}

type DomainEventSink interface {
	AppendDomainEvent(context.Context, DomainEvent) error
}

type OperationalTelemetry interface {
	RecordSpan(context.Context, OperationSpan) error
	RecordMeasurement(context.Context, Measurement) error
	RecordCost(context.Context, CostObservation) error
	RecordRateLimit(context.Context, RateLimitObservation) error
}

type HealthReporter interface {
	PublishHealth(context.Context, HealthSnapshot) error
}

type SLOReporter interface {
	PublishSLO(context.Context, SLOObservation) error
}
