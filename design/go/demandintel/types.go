package demandintel

import "time"

type (
	PlatformID                  string
	AdapterID                   string
	ConnectorID                 string
	ConnectionID                string
	CapabilityRouteID           string
	CapabilityResolutionID      string
	PlatformConceptID           string
	KnowledgeSnapshotID         string
	KnowledgeProposalID         string
	AccessMethodID              string
	PlatformCandidateID         string
	DiscoveryCampaignID         string
	ResearchArtifactID          string
	PlatformSkillID             string
	PlatformPackID              string
	ChannelPackID               string
	ChannelSkillID              string
	ChannelRosterID             string
	ChannelScopeID              string
	ChannelVerificationPlanID   string
	ChannelVerificationRunID    string
	ChannelVerificationReportID string
	VerificationPlanID          string
	VerificationScenarioID      string
	VerificationRunID           string
	VerificationReportID        string
	DriftAssessmentID           string
	ScopeID                     string
	CollectionPlanID            string
	CollectionRunID             string
	ObservationID               string
	BlobID                      string
	SourceItemID                string
	EvidenceSpanID              string
	SignalID                    string
	OpportunityID               string
	HypothesisID                string
	ProbePlanID                 string
	ProbeRunID                  string
	OutboxItemID                string
	AttemptID                   string
	ReconciliationID            string
	ApprovalID                  string
	ExecutionIntentID           string
	ReceiptID                   string
	AssignmentID                string
	ExposureID                  string
	MetricID                    string
	LearningReviewID            string
	PolicyDecisionID            string
	AuditEventID                string
	DomainEventID               string
	CorrelationID               string
	CausationID                 string
	TraceID                     string
	SpanID                      string
	HealthSnapshotID            string
	MeasurementID               string
	ProjectionID                string
	MaterializationID           string
	PrincipalID                 string
	CredentialRef               string
	CredentialLeaseRef          string
	ConfigRef                   string
	AccountBindingRef           string
	ExternalID                  string
	SchemaRef                   string
)

// ScopeRef is the isolation boundary for every durable object. A local-first
// deployment still uses one explicit scope rather than relying on an implicit
// global namespace.
type ScopeRef struct {
	ID   ScopeID
	Kind string
}

// ObjectRef keeps a reference type-safe at the contract boundary without
// requiring the core to know every future aggregate kind.
type ObjectRef struct {
	Kind string
	ID   string
}

// RevisionRef identifies one immutable revision rather than a moving latest view.
type RevisionRef struct {
	Object   ObjectRef
	Revision uint64
}

// ExtensionPayload is the only open-ended domain extension mechanism. The
// payload is schema-bound and content-addressed; unversioned arbitrary maps are
// not a substitute for a contract.
type ExtensionPayload struct {
	Namespace string
	Schema    SchemaRef
	Blob      BlobID
	Hash      ContentHash
}

// OperationContext links audit, lineage, telemetry, cost, and external-effect
// records without coupling the domain to a telemetry backend.
type OperationContext struct {
	Scope             ScopeRef
	Correlation       CorrelationID
	Causation         CausationID
	Trace             TraceID
	ParentSpan        SpanID
	Principal         PrincipalID
	Connection        ConnectionID
	Connector         ConnectorID
	AdapterVersion    string
	KnowledgeSnapshot KnowledgeSnapshotID
	Capability        Capability
	CapabilityVersion string
	Route             CapabilityRouteID
	Resolution        CapabilityResolutionID
	Run               ObjectRef
	Attempt           AttemptID
	PolicyDecision    PolicyDecisionID
}

// Cursor is opaque to the core and version-bound to its adapter.
type Cursor struct {
	Opaque         string
	AdapterVersion string
}

type Page[T any] struct {
	Items      []T
	NextCursor *Cursor
	Complete   bool
}

type ErrorClass string

const (
	ErrorValidation    ErrorClass = "validation"
	ErrorAuthorization ErrorClass = "authorization"
	ErrorRateLimited   ErrorClass = "rate-limited"
	ErrorUnavailable   ErrorClass = "unavailable"
	ErrorTimeout       ErrorClass = "timeout"
	ErrorExternalState ErrorClass = "external-state"
	ErrorContract      ErrorClass = "contract"
	ErrorDataQuality   ErrorClass = "data-quality"
	ErrorInternal      ErrorClass = "internal"
)

type ErrorInfo struct {
	Class      ErrorClass
	Code       string
	Message    string
	Retryable  bool
	RetryAfter *time.Time
	Evidence   []BlobID
	Details    *ExtensionPayload
}

type TimeWindow struct {
	Start time.Time
	End   time.Time
}

type Rights struct {
	Visibility       Visibility
	AcquisitionBasis string
	UsageBasis       string
	RetentionUntil   *time.Time
	DeletionRef      string
}

type Visibility string

const (
	VisibilityPublic     Visibility = "public"
	VisibilityOwned      Visibility = "owned"
	VisibilityAuthorized Visibility = "authorized"
	VisibilityRestricted Visibility = "restricted"
)

type AccessMode string

// AcquisitionMode remains an alias because observations and metric records use
// the older term. Connector routes use AccessMode because they may read or act.
type AcquisitionMode = AccessMode

const (
	ModeOfficialAPI      AccessMode = "official-api"
	ModeOfficialFeed     AccessMode = "official-feed-export"
	ModeAuthorizedExport AccessMode = "authorized-export"
	ModeDelegatedAPI     AccessMode = "delegated-api"
	ModeDelegatedService AccessMode = "delegated-service"
	ModePublicFeed       AccessMode = "public-feed"
	ModeBrowserAssisted  AccessMode = "browser-assisted"
	ModeLocalCompute     AccessMode = "local-compute"
	ModeManualImport     AccessMode = "manual-import"
	ModeManualPackage    AccessMode = "manual-package"
	ModePrivateAPICookie AccessMode = "private-api-cookie"
	ModeUnsupported      AccessMode = "unsupported"
)

type Confidence string

const (
	ConfidenceUnverified Confidence = "unverified"
	ConfidenceLow        Confidence = "low"
	ConfidenceMedium     Confidence = "medium"
	ConfidenceHigh       Confidence = "high"
)

type ContentHash struct {
	Algorithm string
	Value     string
}

// EvidenceAuthorship describes the relationship between the author of a span
// and the subject whose need or behavior is being inferred. It does not store
// identity and does not prove that the author's statement is true.
type EvidenceAuthorship string

const (
	// AuthorshipSubject means the subject directly expressed the selected span.
	AuthorshipSubject EvidenceAuthorship = "subject-authored"
	// AuthorshipCounterparty means another party recorded or paraphrased the
	// subject, such as a support agent or salesperson.
	AuthorshipCounterparty EvidenceAuthorship = "counterparty-authored"
	// AuthorshipProvider means the platform generated the value or state from
	// its own configuration or computation.
	AuthorshipProvider EvidenceAuthorship = "provider-generated"
	// AuthorshipDerived means a reviewed mapper, rule, or model produced it.
	AuthorshipDerived EvidenceAuthorship = "derived"
	// AuthorshipUnknown is mandatory when provenance cannot be established.
	AuthorshipUnknown EvidenceAuthorship = "unknown"
)

// EvidenceAttribution is a reviewable assertion about authorship provenance.
// Basis should point to schema/provenance rules rather than contain a person's
// name, email, account ID, or another identifying value.
type EvidenceAttribution struct {
	Authorship EvidenceAuthorship
	Basis      string
	AssessedAt time.Time
	Evidence   []EvidenceLink
}

type EvidenceSpan struct {
	ID                               EvidenceSpanID
	Source                           RevisionRef
	Blob                             BlobID
	Locator                          SpanLocator
	ObservedAt                       time.Time
	CanonicalURL                     string
	Rights                           Rights
	Attribution                      *EvidenceAttribution
	Conversation                     *ConversationSpanMetadata
	Correspondence                   *CorrespondenceSpanMetadata
	Community                        *CommunitySpanMetadata
	SoftwareWorkItem                 *SoftwareWorkItemSpanMetadata
	PublicDiscussion                 *PublicDiscussionSpanMetadata
	ProductFeedback                  *ProductFeedbackSpanMetadata
	BusinessExperienceFeedback       *BusinessExperienceFeedbackSpanMetadata
	RegulatoryComplaint              *RegulatoryComplaintSpanMetadata
	ProductReliability               *ProductReliabilitySpanMetadata
	OperationalStatus                *OperationalStatusSpanMetadata
	SoftwareVulnerability            *SoftwareVulnerabilitySpanMetadata
	SoftwarePackage                  *SoftwarePackageEcosystemSpanMetadata
	ProductLaunch                    *ProductLaunchSpanMetadata
	MarketplaceOffer                 *MarketplaceOfferSpanMetadata
	MarketplaceOutcome               *MarketplaceOutcomeSpanMetadata
	JobPosting                       *JobPostingSpanMetadata
	ServiceRequest                   *ServiceRequestSpanMetadata
	ServiceEngagement                *ServiceEngagementSpanMetadata
	ProductRequest                   *ProductRequestSpanMetadata
	PublicProcurement                *PublicProcurementSpanMetadata
	PublicFunding                    *PublicFundingSpanMetadata
	PublicRulemaking                 *PublicRulemakingSpanMetadata
	PublicCorporateDisclosure        *PublicCorporateDisclosureSpanMetadata
	PublicTechnicalStandard          *PublicTechnicalStandardSpanMetadata
	PublicProductRecall              *PublicProductRecallSpanMetadata
	PublicResearchLiterature         *PublicResearchLiteratureSpanMetadata
	PublicClinicalStudy              *PublicClinicalStudySpanMetadata
	PublicMedicineSupply             *PublicMedicineSupplySpanMetadata
	PublicRegulatoryEnforcement      *PublicRegulatoryEnforcementSpanMetadata
	PublicDisputeDecision            *PublicDisputeDecisionSpanMetadata
	PublicAuditFinding               *PublicAuditFindingSpanMetadata
	PublicCivicServiceRequest        *PublicCivicServiceRequestSpanMetadata
	PublicPetition                   *PublicPetitionSpanMetadata
	PublicParticipatoryBudget        *PublicParticipatoryBudgetSpanMetadata
	PublicInformationAccess          *PublicInformationAccessSpanMetadata
	PublicPlanningApplication        *PublicPlanningApplicationSpanMetadata
	PublicBuildingRegulation         *PublicBuildingRegulationSpanMetadata
	PublicRegulatedLicense           *PublicRegulatedLicenseSpanMetadata
	PublicEnvironmentalRegulation    *PublicEnvironmentalRegulationSpanMetadata
	PublicContaminationRemediation   *PublicContaminationRemediationSpanMetadata
	PublicDrinkingWaterSafety        *PublicDrinkingWaterSafetySpanMetadata
	PublicAmbientAirQuality          *PublicAmbientAirQualitySpanMetadata
	PublicFoodSafety                 *PublicFoodSafetySpanMetadata
	PublicTransitService             *PublicTransitServiceSpanMetadata
	RoadSafety                       *RoadSafetySpanMetadata
	PublicConsumerPrice              *PublicConsumerPriceSpanMetadata
	PublicRentalHousing              *PublicRentalHousingSpanMetadata
	PublicLaborDemand                *PublicLaborDemandSpanMetadata
	PublicBusinessDemography         *PublicBusinessDemographySpanMetadata
	PublicBusinessInsolvency         *PublicBusinessInsolvencySpanMetadata
	PublicBusinessCredit             *PublicBusinessCreditSpanMetadata
	PublicBusinessConditions         *PublicBusinessConditionsSpanMetadata
	PublicBusinessDigitalAdoption    *PublicBusinessDigitalAdoptionSpanMetadata
	PublicBusinessInnovation         *PublicBusinessInnovationSpanMetadata
	PublicDigitalAccessParticipation *PublicDigitalAccessParticipationSpanMetadata
	PublicHouseholdExpenditure       *PublicHouseholdExpenditureSpanMetadata
	PublicTimeUse                    *PublicTimeUseSpanMetadata
	PublicHealthCareAccess           *PublicHealthCareAccessSpanMetadata
	PublicHouseholdEnergy            *PublicHouseholdEnergySpanMetadata
	Quoted                           bool
	RetrievalTraceID                 string
}

type SpanLocator struct {
	Kind      string
	Start     int64
	End       int64
	Page      int
	TimeStart time.Duration
	TimeEnd   time.Duration
}
