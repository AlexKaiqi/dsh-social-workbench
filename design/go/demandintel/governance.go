package demandintel

import (
	"context"
	"time"
)

type PolicyAction string

const (
	PolicyCollect       PolicyAction = "collect"
	PolicyReadEvidence  PolicyAction = "read-evidence"
	PolicyDerive        PolicyAction = "derive"
	PolicyProbePreview  PolicyAction = "probe-preview"
	PolicyProbeExecute  PolicyAction = "probe-execute"
	PolicyCollectMetric PolicyAction = "collect-metric"
)

type PolicyRequest struct {
	Operation OperationContext
	Principal PrincipalID
	Purpose   string
	Action    PolicyAction
	Connector ConnectorID
	Objects   []RevisionRef
	Context   []ExtensionPayload
}

type PolicyDecision struct {
	ID            PolicyDecisionID
	Allowed       bool
	Obligations   []string
	Reasons       []string
	PolicyVersion string
	DecidedAt     time.Time
}

type CredentialLeaseRequest struct {
	Principal PrincipalID
	Connector ConnectorID
	Action    PolicyAction
	Scopes    []string
	ExpiresAt time.Time
}

type AuditOutcome string

const (
	AuditAllowed   AuditOutcome = "allowed"
	AuditDenied    AuditOutcome = "denied"
	AuditSucceeded AuditOutcome = "succeeded"
	AuditFailed    AuditOutcome = "failed"
	AuditUnknown   AuditOutcome = "unknown"
)

type AuditEvent struct {
	ID             AuditEventID
	SchemaVersion  string
	Operation      OperationContext
	Principal      PrincipalID
	Action         string
	ObjectRefs     []ObjectRef
	PolicyDecision PolicyDecisionID
	OccurredAt     time.Time
	Outcome        AuditOutcome
	Error          *ErrorInfo
	Extensions     []ExtensionPayload
}

type CapabilityProbeRequest struct {
	Operation  OperationContext
	Connector  ConnectorID
	Capability Capability
	Mode       AcquisitionMode
	DryRun     bool
	Budget     CapabilityLimits
}

type CapabilityProbeResult struct {
	Connector         ConnectorID
	Capability        Capability
	AdapterVersion    string
	CapabilityVersion string
	Callable          bool
	CheckedAt         time.Time
	Evidence          []EvidenceLink
	Findings          []Finding
}

type PolicyEngine interface {
	Evaluate(context.Context, PolicyRequest) (PolicyDecision, error)
}

// CredentialBroker returns an opaque short-lived lease reference, never secret material.
type CredentialBroker interface {
	IssueLease(context.Context, CredentialLeaseRequest) (CredentialLeaseRef, error)
	RevokeLease(context.Context, CredentialLeaseRef) error
}

type AuditSink interface {
	AppendAuditEvent(context.Context, AuditEvent) error
}

type CapabilityVerifier interface {
	Probe(context.Context, CapabilityProbeRequest) (CapabilityProbeResult, error)
}

type KillSwitch interface {
	SuspendConnector(context.Context, ConnectorID, string, PrincipalID) error
	SuspendCapability(context.Context, ConnectorID, Capability, string, PrincipalID) error
}
