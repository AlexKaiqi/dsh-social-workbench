package demandintel

import (
	"context"
	"time"
)

type ProbeHypothesis struct {
	ID               HypothesisID
	Scope            ScopeRef
	Revision         uint64
	Opportunity      RevisionRef
	Statement        string
	TargetSegment    string
	ExpectedBehavior string
	Falsifier        string
	CreatedBy        PrincipalID
	CreatedAt        time.Time
}

type ProbeVariant struct {
	ID           string
	Offer        string
	Message      string
	CallToAction string
	MediaRefs    []BlobID
	Extensions   []ExtensionPayload
}

type InferenceMode string

const (
	InferenceQualitative InferenceMode = "qualitative"
	InferenceDirectional InferenceMode = "directional"
	InferenceCausal      InferenceMode = "causal"
)

// ExperimentAllocation uses millionths instead of floating-point weights so a
// reviewed plan has one deterministic representation and hash.
type ExperimentAllocation struct {
	VariantID string
	WeightPPM uint32
	Baseline  bool
}

// ExperimentAssignmentPolicy fixes who is eligible and how an eligible unit is
// assigned. SeedRef is a versioned reference, never secret seed material.
type ExperimentAssignmentPolicy struct {
	Revision              uint64
	Unit                  string
	EligibilityRef        string
	Method                string
	HashAttribute         string
	HashVersion           string
	SeedRef               string
	StickyPolicyRef       string
	MutualExclusionRef    string
	HoldoutRef            string
	ReassignmentPolicy    string
	ProviderDefinitionRef string
}

// ExperimentExposurePolicy is separate from assignment: evaluating or
// assigning a treatment is not proof that a unit experienced the treatment.
type ExperimentExposurePolicy struct {
	Revision        uint64
	TriggerRef      string
	AttributionUnit string
	DedupeRule      string
	Window          time.Duration
	LagAllowance    time.Duration
	DefinitionRef   string
}

// ExperimentAnalysisPolicy fixes decision semantics before observations are
// collected. Provider-defined statistical details remain schema-bound refs.
type ExperimentAnalysisPolicy struct {
	Revision                uint64
	Method                  string
	MinimumSampleSize       uint64
	MinimumDuration         time.Duration
	MinimumDetectableEffect float64
	EffectUnit              string
	DecisionThreshold       float64
	DecisionThresholdUnit   string
	SequentialTesting       bool
	MultipleComparisonRef   string
	VarianceReductionRef    string
	StoppingRule            string
	MetricDefinitionSetRef  string
	ProviderDefinitionRef   string
}

// ExperimentPhase is an immutable assignment/exposure/analysis definition.
// Allocation or metric-definition changes create a new phase or iteration;
// observations from different phases are not pooled by default.
type ExperimentPhase struct {
	ID                   string
	Revision             uint64
	ProviderIterationRef string
	Allocation           []ExperimentAllocation
	Assignment           ExperimentAssignmentPolicy
	Exposure             ExperimentExposurePolicy
	Analysis             ExperimentAnalysisPolicy
	DefinitionHash       string
}

// ExperimentDesign makes the strength of a probe claim explicit. Causal mode
// is valid only when the connector preserves the exact phase, assignment,
// exposure, metric definitions, health checks, and lifecycle receipts.
type ExperimentDesign struct {
	Mode              InferenceMode
	PrimaryVariable   string
	ControlVariant    string
	Phase             ExperimentPhase
	SampleConstraints []ExtensionPayload
}

type ExperimentLifecycleAction string

const (
	ExperimentCreateDraft      ExperimentLifecycleAction = "create-draft"
	ExperimentPublishTreatment ExperimentLifecycleAction = "publish-treatment"
	ExperimentStartPhase       ExperimentLifecycleAction = "start-phase"
	ExperimentStopAssignment   ExperimentLifecycleAction = "stop-assignment"
	ExperimentStopAnalysis     ExperimentLifecycleAction = "stop-analysis"
	ExperimentServeTreatment   ExperimentLifecycleAction = "serve-treatment"
	ExperimentRollback         ExperimentLifecycleAction = "rollback-treatment"
	ExperimentArchive          ExperimentLifecycleAction = "archive"
	ExperimentProviderAction   ExperimentLifecycleAction = "provider-defined"
)

type ExperimentServingEffect string

const (
	ServingUnchanged       ExperimentServingEffect = "unchanged"
	ServingPublishConfig   ExperimentServingEffect = "publish-config"
	ServingBeginAllocation ExperimentServingEffect = "begin-allocation"
	ServingEndAllocation   ExperimentServingEffect = "end-allocation"
	ServingShipTreatment   ExperimentServingEffect = "serve-treatment"
	ServingRollback        ExperimentServingEffect = "rollback-treatment"
	ServingProviderEffect  ExperimentServingEffect = "provider-defined"
)

type ExperimentAnalysisEffect string

const (
	AnalysisUnchanged      ExperimentAnalysisEffect = "unchanged"
	AnalysisStart          ExperimentAnalysisEffect = "start"
	AnalysisStop           ExperimentAnalysisEffect = "stop"
	AnalysisNewPhase       ExperimentAnalysisEffect = "new-phase"
	AnalysisRecompute      ExperimentAnalysisEffect = "recompute"
	AnalysisProviderEffect ExperimentAnalysisEffect = "provider-defined"
)

// ExperimentLifecycleIntent prevents verbs such as "stop" or "cancel" from
// hiding treatment-serving, allocation, notification, or analysis effects.
type ExperimentLifecycleIntent struct {
	Action               ExperimentLifecycleAction
	PhaseRef             string
	FromDefinitionRef    string
	ToDefinitionRef      string
	TreatmentVariantID   string
	ServingEffect        ExperimentServingEffect
	AnalysisEffect       ExperimentAnalysisEffect
	NotificationExpected bool
	Irreversible         bool
	Effects              []ExtensionPayload
}

type MetricDefinition struct {
	Name        string
	Kind        string
	Unit        string
	Aggregation string
	Threshold   float64
	Direction   string
	Version     string
}

type ProbePlan struct {
	ID                     ProbePlanID
	Scope                  ScopeRef
	Revision               uint64
	Hypothesis             RevisionRef
	Connection             ConnectionID
	Requirement            CapabilityRequirement
	AccountRef             string
	ChannelRationale       string
	Variants               []ProbeVariant
	Experiment             ExperimentDesign
	Lifecycle              ExperimentLifecycleIntent
	Window                 TimeWindow
	CostBudget             float64
	PrimaryMetric          MetricDefinition
	GuardrailMetrics       []MetricDefinition
	TruthfulAndFulfillable bool
	PolicyContext          []ExtensionPayload
	PlanHash               string
}

type FindingSeverity string

const (
	FindingInfo    FindingSeverity = "info"
	FindingWarning FindingSeverity = "warning"
	FindingError   FindingSeverity = "error"
	FindingBlocker FindingSeverity = "blocker"
)

type Finding struct {
	Code     string
	Severity FindingSeverity
	Message  string
	Field    string
}

type ProbePreview struct {
	Plan              RevisionRef
	Resolution        CapabilityResolutionID
	Route             CapabilityRouteID
	Connector         ConnectorID
	AdapterVersion    string
	CapabilityVersion string
	NormalizedPayload BlobID
	PayloadHash       string
	Findings          []Finding
	CreatedAt         time.Time
}

type Approval struct {
	ID                ApprovalID
	Plan              RevisionRef
	Resolution        CapabilityResolutionID
	Route             CapabilityRouteID
	PlanHash          string
	AccountRef        string
	AdapterVersion    string
	CapabilityVersion string
	ApprovedBy        PrincipalID
	ApprovedAt        time.Time
	ExpiresAt         time.Time
	OneTime           bool
}

type ProbeRunState string

const (
	ProbeRunPrepared    ProbeRunState = "prepared"
	ProbeRunQueued      ProbeRunState = "queued"
	ProbeRunExecuting   ProbeRunState = "executing"
	ProbeRunUnknown     ProbeRunState = "unknown"
	ProbeRunReconciling ProbeRunState = "reconciling"
	ProbeRunSucceeded   ProbeRunState = "succeeded"
	ProbeRunFailed      ProbeRunState = "failed"
	ProbeRunCancelled   ProbeRunState = "cancelled"
	ProbeRunSuspended   ProbeRunState = "suspended"
)

type ProbeRun struct {
	ID           ProbeRunID
	Operation    OperationContext
	Plan         RevisionRef
	Approval     ApprovalID
	Resolution   CapabilityResolutionID
	Route        CapabilityRouteID
	State        ProbeRunState
	StateVersion uint64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type ExecutionIntent struct {
	ID             ExecutionIntentID
	Run            ProbeRunID
	Plan           RevisionRef
	Approval       ApprovalID
	Resolution     CapabilityResolutionID
	Route          CapabilityRouteID
	Connector      ConnectorID
	PayloadHash    string
	IdempotencyKey string
	CreatedAt      time.Time
}

type OutboxState string

const (
	OutboxReady       OutboxState = "ready"
	OutboxClaimed     OutboxState = "claimed"
	OutboxReconciling OutboxState = "reconciling"
	OutboxCompleted   OutboxState = "completed"
	OutboxSuspended   OutboxState = "suspended"
)

type ProbeOutboxItem struct {
	ID                     OutboxItemID
	Run                    ProbeRunID
	Intent                 ExecutionIntentID
	State                  OutboxState
	StateVersion           uint64
	AvailableAt            time.Time
	AttemptCount           uint32
	ReconciliationRequired bool
	LastError              *ErrorInfo
	CreatedAt              time.Time
	UpdatedAt              time.Time
}

type WorkLease struct {
	Item       OutboxItemID
	Owner      string
	LeaseToken string
	ExpiresAt  time.Time
	Version    uint64
}

type AttemptState string

const (
	AttemptStarted   AttemptState = "started"
	AttemptSubmitted AttemptState = "submitted"
	AttemptUnknown   AttemptState = "unknown"
	AttemptSucceeded AttemptState = "succeeded"
	AttemptFailed    AttemptState = "failed"
	AttemptCancelled AttemptState = "cancelled"
)

type OperationAttempt struct {
	ID         AttemptID
	Operation  OperationContext
	Run        ProbeRunID
	OutboxItem OutboxItemID
	Intent     ExecutionIntentID
	Ordinal    uint32
	State      AttemptState
	StartedAt  time.Time
	FinishedAt *time.Time
	Error      *ErrorInfo
}

type ReceiptState string

const (
	ReceiptPrepared  ReceiptState = "prepared"
	ReceiptSubmitted ReceiptState = "submitted"
	ReceiptConfirmed ReceiptState = "confirmed"
	ReceiptUnknown   ReceiptState = "unknown"
	ReceiptFailed    ReceiptState = "failed"
	ReceiptCancelled ReceiptState = "cancelled"
)

type ProbeReceipt struct {
	ID           ReceiptID
	Run          ProbeRunID
	Attempt      AttemptID
	Intent       ExecutionIntentID
	ExternalID   ExternalID
	ExternalURL  string
	Status       ReceiptState
	SubmittedAt  *time.Time
	ReconciledAt *time.Time
	Evidence     []BlobID
	Confidence   Confidence
	Error        *ErrorInfo
	RawReceipt   BlobID
}

type ReconciliationOutcome string

const (
	ReconcileConfirmed ReconciliationOutcome = "confirmed"
	ReconcileNotFound  ReconciliationOutcome = "not-found"
	ReconcileUnknown   ReconciliationOutcome = "unknown"
	ReconcileManual    ReconciliationOutcome = "manual-action-required"
)

type ReconciliationObservation struct {
	ID          ReconciliationID
	Operation   OperationContext
	Run         ProbeRunID
	Attempt     AttemptID
	Receipt     ReceiptID
	Outcome     ReconciliationOutcome
	ExternalID  ExternalID
	ExternalURL string
	Evidence    []BlobID
	ObservedAt  time.Time
	RecordedAt  time.Time
}

// VariantAssignmentObservation uses a scope-local opaque unit reference. It
// must not become a cross-platform identity or a raw personal identifier.
type VariantAssignmentObservation struct {
	ID                AssignmentID
	Operation         OperationContext
	Run               ProbeRunID
	PhaseRef          string
	VariantID         string
	AssignmentUnitRef string
	MethodVersion     string
	AssignedAt        time.Time
	Evidence          []BlobID
}

type ExposureObservation struct {
	ID         ExposureID
	Operation  OperationContext
	Run        ProbeRunID
	PhaseRef   string
	Assignment *AssignmentID
	VariantID  string
	Count      uint64
	Window     TimeWindow
	Source     ConnectorID
	ObservedAt time.Time
	Evidence   []BlobID
}

type MetricQuality struct {
	MappingVersion   string
	AttributionModel string
	DedupeRule       string
	DataWatermark    time.Time
	MissingRate      float64
	BiasFlags        []string
	Uncertainty      string
	Integrity        []ExperimentIntegrityCheck
}

type ExperimentIntegrityState string

const (
	ExperimentIntegrityPass    ExperimentIntegrityState = "pass"
	ExperimentIntegrityWarning ExperimentIntegrityState = "warning"
	ExperimentIntegrityFail    ExperimentIntegrityState = "fail"
	ExperimentIntegrityUnknown ExperimentIntegrityState = "unknown"
)

// ExperimentIntegrityCheck records a provider or independently reproduced
// check such as SRM, crossover, exposure lag, pre-exposure bias, definition
// drift, identity mismatch, sample power, or metric completeness.
type ExperimentIntegrityCheck struct {
	Kind       string
	State      ExperimentIntegrityState
	Message    string
	PhaseRef   string
	AssessedAt time.Time
	Evidence   []BlobID
}

// MetricObservation keeps a platform observation separate from the inference
// later made from it. Numerator and denominator may be nil for qualitative or
// platform-aggregated metrics that do not expose them.
type MetricObservation struct {
	ID            MetricID
	Operation     OperationContext
	Run           ProbeRunID
	PhaseRef      string
	Receipt       ReceiptID
	Definition    MetricDefinition
	VariantID     string
	CohortRef     string
	Value         float64
	Numerator     *float64
	Denominator   *float64
	SampleSize    uint64
	ExposureCount uint64
	Window        TimeWindow
	Source        ConnectorID
	Mode          AcquisitionMode
	ObservedAt    time.Time
	CollectedAt   time.Time
	Quality       MetricQuality
	Evidence      []BlobID
}

type LearningConclusion string

const (
	LearningSupported    LearningConclusion = "supported"
	LearningWeakened     LearningConclusion = "weakened"
	LearningInconclusive LearningConclusion = "inconclusive"
	LearningInvalidated  LearningConclusion = "invalidated"
)

type LearningReview struct {
	ID             LearningReviewID
	Scope          ScopeRef
	Revision       uint64
	Hypothesis     RevisionRef
	Plan           RevisionRef
	Receipts       []ReceiptID
	Metrics        []MetricID
	Conclusion     LearningConclusion
	InferenceMode  InferenceMode
	Biases         []string
	NextHypothesis *HypothesisID
	ReviewedBy     PrincipalID
	ReviewedAt     time.Time
}

type ProbeValidationRequest struct {
	Operation OperationContext
	Plan      ProbePlan
	Purpose   string
}

type ReconcileRequest struct {
	Operation OperationContext
	Binding   PortBinding
	Run       ProbeRun
	Attempt   OperationAttempt
	Receipt   ProbeReceipt
	AsOf      time.Time
}

type ClaimRequest struct {
	Owner         string
	Limit         int
	LeaseDuration time.Duration
	AsOf          time.Time
}

type ClaimedOutboxItem struct {
	Item  ProbeOutboxItem
	Lease WorkLease
}

type OutboxCompletion struct {
	Lease       WorkLease
	Attempt     AttemptID
	Receipt     ReceiptID
	TargetState OutboxState
	Error       *ErrorInfo
}

type OutboxReschedule struct {
	Lease                  WorkLease
	Attempt                AttemptID
	AvailableAt            time.Time
	ReconciliationRequired bool
	Error                  ErrorInfo
}

type ProbePlanner interface {
	Validate(context.Context, ProbeValidationRequest) ([]Finding, error)
}

type ProbeValidator interface {
	ValidateProbe(context.Context, OperationContext, PortBinding, ProbePlan) ([]Finding, error)
}

type ProbePreviewer interface {
	PreviewProbe(context.Context, OperationContext, PortBinding, ProbePlan) (ProbePreview, error)
}

type ProbePreparer interface {
	PrepareProbe(context.Context, OperationContext, PortBinding, ProbePlan, Approval) (ExecutionIntent, error)
}

type ProbeExecutor interface {
	ExecuteProbe(context.Context, OperationContext, PortBinding, ExecutionIntent) (ProbeReceipt, error)
}

type ProbeReconciler interface {
	ReconcileProbe(context.Context, ReconcileRequest) (ReconciliationObservation, error)
}

// ProbeCanceller is only valid for capabilities whose contract proves that
// cancellation has no unreviewed serving or analysis effect. Experiment
// platforms should expose exact lifecycle capabilities and intents instead;
// many providers implement "stop" by serving one treatment to everyone.
type ProbeCanceller interface {
	CancelProbe(context.Context, OperationContext, PortBinding, ProbeReceipt) (ProbeReceipt, error)
}

type ApprovalGate interface {
	Approve(context.Context, ProbePreview, PrincipalID, time.Time) (Approval, error)
	ValidateApproval(context.Context, Approval, ProbePlan, PortBinding) error
	Consume(context.Context, ApprovalID, ExecutionIntentID) error
}

// ProbeOutbox defines ownership and compare-and-swap boundaries only. Worker,
// retry, scheduling, and storage implementations remain outside this package.
type ProbeOutbox interface {
	Enqueue(context.Context, ProbeOutboxItem) error
	Claim(context.Context, ClaimRequest) ([]ClaimedOutboxItem, error)
	Renew(context.Context, WorkLease, time.Duration) (WorkLease, error)
	Complete(context.Context, OutboxCompletion) error
	Reschedule(context.Context, OutboxReschedule) error
	Suspend(context.Context, WorkLease, string) error
}

type ProbeLedger interface {
	AppendPlan(context.Context, ProbePlan) error
	AppendApproval(context.Context, Approval) error
	AppendRun(context.Context, ProbeRun) error
	AppendIntent(context.Context, ExecutionIntent) error
	AppendAttempt(context.Context, OperationAttempt) error
	AppendReceipt(context.Context, ProbeReceipt) error
	AppendReconciliation(context.Context, ReconciliationObservation) error
	AppendAssignment(context.Context, VariantAssignmentObservation) error
	AppendExposure(context.Context, ExposureObservation) error
	AppendMetric(context.Context, MetricObservation) error
	AppendLearningReview(context.Context, LearningReview) error
}

type MetricCollector interface {
	Collect(context.Context, OperationContext, PortBinding, ProbeRun, TimeWindow) ([]MetricObservation, error)
}
