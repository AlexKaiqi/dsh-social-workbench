package demandintel

import (
	"context"
	"time"
)

// This file defines the design-only lifecycle for continuously discovering,
// researching, modeling, verifying, and maintaining new platform integrations.
// A platform name in a registry or README is only a candidate, never support.

type DiscoverySourceKind string

const (
	DiscoveryOfficialPortal   DiscoverySourceKind = "official-developer-portal"
	DiscoveryOfficialCatalog  DiscoverySourceKind = "official-app-catalog"
	DiscoveryOpenSourceSearch DiscoverySourceKind = "open-source-search"
	DiscoveryConnectorCatalog DiscoverySourceKind = "connector-catalog"
	DiscoveryMCPRegistry      DiscoverySourceKind = "mcp-registry"
	DiscoverySkillRegistry    DiscoverySourceKind = "skill-registry"
	DiscoveryPackageRegistry  DiscoverySourceKind = "package-registry"
	DiscoveryUserNomination   DiscoverySourceKind = "user-nomination"
	DiscoveryObservedDemand   DiscoverySourceKind = "observed-demand"
)

type DiscoverySource struct {
	Name       string
	Kind       DiscoverySourceKind
	URL        string
	Mode       AccessMode
	Schema     SchemaRef
	Evidence   []EvidenceLink
	CheckedAt  time.Time
	Extensions []ExtensionPayload
}

type DiscoveryCampaignState string

const (
	DiscoveryCampaignDraft     DiscoveryCampaignState = "draft"
	DiscoveryCampaignRunning   DiscoveryCampaignState = "running"
	DiscoveryCampaignCompleted DiscoveryCampaignState = "completed"
	DiscoveryCampaignCancelled DiscoveryCampaignState = "cancelled"
)

// DiscoveryCampaign is a bounded search for platforms, skills, connectors, or
// open-source artifacts. It prevents an autonomous scout from crawling an
// unbounded ecosystem or silently installing what it finds.
type DiscoveryCampaign struct {
	ID                DiscoveryCampaignID
	Scope             ScopeRef
	Question          string
	BusinessVertical  []string
	SignalTypes       []string
	Sources           []DiscoverySource
	Window            TimeWindow
	MaximumCandidates int
	CostBudget        float64
	State             DiscoveryCampaignState
	CreatedBy         PrincipalID
	CreatedAt         time.Time
}

type PlatformCandidateState string

const (
	CandidateDiscovered  PlatformCandidateState = "discovered"
	CandidateTriaged     PlatformCandidateState = "triaged"
	CandidateResearching PlatformCandidateState = "researching"
	CandidateModeled     PlatformCandidateState = "modeled"
	CandidateDeferred    PlatformCandidateState = "deferred"
	CandidateRejected    PlatformCandidateState = "rejected"
)

type PlatformValueDimension string

const (
	ValuePainSpecificity    PlatformValueDimension = "pain-specificity"
	ValueActionProximity    PlatformValueDimension = "action-proximity"
	ValueAudienceClarity    PlatformValueDimension = "audience-clarity"
	ValueLongitudinalSignal PlatformValueDimension = "longitudinal-signal"
	ValueProbeFitness       PlatformValueDimension = "probe-fitness"
	ValueOfficialAccess     PlatformValueDimension = "official-access"
	ValueEcosystemLeverage  PlatformValueDimension = "ecosystem-leverage"
	ValueMaintenanceBurden  PlatformValueDimension = "maintenance-burden"
	ValueLegalAccountRisk   PlatformValueDimension = "legal-account-risk"
)

// AssessedValue preserves the evidence and rubric behind a score. A scalar
// ranking may be derived from these records but is never the source of truth.
type AssessedValue struct {
	Dimension  PlatformValueDimension
	Rating     string
	Rationale  string
	Evidence   []EvidenceLink
	AssessedAt time.Time
}

type PlatformCandidate struct {
	ID                PlatformCandidateID
	Campaign          DiscoveryCampaignID
	ProposedID        PlatformID
	DisplayName       string
	CanonicalURL      string
	Categories        []string
	ValueHypothesis   string
	Assessment        []AssessedValue
	DiscoveryEvidence []EvidenceLink
	State             PlatformCandidateState
	DiscoveredAt      time.Time
	UpdatedAt         time.Time
}

type ResearchArtifactKind string

const (
	ArtifactOfficialDocs  ResearchArtifactKind = "official-docs"
	ArtifactTerms         ResearchArtifactKind = "terms"
	ArtifactOpenAPI       ResearchArtifactKind = "openapi"
	ArtifactOfficialSDK   ResearchArtifactKind = "official-sdk"
	ArtifactChangelog     ResearchArtifactKind = "changelog"
	ArtifactStatusPage    ResearchArtifactKind = "status-page"
	ArtifactRepository    ResearchArtifactKind = "repository"
	ArtifactConnector     ResearchArtifactKind = "connector"
	ArtifactMCPServer     ResearchArtifactKind = "mcp-server"
	ArtifactExternalSkill ResearchArtifactKind = "external-skill"
	ArtifactWorkflowPiece ResearchArtifactKind = "workflow-piece"
	ArtifactCrawlerActor  ResearchArtifactKind = "crawler-actor"
	ArtifactFeedRoute     ResearchArtifactKind = "feed-route"
)

type ArtifactOwnership string

const (
	ArtifactOfficial   ArtifactOwnership = "official"
	ArtifactCommunity  ArtifactOwnership = "community"
	ArtifactCommercial ArtifactOwnership = "commercial"
	ArtifactUnknown    ArtifactOwnership = "unknown"
)

type ResearchArtifactRef struct {
	ID      ResearchArtifactID
	Version string
}

type ArtifactLicense struct {
	SPDX        string
	SourceURL   string
	ReviewState string
	Note        string
}

// ResearchArtifact pins an exact external artifact. Catalog presence, stars,
// or a README claim do not prove a platform capability or safe reuse.
type ResearchArtifact struct {
	Ref                 ResearchArtifactRef
	Platform            PlatformID
	Kind                ResearchArtifactKind
	Ownership           ArtifactOwnership
	Publisher           string
	SourceURL           string
	UpstreamVersion     string
	Commit              string
	Digest              ContentHash
	License             ArtifactLicense
	SourceAvailable     bool
	ClaimedCapabilities []CapabilityRef
	ClaimedMethods      []AccessMethodRef
	MaintenanceEvidence []EvidenceLink
	SecurityEvidence    []EvidenceLink
	TechnicalEvidence   []EvidenceLink
	RiskFindings        []string
	ObservedAt          time.Time
	ExpiresAt           *time.Time
}

type ResearchDossier struct {
	Candidate           PlatformCandidateID
	Platform            PlatformID
	Artifacts           []ResearchArtifactRef
	KnowledgeProposal   KnowledgeProposalID
	OpenQuestions       []string
	RejectedClaims      []string
	RecommendedNextStep string
	PreparedBy          PrincipalID
	PreparedAt          time.Time
}

type PlatformSkillPurpose string

const (
	SkillScout    PlatformSkillPurpose = "scout"
	SkillResearch PlatformSkillPurpose = "research"
	SkillCurate   PlatformSkillPurpose = "curate"
	SkillAcquire  PlatformSkillPurpose = "acquire"
	SkillProbe    PlatformSkillPurpose = "probe"
	SkillVerify   PlatformSkillPurpose = "verify"
	SkillDiagnose PlatformSkillPurpose = "diagnose"
)

type PlatformSkillRef struct {
	ID      PlatformSkillID
	Version string
}

// PlatformSkillDefinition is agent-facing procedural knowledge. It tells an
// agent how to research, request, or verify capabilities through governed ports;
// it is not a capability, credential, adapter implementation, or proof of support.
type PlatformSkillDefinition struct {
	Ref                   PlatformSkillRef
	Platform              PlatformID
	Purpose               PlatformSkillPurpose
	KnowledgeSnapshot     *KnowledgeSnapshotID
	Instructions          ExtensionPayload
	InputSchema           SchemaRef
	OutputSchema          SchemaRef
	AllowedCapabilities   []CapabilityRef
	RequiredPorts         []PortKind
	AllowedEffects        []EffectClass
	ProhibitedActions     []string
	Evidence              []EvidenceLink
	VerificationScenarios []VerificationScenarioID
	Deprecated            bool
	SupersededBy          *PlatformSkillRef
}

type AdapterRef struct {
	ID      AdapterID
	Version string
}

type VerificationLevel string

const (
	VerificationEvidenceReview VerificationLevel = "evidence-review"
	VerificationStaticContract VerificationLevel = "static-contract"
	VerificationFixture        VerificationLevel = "fixture-conformance"
	VerificationSandbox        VerificationLevel = "sandbox-live"
	VerificationOperational    VerificationLevel = "operational-canary"
)

type VerificationStatus string

const (
	VerificationPending      VerificationStatus = "pending"
	VerificationPassed       VerificationStatus = "passed"
	VerificationFailed       VerificationStatus = "failed"
	VerificationBlocked      VerificationStatus = "blocked"
	VerificationInconclusive VerificationStatus = "inconclusive"
	VerificationSkipped      VerificationStatus = "skipped"
)

type VerificationTargetKind string

const (
	VerifyKnowledge    VerificationTargetKind = "knowledge"
	VerifySkill        VerificationTargetKind = "skill"
	VerifyArtifact     VerificationTargetKind = "artifact"
	VerifyAdapterRoute VerificationTargetKind = "adapter-route"
	VerifyPlatformPack VerificationTargetKind = "platform-pack"
	VerifyChannelPack  VerificationTargetKind = "channel-pack"
)

type VerificationScenario struct {
	ID                   VerificationScenarioID
	Version              string
	Name                 string
	Level                VerificationLevel
	TargetKind           VerificationTargetKind
	Target               ObjectRef
	Capability           *CapabilityRef
	AccessMethod         *AccessMethodRef
	Effect               EffectClass
	InputFixture         *ExtensionPayload
	ExpectedOutputSchema SchemaRef
	ExpectedErrors       []ErrorClass
	RequiredConditions   []string
	Negative             bool
	RequiresLiveAccount  bool
	RequiresConfirmation bool
}

type VerificationPlan struct {
	ID                 VerificationPlanID
	Platform           PlatformID
	KnowledgeSnapshot  KnowledgeSnapshotID
	Scenarios          []VerificationScenario
	MaximumCost        float64
	MaximumDuration    time.Duration
	LiveEffectsAllowed bool
	ApprovedBy         PrincipalID
	ApprovedAt         *time.Time
	ExpiresAt          time.Time
}

// VerificationEnvironment fingerprints interpretation and runtime inputs while
// keeping accounts and secrets behind references.
type VerificationEnvironment struct {
	KnowledgeSnapshot  KnowledgeSnapshotID
	Adapter            *AdapterRef
	Skill              *PlatformSkillRef
	PlatformAPIVersion string
	AccountType        string
	Region             string
	ConfigHash         ContentHash
	RuntimeVersion     string
}

type VerificationCheck struct {
	Scenario  VerificationScenarioID
	Status    VerificationStatus
	Summary   string
	Error     *ErrorInfo
	Evidence  []EvidenceLink
	Artifacts []BlobID
	StartedAt time.Time
	EndedAt   time.Time
}

type VerificationRun struct {
	ID          VerificationRunID
	Plan        VerificationPlanID
	Operation   OperationContext
	Environment VerificationEnvironment
	Checks      []VerificationCheck
	Status      VerificationStatus
	StartedAt   time.Time
	CompletedAt *time.Time
}

type VerificationReport struct {
	ID                VerificationReportID
	Platform          PlatformID
	KnowledgeSnapshot KnowledgeSnapshotID
	Runs              []VerificationRunID
	PassedLevels      []VerificationLevel
	CapabilityResults []PlatformSupportDeclaration
	OpenRisks         []string
	IssuedAt          time.Time
	ExpiresAt         time.Time
}

type PlatformSupportDeclaration struct {
	Capability      CapabilityRef
	AccessMethod    AccessMethodRef
	Adapter         *AdapterRef
	Maturity        CapabilityMaturity
	HighestVerified VerificationLevel
	Report          VerificationReportID
	LastVerifiedAt  time.Time
	ExpiresAt       time.Time
	Conditions      []CapabilityCondition
}

type CapabilityAdoptionDisposition string

const (
	AdoptionEligible    CapabilityAdoptionDisposition = "eligible"
	AdoptionManualOnly  CapabilityAdoptionDisposition = "manual-only"
	AdoptionPartnerOnly CapabilityAdoptionDisposition = "partner-only"
	AdoptionDeferred    CapabilityAdoptionDisposition = "deferred"
	AdoptionRejected    CapabilityAdoptionDisposition = "rejected"
)

// CapabilityAdoptionDecision preserves negative knowledge. Omitting a route
// only means that support is absent; it cannot distinguish an unresearched
// method from one deliberately limited or rejected after evidence review.
// AccessMethod is nil when the decision applies to the capability as a whole.
// A decision is pack policy, not a universal legal conclusion, and expires.
type CapabilityAdoptionDecision struct {
	Capability     CapabilityRef
	AccessMethod   *AccessMethodRef
	Disposition    CapabilityAdoptionDisposition
	Purposes       []string
	Reason         string
	Evidence       []EvidenceLink
	ReconsiderWhen []string
	ReviewedAt     time.Time
	ExpiresAt      time.Time
}

type PlatformPackState string

const (
	PlatformPackDraft       PlatformPackState = "draft"
	PlatformPackResearched  PlatformPackState = "researched"
	PlatformPackModeled     PlatformPackState = "modeled"
	PlatformPackVerified    PlatformPackState = "verified"
	PlatformPackOperational PlatformPackState = "operational"
	PlatformPackDegraded    PlatformPackState = "degraded"
	PlatformPackSuspended   PlatformPackState = "suspended"
	PlatformPackRetired     PlatformPackState = "retired"
)

type PlatformPackRef struct {
	ID      PlatformPackID
	Version string
}

// PlatformPackManifest is the release unit for a platform. Support remains
// capability-scoped; pack state is only a portfolio summary.
type PlatformPackManifest struct {
	Ref                 PlatformPackRef
	Platform            PlatformID
	State               PlatformPackState
	KnowledgeSnapshot   KnowledgeSnapshotID
	Skills              []PlatformSkillRef
	ResearchArtifacts   []ResearchArtifactRef
	Adapters            []AdapterRef
	AdoptionDecisions   []CapabilityAdoptionDecision
	Support             []PlatformSupportDeclaration
	VerificationReports []VerificationReportID
	ReleasedBy          PrincipalID
	ReleasedAt          time.Time
	Supersedes          *PlatformPackRef
}

type DriftKind string

const (
	DriftOfficialDocs  DriftKind = "official-docs"
	DriftContract      DriftKind = "api-contract"
	DriftAuthorization DriftKind = "authorization"
	DriftSchema        DriftKind = "schema"
	DriftTerms         DriftKind = "terms"
	DriftLicense       DriftKind = "license"
	DriftMaintenance   DriftKind = "maintenance"
	DriftSecurity      DriftKind = "security"
	DriftRuntime       DriftKind = "runtime"
)

type DriftSignal struct {
	Kind       DriftKind
	Target     ObjectRef
	Before     ContentHash
	After      ContentHash
	Evidence   []EvidenceLink
	ObservedAt time.Time
}

type DriftDisposition string

const (
	DriftNoChange DriftDisposition = "no-change"
	DriftReverify DriftDisposition = "reverify"
	DriftDegrade  DriftDisposition = "degrade"
	DriftSuspend  DriftDisposition = "suspend"
	DriftRetire   DriftDisposition = "retire"
)

type DriftAssessment struct {
	ID                   DriftAssessmentID
	PlatformPack         PlatformPackRef
	Signals              []DriftSignal
	Disposition          DriftDisposition
	AffectedCapabilities []CapabilityRef
	RequiredScenarios    []VerificationScenarioID
	Reason               string
	AssessedAt           time.Time
}

type PlatformCandidateFilter struct {
	State    PlatformCandidateState
	Category string
	Cursor   *Cursor
	Limit    int
}

type PlatformPackFilter struct {
	Platform PlatformID
	State    PlatformPackState
	Cursor   *Cursor
	Limit    int
}

type PlatformScout interface {
	Discover(context.Context, DiscoveryCampaign) (Page[PlatformCandidate], error)
}

type PlatformResearcher interface {
	Research(context.Context, OperationContext, PlatformCandidate) (ResearchDossier, error)
}

type ResearchArtifactAuditor interface {
	Audit(context.Context, OperationContext, ResearchArtifactRef) (ResearchArtifact, error)
}

type PlatformSkillCatalog interface {
	Register(context.Context, PlatformSkillDefinition) error
	Get(context.Context, PlatformSkillRef) (PlatformSkillDefinition, error)
}

type PlatformVerifier interface {
	Verify(context.Context, VerificationPlan) (VerificationRun, error)
}

type PlatformPackCatalog interface {
	Publish(context.Context, PlatformPackManifest) error
	Get(context.Context, PlatformPackRef) (PlatformPackManifest, error)
	List(context.Context, PlatformPackFilter) (Page[PlatformPackManifest], error)
}

type PlatformDiscoveryCatalog interface {
	PutCandidate(context.Context, PlatformCandidate) error
	GetCandidate(context.Context, PlatformCandidateID) (PlatformCandidate, error)
	ListCandidates(context.Context, PlatformCandidateFilter) (Page[PlatformCandidate], error)
	PutArtifact(context.Context, ResearchArtifact) error
	GetArtifact(context.Context, ResearchArtifactRef) (ResearchArtifact, error)
	PutDossier(context.Context, ResearchDossier) error
}

type PlatformDriftAssessor interface {
	Assess(context.Context, OperationContext, PlatformPackManifest, []DriftSignal) (DriftAssessment, error)
}
