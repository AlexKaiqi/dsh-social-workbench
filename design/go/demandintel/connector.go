package demandintel

import (
	"context"
	"time"
)

// Capability is a platform-neutral semantic operation ID. New capabilities are
// catalog entries, not new fields on ConnectorInstance.
type Capability string

const (
	CapabilityInspectSession      Capability = "session.inspect"
	CapabilitySearchVideos        Capability = "discovery.search.videos"
	CapabilityReadVideo           Capability = "content.read.video"
	CapabilityReadComments        Capability = "engagement.read.comments"
	CapabilityReadContentMetrics  Capability = "analytics.read.content-metrics"
	CapabilityDownloadVideo       Capability = "media.download.video"
	CapabilityTranscribeVideo     Capability = "media.transcribe.video"
	CapabilityPublishPrivateVideo Capability = "account.publish.video.private"
)

type CapabilityRef struct {
	ID      Capability
	Version string
}

type CapabilityDomain string

const (
	DomainSession    CapabilityDomain = "session"
	DomainDiscovery  CapabilityDomain = "discovery"
	DomainContent    CapabilityDomain = "content"
	DomainEngagement CapabilityDomain = "engagement"
	DomainFeedback   CapabilityDomain = "feedback"
	DomainAnalytics  CapabilityDomain = "analytics"
	DomainMedia      CapabilityDomain = "media"
	DomainLive       CapabilityDomain = "live"
	DomainAccount    CapabilityDomain = "account"
)

type CapabilitySurface string

const (
	SurfacePlatform CapabilitySurface = "platform"
	SurfaceLocal    CapabilitySurface = "local"
	SurfaceManual   CapabilitySurface = "manual"
)

type CapabilityAction string

const (
	ActionDiscover  CapabilityAction = "discover"
	ActionSearch    CapabilityAction = "search"
	ActionRead      CapabilityAction = "read"
	ActionReceive   CapabilityAction = "receive"
	ActionCreate    CapabilityAction = "create"
	ActionUpdate    CapabilityAction = "update"
	ActionDelete    CapabilityAction = "delete"
	ActionExecute   CapabilityAction = "execute"
	ActionReconcile CapabilityAction = "reconcile"
	ActionCancel    CapabilityAction = "cancel"
)

type AccessClass string

const (
	AccessPublic     AccessClass = "public"
	AccessOwned      AccessClass = "owned"
	AccessAuthorized AccessClass = "authorized"
	AccessPartner    AccessClass = "partner"
)

type EffectClass string

const (
	EffectNone          EffectClass = "none"
	EffectLocalWrite    EffectClass = "local-write"
	EffectPlatformWrite EffectClass = "platform-write"
)

type Reversibility string

const (
	ReversibilityNotApplicable Reversibility = "not-applicable"
	ReversibilityReversible    Reversibility = "reversible"
	ReversibilityIrreversible  Reversibility = "irreversible"
	ReversibilityUnknown       Reversibility = "unknown"
)

type DeliverySemantics string

const (
	DeliveryPull   DeliverySemantics = "pull"
	DeliveryPush   DeliverySemantics = "push"
	DeliveryManual DeliverySemantics = "manual"
)

type IdempotencySemantics string

const (
	IdempotencyUnsupported IdempotencySemantics = "unsupported"
	IdempotencyBestEffort  IdempotencySemantics = "best-effort"
	IdempotencySystemKey   IdempotencySemantics = "system-key"
	IdempotencyProviderKey IdempotencySemantics = "provider-key"
)

type ReconciliationSemantics string

const (
	ReconciliationUnsupported ReconciliationSemantics = "unsupported"
	ReconciliationReadBack    ReconciliationSemantics = "read-after-write"
	ReconciliationProviderJob ReconciliationSemantics = "provider-job"
	ReconciliationManual      ReconciliationSemantics = "manual-evidence"
)

type ConfirmationRequirement string

const (
	ConfirmationNone    ConfirmationRequirement = "none"
	ConfirmationPolicy  ConfirmationRequirement = "policy-dependent"
	ConfirmationOneTime ConfirmationRequirement = "one-time-human"
)

type CapabilitySemantics struct {
	Access         []AccessClass
	Effect         EffectClass
	Reversibility  Reversibility
	Delivery       DeliverySemantics
	Idempotency    IdempotencySemantics
	Reconciliation ReconciliationSemantics
	Confirmation   ConfirmationRequirement
	InputSchema    SchemaRef
	OutputSchema   SchemaRef
}

type CapabilityDefinition struct {
	Ref          CapabilityRef
	Domain       CapabilityDomain
	Surface      CapabilitySurface
	Action       CapabilityAction
	Resource     string
	Summary      string
	Semantics    CapabilitySemantics
	Deprecated   bool
	SupersededBy *CapabilityRef
}

type EvidenceKind string

const (
	EvidenceOfficialDoc EvidenceKind = "official-doc"
	EvidenceOfficialSDK EvidenceKind = "official-sdk"
	EvidenceTerms       EvidenceKind = "terms"
	EvidenceSource      EvidenceKind = "source"
	EvidenceConformance EvidenceKind = "conformance"
	EvidenceLiveProbe   EvidenceKind = "live-probe"
)

type EvidenceLink struct {
	Kind       EvidenceKind
	URL        string
	Artifact   BlobID
	Title      string
	CheckedAt  time.Time
	ExpiresAt  *time.Time
	Confidence Confidence
}

// PortKind names a small optional adapter port. A route binds a semantic
// capability to one or more ports; adapters never implement a universal API.
type PortKind string

const (
	PortDiscover        PortKind = "discover"
	PortPullRead        PortKind = "pull-read"
	PortPushReceive     PortKind = "push-receive"
	PortChangeReconcile PortKind = "change-reconcile"
	PortManualImport    PortKind = "manual-import"
	PortProbeValidate   PortKind = "probe-validate"
	PortProbePreview    PortKind = "probe-preview"
	PortProbePrepare    PortKind = "probe-prepare"
	PortProbeExecute    PortKind = "probe-execute"
	PortProbeReconcile  PortKind = "probe-reconcile"
	PortProbeCancel     PortKind = "probe-cancel"
	PortMetricCollect   PortKind = "metric-collect"
)

type AdapterKind string

const (
	AdapterIngress AdapterKind = "ingress"
	AdapterAction  AdapterKind = "action"
	AdapterMetrics AdapterKind = "metrics"
	AdapterHybrid  AdapterKind = "hybrid"
	AdapterManual  AdapterKind = "manual"
)

type AdapterRuntime struct {
	Mode       string
	Language   string
	Entrypoint string
}

type AdapterLicense struct {
	SPDX        string
	SourceURL   string
	ReviewState string
	Note        string
}

type CapabilityMaturity string

const (
	MaturityExperimental CapabilityMaturity = "experimental"
	MaturityCommunity    CapabilityMaturity = "community"
	MaturityVerified     CapabilityMaturity = "verified"
	MaturityProduction   CapabilityMaturity = "production"
	MaturitySuspended    CapabilityMaturity = "suspended"
)

// AdapterCapabilityRoute is package-level theory: this adapter version claims
// it can map one platform operation to the stable capability contract.
type AdapterCapabilityRoute struct {
	Name             string
	ValidatedAgainst KnowledgeSnapshotID
	AccessMethod     AccessMethodRef
	Capability       CapabilityRef
	Mode             AccessMode
	Ports            []PortKind
	AccountTypes     []string
	RequiredScopes   []string
	InputMapping     SchemaRef
	OutputMapping    SchemaRef
	Semantics        CapabilitySemantics
	Execution        ExecutionClass
	Coupled          []CapabilityRef
	Quality          CapabilityQuality
	DefaultLimits    CapabilityLimits
	Maturity         CapabilityMaturity
	Evidence         []EvidenceLink
	ConformanceSuite string
	Extensions       []ExtensionPayload
}

type AdapterDefinition struct {
	ID              AdapterID
	Version         string
	ContractVersion string
	Platforms       []PlatformID
	Kind            AdapterKind
	Runtime         AdapterRuntime
	License         AdapterLicense
	ConfigSchema    SchemaRef
	SecretFields    []string
	Routes          []AdapterCapabilityRoute
}

type ExecutionClass string

const (
	ExecutionDirect         ExecutionClass = "direct"
	ExecutionCoupled        ExecutionClass = "coupled"
	ExecutionOutboxOnly     ExecutionClass = "outbox-only"
	ExecutionManualHandoff  ExecutionClass = "manual-handoff"
	ExecutionNotImplemented ExecutionClass = "not-implemented"
)

type RoutingStrategy string

const (
	StrategyBalanced           RoutingStrategy = "balanced"
	StrategyLowestCost         RoutingStrategy = "lowest-cost"
	StrategyLowestLatency      RoutingStrategy = "lowest-latency"
	StrategyWidestCoverage     RoutingStrategy = "widest-coverage"
	StrategyHighestReliability RoutingStrategy = "highest-reliability"
)

type CapabilityQuality struct {
	Cost        string
	Latency     string
	Coverage    string
	Reliability string
}

type ConnectorLifecycle string

const (
	ConnectorRegistered ConnectorLifecycle = "registered"
	ConnectorConfigured ConnectorLifecycle = "configured"
	ConnectorDisabled   ConnectorLifecycle = "disabled"
	ConnectorRetired    ConnectorLifecycle = "retired"
)

type AuthorizationState string

const (
	AuthorizationNotRequired AuthorizationState = "not-required"
	AuthorizationMissing     AuthorizationState = "missing"
	AuthorizationPending     AuthorizationState = "pending"
	AuthorizationValid       AuthorizationState = "valid"
	AuthorizationExpired     AuthorizationState = "expired"
	AuthorizationRevoked     AuthorizationState = "revoked"
)

type CredentialBinding struct {
	Name       string
	Credential CredentialRef
	Scopes     []string
	ExpiresAt  *time.Time
}

// ConnectionProfile is an explicit user-owned grouping. It may combine API,
// browser, sidecar, and manual connectors for one platform/account binding.
// The system never infers this grouping from identities on different platforms.
type ConnectionProfile struct {
	ID                ConnectionID
	Scope             ScopeRef
	Platform          PlatformID
	Account           AccountBindingRef
	ConnectorIDs      []ConnectorID
	PreferredModes    []AccessMode
	DefaultStrategy   RoutingStrategy
	AllowedStrategies []RoutingStrategy
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// ConnectorInstance is one configured adapter instance. Dynamic capability,
// policy, health, and rate-limit results live in CapabilityResolution instead.
type ConnectorInstance struct {
	ID             ConnectorID
	Scope          ScopeRef
	Platform       PlatformID
	Adapter        AdapterID
	AdapterVersion string
	Config         ConfigRef
	Account        AccountBindingRef
	Credentials    []CredentialBinding
	Lifecycle      ConnectorLifecycle
	Authorization  AuthorizationState
	GrantedScopes  []string
	EnabledRoutes  []string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type RateLimit struct {
	Requests int64
	Window   time.Duration
	Burst    int64
}

type CapabilityLimits struct {
	MaxItemsPerPage int
	MaxItemsPerRun  int
	MaxPayloadBytes int64
	MaxConcurrency  int
	RateLimits      []RateLimit
	CostBudgetUnit  string
	CostBudgetMax   float64
	Extensions      []ExtensionPayload
}

// CapabilityRoute is the instantiated route obtained by binding an adapter
// declaration to a connector configuration and account authorization.
type CapabilityRoute struct {
	ID                CapabilityRouteID
	KnowledgeSnapshot KnowledgeSnapshotID
	AccessMethod      AccessMethodRef
	Connector         ConnectorID
	Platform          PlatformID
	Adapter           AdapterID
	AdapterVersion    string
	DeclarationName   string
	Capability        CapabilityRef
	Mode              AccessMode
	Ports             []PortKind
	InputMapping      SchemaRef
	OutputMapping     SchemaRef
	Semantics         CapabilitySemantics
	Execution         ExecutionClass
	Coupled           []CapabilityRef
	Quality           CapabilityQuality
	Limits            CapabilityLimits
	Maturity          CapabilityMaturity
	Priority          int
	Enabled           bool
}

type CapabilityAvailability string

const (
	AvailabilityAvailable   CapabilityAvailability = "available"
	AvailabilityDegraded    CapabilityAvailability = "degraded"
	AvailabilityPlanned     CapabilityAvailability = "planned"
	AvailabilityUnavailable CapabilityAvailability = "unavailable"
	AvailabilityManual      CapabilityAvailability = "manual-action-required"
	AvailabilityBlocked     CapabilityAvailability = "blocked"
	AvailabilityUnknown     CapabilityAvailability = "unknown"
)

type CapabilityCondition struct {
	Type        string
	Status      ConditionStatus
	Reason      string
	Summary     string
	Evidence    []EvidenceLink
	Remediation string
}

type CapabilityRequirement struct {
	KnowledgeSnapshot KnowledgeSnapshotID
	Capability        CapabilityRef
	Platform          PlatformID
	Connection        ConnectionID
	AcceptedAccess    []AccessClass
	AcceptedModes     []AccessMode
	RequiredPorts     []PortKind
	AllowedEffects    []EffectClass
	MinimumMaturity   CapabilityMaturity
	RequireReconcile  bool
	AllowManual       bool
	AllowCoupled      bool
	Strategy          RoutingStrategy
	Budget            CapabilityLimits
}

type CapabilityResolutionRequest struct {
	Operation           OperationContext
	Purpose             string
	Requirement         CapabilityRequirement
	PreferredConnectors []ConnectorID
	AsOf                time.Time
}

// EffectiveCapability is an expiring evaluation, not connector configuration.
// It keeps authorization, policy, health, evidence, and limits separate instead
// of collapsing them into one callable boolean.
type EffectiveCapability struct {
	Route           CapabilityRoute
	Rank            int
	Availability    CapabilityAvailability
	Authorization   AuthorizationState
	Health          HealthState
	PolicyDecisions []PolicyDecisionID
	Execution       ExecutionClass
	Quality         CapabilityQuality
	EffectiveLimits CapabilityLimits
	Conditions      []CapabilityCondition
	RankingReasons  []string
	Evidence        []EvidenceLink
	ResolvedAt      time.Time
	ExpiresAt       time.Time
}

type CapabilityResolution struct {
	ID                CapabilityResolutionID
	KnowledgeSnapshot KnowledgeSnapshotID
	Operation         OperationContext
	Purpose           string
	Requirement       CapabilityRequirement
	Availability      CapabilityAvailability
	Candidates        []EffectiveCapability
	SelectedRoute     *CapabilityRouteID
	Conditions        []CapabilityCondition
	ResolvedAt        time.Time
	ExpiresAt         time.Time
}

// PortBinding freezes the selected resolution for one typed port invocation.
// The dispatcher rejects an expired binding instead of silently resolving a
// different route after approval or during an external-effect attempt.
type PortBinding struct {
	Resolution        CapabilityResolutionID
	KnowledgeSnapshot KnowledgeSnapshotID
	AccessMethod      AccessMethodRef
	Route             CapabilityRouteID
	Connector         ConnectorID
	Adapter           AdapterID
	AdapterVersion    string
	Capability        CapabilityRef
	Port              PortKind
	Mode              AccessMode
	BoundAt           time.Time
	ExpiresAt         time.Time
}

type PortBindingRequest struct {
	Operation  OperationContext
	Resolution CapabilityResolutionID
	Port       PortKind
	AsOf       time.Time
}

type AdapterFilter struct {
	Platform   PlatformID
	Capability Capability
	Maturity   CapabilityMaturity
	Cursor     *Cursor
	Limit      int
}

type ConnectorFilter struct {
	Scope         ScopeRef
	Platform      PlatformID
	Adapter       AdapterID
	Connection    ConnectionID
	Lifecycle     ConnectorLifecycle
	Authorization AuthorizationState
	Capability    Capability
	Cursor        *Cursor
	Limit         int
}

type AdapterCatalog interface {
	RegisterAdapter(context.Context, AdapterDefinition) error
	GetAdapter(context.Context, AdapterID, string) (AdapterDefinition, error)
	ListAdapters(context.Context, AdapterFilter) (Page[AdapterDefinition], error)
}

type ConnectorRegistry interface {
	PutConnection(context.Context, ConnectionProfile) error
	GetConnection(context.Context, ConnectionID) (ConnectionProfile, error)
	PutInstance(context.Context, ConnectorInstance) error
	GetInstance(context.Context, ConnectorID) (ConnectorInstance, error)
	ListInstances(context.Context, ConnectorFilter) (Page[ConnectorInstance], error)
	ListRoutes(context.Context, ConnectorID) ([]CapabilityRoute, error)
}

type CapabilityResolver interface {
	Resolve(context.Context, CapabilityResolutionRequest) (CapabilityResolution, error)
	BindPort(context.Context, PortBindingRequest) (PortBinding, error)
}
