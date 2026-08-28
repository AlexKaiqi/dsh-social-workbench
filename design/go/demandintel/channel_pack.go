package demandintel

import (
	"context"
	"time"
)

// A Channel Pack composes independently versioned Platform Packs for one
// research strategy. It owns cross-platform projection, roster, coverage, and
// deduplication rules; it never merges native platform identity, credentials,
// adapters, or verification claims.

type ChannelPackRef struct {
	ID      ChannelPackID
	Version string
}

type ChannelPackState string

const (
	ChannelPackDraft       ChannelPackState = "draft"
	ChannelPackResearched  ChannelPackState = "researched"
	ChannelPackModeled     ChannelPackState = "modeled"
	ChannelPackVerified    ChannelPackState = "verified"
	ChannelPackOperational ChannelPackState = "operational"
	ChannelPackDegraded    ChannelPackState = "degraded"
	ChannelPackSuspended   ChannelPackState = "suspended"
	ChannelPackRetired     ChannelPackState = "retired"
)

type ChannelPackMember struct {
	PlatformPack         PlatformPackRef
	Role                 string
	RequiredCapabilities []CapabilityRef
	ProjectionMapping    SchemaRef
	MinimumMaturity      CapabilityMaturity
	Conditions           []CapabilityCondition
	Evidence             []EvidenceLink
}

type ChannelSkillRef struct {
	ID      ChannelSkillID
	Version string
}

// ChannelSkillDefinition orchestrates only capabilities already admitted by
// member Platform Packs. It cannot make an unverified member callable or widen
// the capabilities, effects, accounts, or purposes of a member skill.
type ChannelSkillDefinition struct {
	Ref                   ChannelSkillRef
	Purpose               PlatformSkillPurpose
	MemberPacks           []PlatformPackRef
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
	SupersededBy          *ChannelSkillRef
}

// PlatformSurfaceRef identifies a native board, site, tenant, feed, or similar
// bounded source without pretending it is a cross-platform organization ID.
type PlatformSurfaceRef struct {
	Concept      PlatformConceptRef
	ExternalID   ExternalID
	CanonicalURL string
}

type ChannelRosterEntry struct {
	ID           string
	Subject      *ObjectRef
	DisplayName  string
	PlatformPack PlatformPackRef
	Surface      PlatformSurfaceRef
	Evidence     []EvidenceLink
	Enabled      bool
	ValidFrom    time.Time
	ValidUntil   *time.Time
	Extensions   []ExtensionPayload
}

type ChannelRosterRef struct {
	ID       ChannelRosterID
	Revision uint64
}

// ChannelRosterRevision is explicit research scope, not a discovered global
// directory. Provider migrations append a revision and preserve the previous
// platform surface instead of rewriting historical observations.
type ChannelRosterRevision struct {
	Ref         ChannelRosterRef
	ChannelPack ChannelPackRef
	Parent      *ChannelRosterRef
	Entries     []ChannelRosterEntry
	Evidence    []EvidenceLink
	Message     string
	AuthoredBy  PrincipalID
	CommittedAt time.Time
}

// ChannelScope is the versioned denominator for a query-driven channel. A
// roster enumerates known boards/sites; a scope fixes reusable query surfaces,
// dialects, windows, and exclusions. Neither claims to enumerate a whole
// market merely because every configured entry was read successfully.
type ChannelScopeRef struct {
	ID       ChannelScopeID
	Revision uint64
}

type ChannelQueryProfile struct {
	Dialect      string
	Schema       SchemaRef
	Template     ExtensionPayload
	WindowPolicy ExtensionPayload
}

type ChannelScopeEntry struct {
	ID           string
	Role         string
	PlatformPack PlatformPackRef
	Surface      PlatformSurfaceRef
	Query        *ChannelQueryProfile
	Included     []string
	Excluded     []string
	Evidence     []EvidenceLink
	Enabled      bool
	ValidFrom    time.Time
	ValidUntil   *time.Time
	Extensions   []ExtensionPayload
}

type ChannelScopeRevision struct {
	Ref         ChannelScopeRef
	ChannelPack ChannelPackRef
	Parent      *ChannelScopeRef
	Roster      *ChannelRosterRef
	Entries     []ChannelScopeEntry
	Evidence    []EvidenceLink
	Message     string
	AuthoredBy  PrincipalID
	CommittedAt time.Time
}

type ChannelPackManifest struct {
	Ref                 ChannelPackRef
	State               ChannelPackState
	Name                string
	Purpose             string
	Members             []ChannelPackMember
	Skills              []ChannelSkillRef
	ProjectionSchema    SchemaRef
	CoveragePolicy      ExtensionPayload
	DedupePolicy        ExtensionPayload
	RightsPolicy        ExtensionPayload
	VerificationReports []ChannelVerificationReportID
	ReleasedBy          PrincipalID
	ReleasedAt          time.Time
	Supersedes          *ChannelPackRef
}

// Channel verification composes, but never replaces, member Platform Pack
// verification. Member reports prove native capability behavior; channel checks
// prove roster, projection, cross-platform dedupe, coverage, and degradation.
type ChannelVerificationPlan struct {
	ID                 ChannelVerificationPlanID
	ChannelPack        ChannelPackRef
	Roster             ChannelRosterRef
	Scope              *ChannelScopeRef
	MemberReports      []VerificationReportID
	Scenarios          []VerificationScenario
	MaximumCost        float64
	MaximumDuration    time.Duration
	LiveEffectsAllowed bool
	ApprovedBy         PrincipalID
	ApprovedAt         *time.Time
	ExpiresAt          time.Time
}

type ChannelVerificationRun struct {
	ID          ChannelVerificationRunID
	Plan        ChannelVerificationPlanID
	Operation   OperationContext
	MemberRuns  []VerificationRunID
	Checks      []VerificationCheck
	Status      VerificationStatus
	StartedAt   time.Time
	CompletedAt *time.Time
}

type ChannelVerificationReport struct {
	ID            ChannelVerificationReportID
	ChannelPack   ChannelPackRef
	Roster        ChannelRosterRef
	Scope         *ChannelScopeRef
	MemberReports []VerificationReportID
	Runs          []ChannelVerificationRunID
	PassedLevels  []VerificationLevel
	OpenRisks     []string
	IssuedAt      time.Time
	ExpiresAt     time.Time
}

type ChannelPackFilter struct {
	State  ChannelPackState
	Member PlatformID
	Cursor *Cursor
	Limit  int
}

type ChannelPackCatalog interface {
	Publish(context.Context, ChannelPackManifest) error
	Get(context.Context, ChannelPackRef) (ChannelPackManifest, error)
	List(context.Context, ChannelPackFilter) (Page[ChannelPackManifest], error)
}

type ChannelSkillCatalog interface {
	Register(context.Context, ChannelSkillDefinition) error
	Get(context.Context, ChannelSkillRef) (ChannelSkillDefinition, error)
}

type ChannelRosterCatalog interface {
	Put(context.Context, ChannelRosterRevision) error
	Get(context.Context, ChannelRosterRef) (ChannelRosterRevision, error)
}

type ChannelScopeCatalog interface {
	Put(context.Context, ChannelScopeRevision) error
	Get(context.Context, ChannelScopeRef) (ChannelScopeRevision, error)
}

type ChannelVerifier interface {
	Verify(context.Context, ChannelVerificationPlan) (ChannelVerificationRun, error)
}
