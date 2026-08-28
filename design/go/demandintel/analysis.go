package demandintel

import (
	"context"
	"time"
)

type SignalEvidenceType string

const (
	EvidenceComplaint     SignalEvidenceType = "complaint"
	EvidenceWorkaround    SignalEvidenceType = "workaround"
	EvidenceBudget        SignalEvidenceType = "budget"
	EvidencePayment       SignalEvidenceType = "payment"
	EvidenceUrgency       SignalEvidenceType = "urgency"
	EvidenceSwitching     SignalEvidenceType = "switching"
	EvidenceJobCommitment SignalEvidenceType = "job-commitment"
	EvidenceProcurement   SignalEvidenceType = "procurement"
	// EvidenceOfficialProcurementRequirement means an exact buyer- or
	// procuring-authority-authored planning, market-engagement, opportunity, or
	// tender span states a requirement, scope, lot, eligibility condition,
	// deadline, or estimated value under one fixed procedure revision. It proves
	// a public procurement requirement was reported, not that a contract will be
	// awarded, the full budget is committed, a supplier has been selected, the
	// requirement is representative of a market, or every linked document is
	// licensed for reuse.
	EvidenceOfficialProcurementRequirement SignalEvidenceType = "official-procurement-requirement"
	// EvidenceReportedProcurementCommitment means an exact authority-authored
	// award, contract, call-up, standing-offer, or amendment record reports a
	// commitment under a fixed instrument, amount role, currency, and revision.
	// Estimated, award, original contract, amended, current, ceiling, obligation,
	// de-obligation, and potential values are not interchangeable. The record
	// does not by itself prove payment, delivery, acceptance, supplier receipt,
	// performance, economic impact, or independent customer demand.
	EvidenceReportedProcurementCommitment SignalEvidenceType = "reported-procurement-commitment"
	// EvidenceReportedProcurementExecutionEvent means an exact official
	// transaction, outlay, milestone, performance, completion, cancellation, or
	// termination record reports one execution event under a fixed authority and
	// source definition. It proves only what the source says occurred: an outlay
	// is not automatically supplier receipt, a completed status is not acceptance
	// or success, and a termination does not establish fault, unmet need, or cause.
	EvidenceReportedProcurementExecutionEvent SignalEvidenceType = "reported-procurement-execution-event"
	// EvidenceInstitutionalFundingPriority means an issuing authority published
	// an exact programme, call, opportunity, topic, or expected outcome under a
	// fixed public-funding definition. It is evidence of an institutional
	// priority and possible resource allocation, not customer demand, an award,
	// market size, procurement, scientific validity, or future policy stability.
	EvidenceInstitutionalFundingPriority SignalEvidenceType = "institutional-funding-priority"
	// EvidenceFundedResearchActivity means an authority reported an award or
	// funded project under an exact programme/opportunity/project identity. It
	// proves a funding decision was reported, not that the project succeeded,
	// generated the claimed result, found product-market fit, or represents an
	// independent demand occurrence. Support years and project amendments must
	// remain related revisions rather than duplicate investments.
	EvidenceFundedResearchActivity SignalEvidenceType = "funded-research-activity"
	// EvidenceRegulatoryChangePressure means an issuing authority published an
	// exact proposal, draft, call for evidence, or consultation under a fixed
	// rulemaking definition. It proves a possible policy or compliance change
	// is being considered, not that it will be adopted, is legally effective,
	// applies to a subject, or creates a customer demand occurrence.
	EvidenceRegulatoryChangePressure SignalEvidenceType = "regulatory-change-pressure"
	// EvidenceFormalStakeholderResponse means an exact stakeholder-authored
	// submission was published in a rulemaking or consultation process. It does
	// not prove the statement true, representative, independently authored, or
	// accepted by the authority; duplicate and campaign relationships remain in
	// the source projection and one response is not automatically one person.
	EvidenceFormalStakeholderResponse SignalEvidenceType = "formal-stakeholder-response"
	// EvidenceCorporateStrategicPriority means an exact issuer-authored filing
	// span states a strategy, programme, transition, or future resource priority.
	// It proves the issuer disclosed the statement, not that the plan is funded,
	// approved, executed, successful, a customer request, or independent truth.
	EvidenceCorporateStrategicPriority SignalEvidenceType = "corporate-strategic-priority"
	// EvidenceCorporateOperationalRisk means an exact issuer-authored filing
	// span describes a risk, constraint, dependency, or operational exposure. It
	// does not prove the event occurred, its likelihood or severity, regulator
	// agreement, customer pain, or a product opportunity.
	EvidenceCorporateOperationalRisk SignalEvidenceType = "corporate-operational-risk"
	// EvidenceReportedCorporateInvestment means an exact structured fact or
	// reviewed filing span reports a historical corporate resource-allocation
	// amount under a fixed accounting, period, unit, and amount-role definition.
	// It is not a future budget, cash payment, procurement, demand, or causal
	// evidence; planned and forecast amounts do not qualify as reported activity.
	EvidenceReportedCorporateInvestment SignalEvidenceType = "reported-corporate-investment"
	// EvidenceTechnicalStandardizationPressure means a standards body, working
	// group, technical committee, or governed platform process published an
	// exact requirement, proposal, or specification span under a fixed process
	// revision. It proves formal technical work exists, not approval, adoption,
	// deployment, legal obligation, customer demand, or market size.
	EvidenceTechnicalStandardizationPressure SignalEvidenceType = "technical-standardization-pressure"
	// EvidenceCompatibilityMigrationPressure means an exact approved,
	// published, integrated, deprecated, obsoleted, or superseding technical
	// record states a compatibility change or migration requirement. It does
	// not prove that any installed system is affected, that the change has
	// shipped everywhere, or that users will buy a solution.
	EvidenceCompatibilityMigrationPressure SignalEvidenceType = "compatibility-migration-pressure"
	// EvidenceFormalImplementationFeedback means an exact implementer-authored
	// issue, report, test result, or process submission was published under a
	// standards or platform-evolution process. It is not committee consensus,
	// representative demand, an independently reproduced result, or acceptance
	// of the proposed resolution.
	EvidenceFormalImplementationFeedback SignalEvidenceType = "formal-implementation-feedback"
	// EvidenceRegulatoryCorrectiveAction means an exact authority- or
	// responsible-operator-authored record states that a recall, remedy, market
	// withdrawal, warning, or other corrective measure was requested, ordered,
	// initiated, or performed. It does not prove that every affected unit was
	// found, that remediation is complete, that harm occurred, or legal liability.
	EvidenceRegulatoryCorrectiveAction SignalEvidenceType = "regulatory-corrective-action"
	// EvidenceReportedProductSafetyHazard means an exact source-attributed span
	// identifies a defect, noncompliance, hazard, risk classification, incident,
	// or injury assertion under a fixed recall or alert definition. It proves
	// what the source reported or classified, not causality, incidence, exposure,
	// completeness, or that every unit of the product is dangerous.
	EvidenceReportedProductSafetyHazard SignalEvidenceType = "reported-product-safety-hazard"
	// EvidenceReportedResearchLimitation means an exact author-, editor-, or
	// review-authored span reports a limitation, failure condition, assumption,
	// uncertainty, or threat to validity for one fixed work version and content
	// representation. It proves that the source reported the boundary; it does
	// not independently verify the boundary, invalidate the whole work, establish
	// prevalence or severity, or prove customer pain or market demand.
	EvidenceReportedResearchLimitation SignalEvidenceType = "reported-research-limitation"
	// EvidenceReportedUnmetResearchNeed means an exact author-, editor-, or
	// review-authored span states an unresolved question, missing method, absent
	// evidence or data, replication need, or future-work direction for one fixed
	// work version. It is not a funding priority, procurement request, feasibility
	// finding, representative user request, or estimate of market size.
	EvidenceReportedUnmetResearchNeed SignalEvidenceType = "reported-unmet-research-need"
	// EvidenceRegistryDeclaredClinicalStudyActivity means an exact registry,
	// sponsor, or responsible-party record declares a study plan, recruitment
	// state, protocol milestone, or results-posting event under one fixed record
	// revision. It proves the declaration was registered, not that recruitment
	// occurred as stated, the study was funded, approved for treatment, completed,
	// scientifically valid, clinically beneficial, or evidence of market demand.
	EvidenceRegistryDeclaredClinicalStudyActivity SignalEvidenceType = "registry-declared-clinical-study-activity"
	// EvidenceReportedClinicalStudyConstraint means an exact sponsor-,
	// responsible-party-, regulator-, or registry-authored span reports a study
	// constraint such as suspension, termination, withdrawal, recruitment
	// difficulty, protocol amendment, missing result, or stated reason for
	// stopping. It proves what the source reported, not causality, prevalence,
	// patient harm, treatment advice, product failure, or customer pain.
	EvidenceReportedClinicalStudyConstraint SignalEvidenceType = "reported-clinical-study-constraint"
	// EvidenceRegulatorReportedMedicineSupplyConstraint means an exact
	// regulator-, national-authority-, or regulated-notifier-authored record
	// declares an anticipated, current, limited, unavailable, or discontinued
	// supply state for one medicine product or presentation in one jurisdiction
	// and record revision. It does not prove current stock at every location,
	// root cause, patient harm, clinical interchangeability, demand magnitude,
	// market opportunity, or that a projected end date will be met.
	EvidenceRegulatorReportedMedicineSupplyConstraint SignalEvidenceType = "regulator-reported-medicine-supply-constraint"
	// EvidenceReportedMedicineSupplyMitigation means an exact authority- or
	// regulated-notifier-authored span reports an allocation, import, expedited
	// supply, alternative-presentation, substitution-instrument, or other
	// shortage-management action. It proves only that the action was reported;
	// it is not evidence that the measure is effective, complete, legally
	// available to a subject, or clinically appropriate for an individual.
	EvidenceReportedMedicineSupplyMitigation SignalEvidenceType = "reported-medicine-supply-mitigation"
	// EvidenceOfficialRegulatoryComplianceAssertion means an exact regulator,
	// administrative tribunal, or court record states an allegation, charge,
	// finding, admission, infringement, or other compliance assertion under one
	// fixed procedural posture and record revision. The posture is mandatory: a
	// complaint is not a finding, a settlement is not necessarily an admission,
	// and an order can later be stayed, vacated, reversed, or remanded. It does
	// not by itself prove prevalence, causality, customer demand, or liability in
	// another jurisdiction or proceeding.
	EvidenceOfficialRegulatoryComplianceAssertion SignalEvidenceType = "official-regulatory-compliance-assertion"
	// EvidenceOfficialRegulatoryRemedialObligation means an exact final or
	// proposed order, consent agreement, settlement, undertaking, or judgment
	// states a cease-and-desist, injunction, redress, penalty, data-deletion,
	// reporting, monitoring, divestiture, or other remedial obligation. It proves
	// only what the cited legal instrument requires or proposes; it does not
	// prove admission, completion, effectiveness, consumer recovery, or a future
	// purchasing decision.
	EvidenceOfficialRegulatoryRemedialObligation SignalEvidenceType = "official-regulatory-remedial-obligation"
	// EvidenceOfficialDisputeDetermination means an exact ombudsman or other
	// public dispute-resolution decision span states a finding or outcome under
	// one fixed procedure, stage, jurisdiction, and record revision. An
	// investigator view or preliminary decision is not a final determination;
	// publication does not by itself establish acceptance, binding effect,
	// representativeness, prevalence, independent recurrence, or a universal
	// statement of law or policy.
	EvidenceOfficialDisputeDetermination SignalEvidenceType = "official-dispute-determination"
	// EvidenceOfficialDisputeRemedy means an exact final or provisional
	// decision states an award, direction, order, recommendation, compensation,
	// apology, repair, process change, or other remedy. It proves only what the
	// cited instrument grants, directs, orders, or recommends. Binding effect,
	// acceptance, appeal or stay, implementation, payment, and compliance remain
	// separate evidence and must not be inferred from publication or outcome.
	EvidenceOfficialDisputeRemedy SignalEvidenceType = "official-dispute-remedy"
	// EvidenceOfficialAuditFinding means an exact public-auditor-authored span
	// states a finding, observation, conclusion, or opinion under one fixed
	// engagement scope, criteria, method, report revision, and assurance posture.
	// It proves what the auditor reported within that scope; it does not prove a
	// universal condition, fraud, legal liability, prevalence, organizational
	// risk rank, or the contents of findings omitted from the published report.
	EvidenceOfficialAuditFinding SignalEvidenceType = "official-audit-finding"
	// EvidenceOfficialAuditRecommendation means an exact public-auditor-authored
	// recommendation or matter identifies a proposed action and responsible body
	// under one report revision. It proves issuance of the recommendation, not a
	// legal obligation, auditee agreement, funding, implementation, benefit
	// realization, procurement intent, or customer demand.
	EvidenceOfficialAuditRecommendation SignalEvidenceType = "official-audit-recommendation"
	// EvidenceReportedAuditFollowUp means an exact auditor-authored follow-up
	// span reports an implementation assessment, confirmation, or follow-up audit
	// result. Auditee self-report, auditor confirmation, and a follow-up audit are
	// distinct authorities. The evidence does not by itself prove causality,
	// continuing effectiveness, completion outside the assessed scope, or receipt
	// of an estimated or reported financial benefit.
	EvidenceReportedAuditFollowUp SignalEvidenceType = "reported-audit-follow-up"
	// EvidencePublishedCivicServiceRequest means an exact public authority
	// dataset or API record states that one civic service request was recorded
	// under a fixed jurisdiction, service taxonomy, publication population, and
	// record revision. It proves a published request record, not a unique person,
	// unique incident, verified condition, valid complaint, current condition,
	// agency fault, prevalence, or an independently recurring need.
	EvidencePublishedCivicServiceRequest SignalEvidenceType = "published-civic-service-request"
	// EvidenceReportedCivicServiceDisposition means an exact authority-authored
	// status, status note, assignment, closure, or disposition span reports how a
	// civic service request was handled at one revision. It proves only the
	// source-declared workflow state. Closed, action taken, or resolved does not
	// by itself prove physical resolution, timeliness, satisfaction, durability,
	// causal impact, or absence of recurrence.
	EvidenceReportedCivicServiceDisposition SignalEvidenceType = "reported-civic-service-disposition"
	// EvidencePublishedPetitionRequest means an exact petitioner-authored action,
	// background, or additional-detail span was accepted for publication by an
	// official petition process under one jurisdiction and process revision. It
	// proves a formal request was published, not that its claims are true, the
	// request is representative, the platform or legislature endorses it, a legal
	// duty exists, or its support count measures public opinion or market demand.
	EvidencePublishedPetitionRequest SignalEvidenceType = "published-petition-request"
	// EvidencePlatformAcceptedPetitionSupport means an exact official aggregate
	// reports support or signatures accepted under one counting, eligibility,
	// verification, invalidation, and observation definition. It proves only the
	// platform-counted actions at that time. It is not a representative poll,
	// eligible-population denominator, independently verified set of people, or
	// proof of agreement; invalidation, withdrawal, deletion, and paper/online
	// reconciliation can make the count change or decrease.
	EvidencePlatformAcceptedPetitionSupport SignalEvidenceType = "platform-accepted-petition-support"
	// EvidenceOfficialPetitionResponse means an exact government, department,
	// committee, chamber, or parliament record reports a response, consideration,
	// referral, hearing, debate, report, resolution, or closure for one petition.
	// It proves that procedural act occurred, not agreement, adoption, legal
	// change, implementation, effectiveness, issue resolution, or public support.
	EvidenceOfficialPetitionResponse SignalEvidenceType = "official-petition-response"
	// EvidencePublishedParticipatoryBudgetNeed means an exact proposer-authored
	// idea, need, or project span was published in one participatory-budgeting
	// process and round. It proves a proposed use of public resources was
	// published, not that the claim is true, representative, feasible, selected,
	// funded, procured, delivered, effective, or endorsed by the authority.
	EvidencePublishedParticipatoryBudgetNeed SignalEvidenceType = "published-participatory-budget-need"
	// EvidenceParticipatoryBudgetPriorityAggregate means an exact official
	// support, vote, grade, rank, or participant aggregate was reported under one
	// eligibility, channel, verification, weighting, ballot, and observation
	// definition. It is not a representative poll, population rate, independent
	// set of needs, or a measure comparable across rounds or jurisdictions.
	EvidenceParticipatoryBudgetPriorityAggregate SignalEvidenceType = "participatory-budget-priority-aggregate"
	// EvidenceReportedParticipatoryBudgetAllocation means an exact official
	// record reports that a project was selected, included in a budget, funded,
	// or appropriated with an explicit amount role and authority. Selection,
	// estimate, ballot price, budget inclusion, appropriation, commitment,
	// obligation, payment, and spend remain different facts.
	EvidenceReportedParticipatoryBudgetAllocation SignalEvidenceType = "reported-participatory-budget-allocation"
	// EvidenceReportedParticipatoryBudgetExecution means an exact authority-
	// authored milestone or status reports implementation, delay, cancellation,
	// opening, or completion. It proves only the source-declared workflow state,
	// not physical delivery, acceptance, quality, impact, satisfaction, or cost
	// correctness.
	EvidenceReportedParticipatoryBudgetExecution SignalEvidenceType = "reported-participatory-budget-execution"
	// EvidencePublishedInformationAccessRequest means an exact requester-authored
	// description of records, documents, data, scope, period, or format sought was
	// published in one access-to-information process. It proves an information
	// need was formally expressed, not that any surrounding allegation is true,
	// the request is valid, unique, representative, endorsed, or correctly routed.
	EvidencePublishedInformationAccessRequest SignalEvidenceType = "published-information-access-request"
	// EvidenceAttributedPublicBodyCorrespondence means an exact message was
	// published as correspondence attributed to a public body under one delivery
	// and authentication definition. It proves the platform associated the
	// message with that body, not that every statement is complete, accurate,
	// legally final, independently authenticated, or an admission of wrongdoing.
	EvidenceAttributedPublicBodyCorrespondence SignalEvidenceType = "attributed-public-body-correspondence"
	// EvidenceReportedInformationAccessDisposition means an exact requester,
	// platform, public-body, review-body, ombudsman, or court record reports a
	// full/partial disclosure, refusal, no-records, transfer, fee, withdrawal,
	// delay, review, or appeal outcome. The classification authority and revision
	// are mandatory; platform "successful" or agency "completed" is not by itself
	// a legal finding, complete disclosure, requester satisfaction, or compliance.
	EvidenceReportedInformationAccessDisposition SignalEvidenceType = "reported-information-access-disposition"
	// EvidencePublishedInformationAccessRelease means an exact responsive
	// attachment or release artifact was published with source, redaction,
	// privacy, and reuse-rights metadata. It proves publication of that artifact,
	// not completeness, authenticity beyond the recorded delivery path, current
	// validity, freedom from withheld material, or permission to index its content.
	EvidencePublishedInformationAccessRelease SignalEvidenceType = "published-information-access-release"
	// EvidencePublishedPlanningApplication means an exact applicant- or
	// authority-published span describes a requested development, land-use, or
	// building change in one identified planning process and revision. It proves
	// publication of the proposal, not truth, need, feasibility, entitlement,
	// approval, construction, occupation, impact, or applicant endorsement.
	EvidencePublishedPlanningApplication SignalEvidenceType = "published-planning-application"
	// EvidencePublishedPlanningRepresentation means an exact approved span was
	// published as a support, objection, comment, organisation submission, or
	// agency representation on one application and consultation window. It is
	// not a unique-person count, representative opinion, verified claim, vote,
	// legal finding, or proof that the decision-maker considered every issue.
	EvidencePublishedPlanningRepresentation SignalEvidenceType = "published-planning-representation"
	// EvidenceReportedPlanningAssessment means an exact officer, review-body,
	// agency, or applicant-response span reports an assessment, recommendation,
	// issue response, or proposed modification at one stage and revision. The
	// author authority and posture are mandatory; it is not the competent
	// authority's final decision or proof that the underlying claim is correct.
	EvidenceReportedPlanningAssessment SignalEvidenceType = "reported-planning-assessment"
	// EvidenceReportedPlanningDecision means an exact competent-authority,
	// appeal-body, ministerial, or court record reports a decision, condition,
	// modification, remand, or review outcome at one fixed stage and revision.
	// It proves only the reported procedural act, not legal correctness, physical
	// implementation, occupation, compliance, benefit, harm, or durable success.
	EvidenceReportedPlanningDecision SignalEvidenceType = "reported-planning-decision"
	// EvidencePublishedBuildingWorkApplication means an exact approved span
	// reports proposed building work in one authority process and revision. It
	// proves publication of the filing, not truth, demand, authorization,
	// commencement, completion, compliance, occupancy, benefit, or harm.
	EvidencePublishedBuildingWorkApplication SignalEvidenceType = "published-building-work-application"
	// EvidenceReportedBuildingPermitAuthorization means an exact issuing
	// authority record reports approval, issue, renewal, suspension, revocation,
	// expiry, voiding, or refusal under fixed validity rules. It does not prove
	// that work started, followed approved plans, passed inspection, or completed.
	EvidenceReportedBuildingPermitAuthorization SignalEvidenceType = "reported-building-permit-authorization"
	// EvidenceReportedBuildingInspectionResult means an exact authority or
	// certifier record reports one inspection stage, discipline, scope, and result.
	// Partial, waived, no-entry, and reinspection states remain explicit; one pass
	// never proves whole-project or continuing compliance.
	EvidenceReportedBuildingInspectionResult SignalEvidenceType = "reported-building-inspection-result"
	// EvidenceReportedBuildingCodeFinding means an exact authority record reports
	// a complaint, observation, violation, citation, order, adjudication, or
	// correction posture. Allegation, liability, compliance, and current property
	// condition remain separate and must not be inferred from one another.
	EvidenceReportedBuildingCodeFinding SignalEvidenceType = "reported-building-code-finding"
	// EvidenceReportedBuildingCertificate means an exact authority or certifier
	// record reports a construction, completion, occupancy, or building certificate
	// with type, partial scope, status, and revision. It does not prove current
	// safety, actual occupancy, continuing compliance, or product-market success.
	EvidenceReportedBuildingCertificate SignalEvidenceType = "reported-building-certificate"
	// EvidencePublishedRegulatedLicenseApplication reports an application,
	// renewal, or requested scope change. It proves only publication of a filing,
	// not eligibility, approval, demand, competence, practice, or authorization.
	EvidencePublishedRegulatedLicenseApplication SignalEvidenceType = "published-regulated-license-application"
	// EvidenceReportedRegulatedLicenseAuthorization reports issue, standing,
	// scope, expiry, suspension, revocation, surrender, denial, or reinstatement
	// under one authority revision. It does not prove competence or actual work.
	EvidenceReportedRegulatedLicenseAuthorization SignalEvidenceType = "reported-regulated-license-authorization"
	// EvidenceReportedRegulatedActivityInspection reports one inspection type,
	// scope, time, and result. Education-only, no-entry, out-of-business, pass,
	// and violation-issued states remain distinct and do not prove ongoing compliance.
	EvidenceReportedRegulatedActivityInspection SignalEvidenceType = "reported-regulated-activity-inspection"
	// EvidencePublishedRegulatedLicenseAllegation reports a complaint, charge,
	// accusation, citation, or investigation assertion. It is not a sustained
	// finding, liability, or proof of misconduct.
	EvidencePublishedRegulatedLicenseAllegation SignalEvidenceType = "published-regulated-license-allegation"
	// EvidenceReportedRegulatedLicenseFinding reports a sustained, dismissed,
	// consent, vacated, or other finding posture and finality from a competent
	// body. It does not by itself prove current standing or an effective sanction.
	EvidenceReportedRegulatedLicenseFinding SignalEvidenceType = "reported-regulated-license-finding"
	// EvidenceReportedRegulatedLicenseSanction reports a caution, fine,
	// restriction, condition, undertaking, probation, suspension, revocation,
	// surrender, or prohibition. A condition may be non-disciplinary.
	EvidenceReportedRegulatedLicenseSanction SignalEvidenceType = "reported-regulated-license-sanction"
	// EvidenceReportedRegulatedLicenseRemediation reports monitoring, compliance,
	// variation, removal, restoration, or reinstatement. Reported completion and
	// authority verification stay separate and do not erase historical findings.
	EvidenceReportedRegulatedLicenseRemediation SignalEvidenceType = "reported-regulated-license-remediation"
	// EvidencePublishedEnvironmentalPermitApplication reports a public filing,
	// transfer, variation, or surrender request. It does not prove issue,
	// authorization, actual operation, investment, or demand.
	EvidencePublishedEnvironmentalPermitApplication SignalEvidenceType = "published-environmental-permit-application"
	// EvidenceReportedEnvironmentalAuthorization reports an exact permit,
	// exemption, condition, limit, standing, or revision from the competent
	// authority. It does not prove actual operation or continuing compliance.
	EvidenceReportedEnvironmentalAuthorization SignalEvidenceType = "reported-environmental-authorization"
	// EvidenceReportedEnvironmentalMeasurement reports an exact parameter,
	// quantity kind, method, unit, statistic, period, derivation, reporting basis,
	// and qualifier. Reporting authority remains distinct; no comparison is implied.
	EvidenceReportedEnvironmentalMeasurement SignalEvidenceType = "reported-environmental-measurement"
	// EvidenceReportedEnvironmentalReleaseTransfer reports a periodic release,
	// transfer, load, or thresholded inventory value. It is not an instantaneous
	// emission, exposure, harm estimate, permit comparison, or compliance finding.
	EvidenceReportedEnvironmentalReleaseTransfer SignalEvidenceType = "reported-environmental-release-transfer"
	// EvidenceReportedEnvironmentalThresholdComparison reports or derives one
	// measurement-to-limit comparison with exact unit, method, statistic, period,
	// and permit revision. An exceedance is not automatically a legal violation.
	EvidenceReportedEnvironmentalThresholdComparison SignalEvidenceType = "reported-environmental-threshold-comparison"
	// EvidenceReportedEnvironmentalInspection reports one inspection, audit,
	// assessment, incident response, or compliance-rating scope and result. It
	// does not prove whole-site or continuing compliance.
	EvidenceReportedEnvironmentalInspection SignalEvidenceType = "reported-environmental-inspection"
	// EvidenceReportedEnvironmentalComplianceFinding reports a system-generated,
	// self-reported, or authority-determined violation/noncompliance posture and
	// finality. Those authorities remain distinct and a finding implies no penalty.
	EvidenceReportedEnvironmentalComplianceFinding SignalEvidenceType = "reported-environmental-compliance-finding"
	// EvidenceReportedEnvironmentalEnforcementAction reports a notice, order,
	// undertaking, proceeding, penalty, or conviction from the issuing authority.
	// It does not prove remediation, current permit standing, exposure, or harm.
	EvidenceReportedEnvironmentalEnforcementAction SignalEvidenceType = "reported-environmental-enforcement-action"
	// EvidenceReportedEnvironmentalRemediation reports corrective action,
	// restoration, completion, or return to compliance. Reported completion and
	// authority verification remain separate and do not erase historical facts.
	EvidenceReportedEnvironmentalRemediation SignalEvidenceType = "reported-environmental-remediation"
	// EvidenceReportedContaminationNotification reports a release, suspected
	// site, or statutory notification. It does not prove detection, significance,
	// listing, exposure, harm, liability, or the need for a particular remedy.
	EvidenceReportedContaminationNotification SignalEvidenceType = "reported-contamination-notification"
	// EvidenceReportedContaminantObservation reports a contaminant observation
	// with exact medium, method, unit, statistic, qualifier, time, and authority.
	// Detection does not by itself prove a complete pathway, exposure, or harm.
	EvidenceReportedContaminantObservation SignalEvidenceType = "reported-contaminant-observation"
	// EvidenceReportedContaminatedSiteDesignation reports a competent authority's
	// determination, declaration, designation, listing, termination, or deletion.
	// Potential or notified land is not silently promoted to this evidence type.
	EvidenceReportedContaminatedSiteDesignation SignalEvidenceType = "reported-contaminated-site-designation"
	// EvidenceReportedContaminationRiskAssessment reports a source-defined
	// screening, priority class, pathway assessment, or risk conclusion for an
	// exact use and revision. It is neither a universal score nor proof of harm.
	EvidenceReportedContaminationRiskAssessment SignalEvidenceType = "reported-contamination-risk-assessment"
	// EvidencePublishedContaminationResponsibilityAssertion reports custody,
	// ownership, operation, potential responsibility, accepted work, or another
	// published party posture. It is not automatically an admission or liability.
	EvidencePublishedContaminationResponsibilityAssertion SignalEvidenceType = "published-contamination-responsibility-assertion"
	// EvidenceReportedContaminationLiabilityDetermination reports a competent
	// authority or court finding, settlement, lien, or recovery posture with exact
	// finality. Settlement and ownership do not silently become adjudicated fault.
	EvidenceReportedContaminationLiabilityDetermination SignalEvidenceType = "reported-contamination-liability-determination"
	// EvidenceReportedContaminationRemedyDecision reports selection, amendment,
	// or explanation of a remedy. Selection is not design, implementation,
	// completion, goal attainment, closure, or unrestricted suitability.
	EvidenceReportedContaminationRemedyDecision SignalEvidenceType = "reported-contamination-remedy-decision"
	// EvidenceReportedContaminationCleanupAction reports investigation, removal,
	// treatment, containment, restoration, risk management, or operation under an
	// exact scope. One action does not prove whole-site completion.
	EvidenceReportedContaminationCleanupAction SignalEvidenceType = "reported-contamination-cleanup-action"
	// EvidenceReportedContaminationCompletionMilestone reports an exact phase,
	// construction, cleanup-goal, closure, deletion, or readiness milestone.
	// Construction complete may coexist with operating remedies and unmet goals.
	EvidenceReportedContaminationCompletionMilestone SignalEvidenceType = "reported-contamination-completion-milestone"
	// EvidenceReportedContaminationLongTermControl reports an institutional,
	// engineering, access, monitoring, or review control and its exact status.
	// Listing deletion or reuse does not imply that such controls disappeared.
	EvidenceReportedContaminationLongTermControl SignalEvidenceType = "reported-contamination-long-term-control"
	// EvidenceReportedContaminationCost reports an exact estimate, allocation,
	// obligation, expenditure, liability, recovery claim, settlement, or receipt.
	// The roles remain separate and cannot be summed without accounting lineage.
	EvidenceReportedContaminationCost SignalEvidenceType = "reported-contamination-cost"
	// EvidencePublishedDrinkingWaterSupplyRegistration reports a supplier,
	// system, service area or registration standing. Registration does not prove
	// operation, current potability, compliance or coverage of every supply.
	EvidencePublishedDrinkingWaterSupplyRegistration SignalEvidenceType = "published-drinking-water-supply-registration"
	// EvidenceReportedDrinkingWaterMeasurement reports an exact point, stage,
	// parameter, method, unit, statistic, period, qualifier, time and authority.
	// One result does not establish a whole-system condition or consumer exposure.
	EvidenceReportedDrinkingWaterMeasurement SignalEvidenceType = "reported-drinking-water-measurement"
	// EvidenceReportedDrinkingWaterStandard reports an exact statutory limit,
	// treatment technique, indicator, monitoring duty or guidance value with its
	// applicability and revision. These standard kinds are not interchangeable.
	EvidenceReportedDrinkingWaterStandard SignalEvidenceType = "reported-drinking-water-standard"
	// EvidenceReportedDrinkingWaterStandardComparison reports or derives one
	// result-to-standard comparison after unit, method, statistic, period and
	// applicability checks. A failed comparison is not automatically a violation.
	EvidenceReportedDrinkingWaterStandardComparison SignalEvidenceType = "reported-drinking-water-standard-comparison"
	// EvidenceReportedDrinkingWaterComplianceFinding reports a monitoring,
	// reporting, treatment or quality finding with originator, legal scope,
	// finality and resolution basis. Resolved does not mean every risk disappeared.
	EvidenceReportedDrinkingWaterComplianceFinding SignalEvidenceType = "reported-drinking-water-compliance-finding"
	// EvidenceReportedDrinkingWaterQualityEvent reports a quality, sufficiency,
	// treatment, distribution or consumer-concern event and its assessment. It is
	// not proof that unsafe water reached consumers or caused illness.
	EvidenceReportedDrinkingWaterQualityEvent SignalEvidenceType = "reported-drinking-water-quality-event"
	// EvidencePublishedDrinkingWaterAdvisory reports an informational, boil,
	// do-not-drink, do-not-use or interruption notice with issuer, scope and
	// standing. A protective instruction is not proof of exposure or harm.
	EvidencePublishedDrinkingWaterAdvisory SignalEvidenceType = "published-drinking-water-advisory"
	// EvidenceReportedDrinkingWaterInspection reports an inspection, audit, site
	// visit or regulatory assessment for an exact scope. It does not establish
	// whole-system or continuing compliance.
	EvidenceReportedDrinkingWaterInspection SignalEvidenceType = "reported-drinking-water-inspection"
	// EvidenceReportedDrinkingWaterEnforcement reports a notice, order, legal
	// instrument or enforcement action. It does not prove correction, restoration,
	// advisory lift, consumer exposure or illness.
	EvidenceReportedDrinkingWaterEnforcement SignalEvidenceType = "reported-drinking-water-enforcement"
	// EvidenceReportedDrinkingWaterCorrectiveAction reports investigation,
	// operational, treatment, distribution, monitoring or infrastructure action.
	// Action completion does not by itself prove acceptable water or restored service.
	EvidenceReportedDrinkingWaterCorrectiveAction SignalEvidenceType = "reported-drinking-water-corrective-action"
	// EvidenceReportedDrinkingWaterRestoration reports return-to-compliance,
	// acceptable confirmation results, actual advisory rescission or service
	// restoration with authority. Lift recommendation alone is not restoration.
	EvidenceReportedDrinkingWaterRestoration SignalEvidenceType = "reported-drinking-water-restoration"
	// EvidenceReportedDrinkingWaterAggregate reports an exact numerator,
	// denominator, population, aggregation rule and period. Test, system, notice,
	// connection and population counts cannot be treated as the same denominator.
	EvidenceReportedDrinkingWaterAggregate SignalEvidenceType = "reported-drinking-water-aggregate"
	// EvidencePublishedAmbientAirMonitoringNetwork reports an exact network,
	// station, monitor, method and spatial-representativeness definition. A listed
	// station does not establish current operation, data availability or area-wide
	// representativeness.
	EvidencePublishedAmbientAirMonitoringNetwork SignalEvidenceType = "published-ambient-air-monitoring-network"
	// EvidenceReportedAmbientAirObservation reports a pollutant observation with
	// exact station, monitor, method, unit, statistic, averaging period, production
	// kind and quality posture. It is not proof of postcode conditions or personal
	// exposure.
	EvidenceReportedAmbientAirObservation SignalEvidenceType = "reported-ambient-air-observation"
	// EvidenceReportedAmbientAirQualityStatus reports preliminary, screened,
	// corrected, validated, invalid or superseded status for an exact revision.
	// Validation does not prohibit a later correction.
	EvidenceReportedAmbientAirQualityStatus SignalEvidenceType = "reported-ambient-air-quality-status"
	// EvidencePublishedAmbientAirIndex reports an exact index definition or value,
	// including formula, breakpoints, averaging, completeness, production and
	// health meaning. Index numbers from different definitions are not directly
	// comparable.
	EvidencePublishedAmbientAirIndex SignalEvidenceType = "published-ambient-air-index"
	// EvidencePublishedAmbientAirForecast reports an issuer's forecast, model run,
	// lead time, amendment and validity window. It is not an observation, issued
	// advisory or guarantee of future conditions.
	EvidencePublishedAmbientAirForecast SignalEvidenceType = "published-ambient-air-forecast"
	// EvidenceReportedAmbientAirStandardComparison reports a source comparison or
	// a bounded derived candidate against an exact breakpoint, trigger, guideline
	// or legal standard. A high index or concentration alone is not legal
	// nonattainment.
	EvidenceReportedAmbientAirStandardComparison SignalEvidenceType = "reported-ambient-air-standard-comparison"
	// EvidenceReportedAmbientAirComplianceAssessment reports an authority's exact
	// assessment scope, period, completeness, legal basis and revision. It does not
	// prove a person's exposure, symptoms or illness.
	EvidenceReportedAmbientAirComplianceAssessment SignalEvidenceType = "reported-ambient-air-compliance-assessment"
	// EvidenceReportedAmbientAirPollutionEvent reports an episode or event with
	// observed-condition and causal-attribution postures kept separate. Smoke,
	// dust, inversion or source attribution may remain reported or modelled.
	EvidenceReportedAmbientAirPollutionEvent SignalEvidenceType = "reported-ambient-air-pollution-event"
	// EvidencePublishedAmbientAirAdvisory reports an exact action day, statement,
	// advisory, alert, update or ending from its issuer. A trigger match, forecast
	// or aggregator display is not an issued alert.
	EvidencePublishedAmbientAirAdvisory SignalEvidenceType = "published-ambient-air-advisory"
	// EvidencePublishedAmbientAirHealthGuidance reports source-authored risk and
	// action messages for a defined audience and horizon. It is public guidance,
	// not clinical advice or proof of exposure or harm.
	EvidencePublishedAmbientAirHealthGuidance SignalEvidenceType = "published-ambient-air-health-guidance"
	// EvidenceReportedAmbientAirCorrection reports a correction, backfill,
	// invalidation, amendment or supersession with exact lineage. Latest values do
	// not erase prior published revisions.
	EvidenceReportedAmbientAirCorrection SignalEvidenceType = "reported-ambient-air-correction"
	// EvidenceReportedAmbientAirAggregate reports an exact numerator,
	// denominator, station population, completeness rule and period. Hours,
	// stations, people, areas, episodes and alert counts are distinct denominators.
	EvidenceReportedAmbientAirAggregate SignalEvidenceType = "reported-ambient-air-aggregate"
	// EvidencePublishedFoodEstablishmentPopulation reports an exact program,
	// premises, establishment or permit population. Inclusion does not prove a
	// current inspection, safe condition, endorsement or continued operation.
	EvidencePublishedFoodEstablishmentPopulation SignalEvidenceType = "published-food-establishment-population"
	// EvidenceReportedFoodSafetyInspection reports one exact inspection type,
	// scope, result, time and authority. A pass is not continuing or whole-business
	// safety, and a complaint-origin inspection does not verify the complaint.
	EvidenceReportedFoodSafetyInspection SignalEvidenceType = "reported-food-safety-inspection"
	// EvidenceReportedFoodSafetyViolation reports an exact citation, infraction or
	// finding with severity and adjudication posture. Critical does not establish
	// illness, and a citation is not automatically a final legal finding.
	EvidenceReportedFoodSafetyViolation SignalEvidenceType = "reported-food-safety-violation"
	// EvidencePublishedFoodHygieneRating reports a native scheme definition and
	// exact rating, grade, score or notice standing. Ratings from different schemes
	// and rule revisions are not numerically or categorically interchangeable.
	EvidencePublishedFoodHygieneRating SignalEvidenceType = "published-food-hygiene-rating"
	// EvidenceReportedFoodSafetyEnforcement reports an exact warning, ticket,
	// summons, order, permit action, referral or adjudication. It does not prove
	// liability, correction, closure duration or present conditions.
	EvidenceReportedFoodSafetyEnforcement SignalEvidenceType = "reported-food-safety-enforcement"
	// EvidenceReportedFoodEstablishmentClosure reports an authority's exact closure,
	// reclosure or active-order record. Closure does not prove permanent business
	// failure, illness, outbreak attribution or conditions outside its scope.
	EvidenceReportedFoodEstablishmentClosure SignalEvidenceType = "reported-food-establishment-closure"
	// EvidenceReportedFoodEstablishmentReopening reports an authority-authorized
	// reopening for an exact premises and inspection. It does not erase prior
	// violations or guarantee continuing safety.
	EvidenceReportedFoodEstablishmentReopening SignalEvidenceType = "reported-food-establishment-reopening"
	// EvidenceReportedFoodSafetyCorrection reports operator-reported or
	// authority-verified correction with exact item, scope and reinspection lineage.
	// Correction of one item does not establish whole-establishment compliance.
	EvidenceReportedFoodSafetyCorrection SignalEvidenceType = "reported-food-safety-correction"
	// EvidenceReportedFoodborneOutbreak reports an exact surveillance outbreak,
	// mode, setting, period, reporting jurisdiction and close-out posture. It is
	// not a count of sporadic illness or an exact establishment relation.
	EvidenceReportedFoodborneOutbreak SignalEvidenceType = "reported-foodborne-outbreak"
	// EvidenceReportedFoodborneEtiology reports confirmed, suspected, multiple or
	// unknown etiology as reported and reviewed by the surveillance authority.
	// It does not independently prove a particular premises caused the outbreak.
	EvidenceReportedFoodborneEtiology SignalEvidenceType = "reported-foodborne-etiology"
	// EvidenceReportedFoodborneVehicleAttribution reports an implicated food,
	// ingredient, preparation or setting with its attribution posture. Similar
	// names, cuisine, geography or dates cannot create an exact relation.
	EvidenceReportedFoodborneVehicleAttribution SignalEvidenceType = "reported-foodborne-vehicle-attribution"
	// EvidenceReportedFoodSafetyAggregate reports an exact numerator, denominator,
	// population, suppression rule and period. Establishments, inspections,
	// violations, outbreaks, illnesses, known outcomes and people are distinct.
	EvidenceReportedFoodSafetyAggregate SignalEvidenceType = "reported-food-safety-aggregate"
	// EvidencePublishedTransitNetworkSchedule reports one exact agency/operator,
	// network, mode, schedule feed revision, service calendar, route, stop and trip
	// population. A timetable is planned service, not proof a trip operated.
	EvidencePublishedTransitNetworkSchedule SignalEvidenceType = "published-transit-network-schedule"
	// EvidencePublishedTransitRouteStopTopology reports an exact line/route,
	// direction/pattern, station/stop/platform/entrance/pathway relation. Similar
	// names or coordinates cannot create an exact cross-feed identity.
	EvidencePublishedTransitRouteStopTopology SignalEvidenceType = "published-transit-route-stop-topology"
	// EvidencePublishedTransitAccessibilityTopology reports static wheelchair,
	// pathway, facility, boarding and assistance properties for an exact revision.
	// It is not proof a complete journey is accessible at the current moment.
	EvidencePublishedTransitAccessibilityTopology SignalEvidenceType = "published-transit-accessibility-topology"
	// EvidenceReportedTransitPrediction reports an arrival/departure estimate with
	// exact issue time, target event, time posture and freshness. A prediction is
	// not an observed arrival, departure, delay impact or fulfilled service.
	EvidenceReportedTransitPrediction SignalEvidenceType = "reported-transit-prediction"
	// EvidenceReportedTransitVehiclePosition reports a source-provided vehicle
	// position/progress and timestamp under a precision policy. Absence, staleness
	// or map position alone does not establish cancellation, occupancy or delay.
	EvidenceReportedTransitVehiclePosition SignalEvidenceType = "reported-transit-vehicle-position"
	// EvidenceReportedTransitStopEvent reports a source-declared actual arrival,
	// departure, pass or stop event with exact trip, stop, sequence and service day.
	// It remains distinct from predicted and interpolated times.
	EvidenceReportedTransitStopEvent SignalEvidenceType = "reported-transit-stop-event"
	// EvidencePublishedTransitServiceAlert reports an issuer-authored alert,
	// active period, informed entity, cause/effect posture and message revision. It
	// does not independently measure actual impact, cause or restoration.
	EvidencePublishedTransitServiceAlert SignalEvidenceType = "published-transit-service-alert"
	// EvidenceReportedTransitDisruption reports an exact incident, disruption,
	// planned work or service change from its operational authority. Publisher
	// status does not prove every trip or rider experienced the stated impact.
	EvidenceReportedTransitDisruption SignalEvidenceType = "reported-transit-disruption"
	// EvidenceReportedTransitCancellationOrSkippedStop reports source-declared
	// cancelled/added/modified trips or skipped/moved stops. Missing realtime or a
	// missing vehicle entity is not sufficient evidence of cancellation.
	EvidenceReportedTransitCancellationOrSkippedStop SignalEvidenceType = "reported-transit-cancellation-or-skipped-stop"
	// EvidenceReportedTransitFacilityStatus reports an exact facility outage,
	// limited status or restoration and its owner/reporter. One lift outage does
	// not automatically make a station or journey inaccessible, and restoration
	// does not prove all accessible paths are available.
	EvidenceReportedTransitFacilityStatus SignalEvidenceType = "reported-transit-facility-status"
	// EvidencePublishedTransitPerformanceDefinition reports an exact metric
	// population, numerator, denominator, threshold, exclusions, grouping,
	// service-day and methodology revision. Same labels are not comparable by name.
	EvidencePublishedTransitPerformanceDefinition SignalEvidenceType = "published-transit-performance-definition"
	// EvidenceReportedTransitPerformanceAggregate reports an exact period,
	// numerator, denominator, value, completeness and revision. Trips, stop events,
	// headways, passenger journeys, incidents and facility-hours are distinct.
	EvidenceReportedTransitPerformanceAggregate SignalEvidenceType = "reported-transit-performance-aggregate"
	// EvidencePublishedRoadSafetyPopulationDefinition reports the exact inclusion
	// boundary for a crash system: jurisdiction, road/trafficway, reporting source,
	// injury or fatality threshold, time window and release vintage. A fatal-crash
	// census, police-reported injury registry and probability sample are distinct.
	EvidencePublishedRoadSafetyPopulationDefinition SignalEvidenceType = "published-road-safety-population-definition"
	// EvidencePublishedRoadSafetySchemaDefinition reports the codebook, table
	// grain, key relations, severity basis, coordinate system and schema revision.
	// A common column label does not establish cross-vintage comparability.
	EvidencePublishedRoadSafetySchemaDefinition SignalEvidenceType = "published-road-safety-schema-definition"
	// EvidenceReportedRoadSafetyCollision reports one publisher-recorded collision with
	// exact native identity, occurrence posture, location policy and release status.
	// It is not proof of legal fault, root cause, complete reporting or current risk.
	EvidenceReportedRoadSafetyCollision SignalEvidenceType = "reported-road-collision"
	// EvidenceReportedRoadSafetyTrafficUnit reports one vehicle or other traffic unit
	// involved in an exact collision. It does not prove operator identity, blame,
	// continuous movement, ownership or exposure outside the recorded event.
	EvidenceReportedRoadSafetyTrafficUnit SignalEvidenceType = "reported-road-traffic-unit"
	// EvidenceReportedRoadSafetyCasualty reports a source-classified injured or killed
	// road user with an exact severity definition and revision. Police severity,
	// injury-based severity, hospital linkage and death-window outcomes differ.
	EvidenceReportedRoadSafetyCasualty SignalEvidenceType = "reported-road-casualty"
	// EvidenceReportedRoadSafetyInjuryOutcome reports an exact publisher-linked medical,
	// hospitalization or death outcome under a stated linkage and privacy policy.
	// It must not expose identity or be silently inferred from crash severity.
	EvidenceReportedRoadSafetyInjuryOutcome SignalEvidenceType = "reported-road-injury-outcome"
	// EvidenceReportedRoadSafetyFactor reports a coded factor or circumstance with
	// its reporter, scope and assertion posture. It is not independently confirmed
	// causation, negligence, legal liability or a complete account of the event.
	EvidenceReportedRoadSafetyFactor SignalEvidenceType = "reported-road-safety-factor"
	// EvidencePublishedRoadSafetyReleaseStatus reports provisional, annual, final,
	// corrected or withdrawn standing for an exact dataset vintage. A newer release
	// must not overwrite the evidence or meaning of an earlier release.
	EvidencePublishedRoadSafetyReleaseStatus SignalEvidenceType = "published-road-safety-release-status"
	// EvidencePublishedRoadSafetyRevision reports a schema, code, record or release
	// correction with exact predecessor/successor lineage and affected scope.
	EvidencePublishedRoadSafetyRevision SignalEvidenceType = "published-road-safety-revision"
	// EvidencePublishedRoadSafetyExposureDefinition reports the population and unit
	// behind a denominator such as vehicle-distance, trips, people or road length.
	// Counts without a compatible exposure denominator are not comparative risk.
	EvidencePublishedRoadSafetyExposureDefinition SignalEvidenceType = "published-road-safety-exposure-definition"
	// EvidenceReportedRoadSafetyAggregate reports an exact period, geography,
	// population, numerator, denominator, suppression and methodology revision.
	// Similar labels or percentages do not make jurisdictions comparable.
	EvidenceReportedRoadSafetyAggregate SignalEvidenceType = "reported-road-safety-aggregate"
	// EvidenceReportedRoadSafetyHazard reports an authority-published active road hazard,
	// incident or work-zone event with a validity window. It is not a historical
	// crash record, verified collision outcome, causal factor or future risk score.
	EvidenceReportedRoadSafetyHazard SignalEvidenceType = "reported-road-hazard"
	// EvidencePublishedConsumerPriceProgramDefinition reports the exact price
	// program, target population, territory, basket scope and methodology revision.
	// CPI, HICP, household-cost and average-price programs are not interchangeable.
	EvidencePublishedConsumerPriceProgramDefinition SignalEvidenceType = "published-consumer-price-program-definition"
	// EvidencePublishedConsumerPriceClassificationDefinition reports the exact item
	// hierarchy, code list and valid period. Similar labels across COICOP/ECOICOP,
	// provider item trees or historical vintages do not establish equivalence.
	EvidencePublishedConsumerPriceClassificationDefinition SignalEvidenceType = "published-consumer-price-classification-definition"
	// EvidenceReportedConsumerPriceQuote reports one source-published price quote
	// under an exact item, outlet/channel, quantity, currency, tax, discount and time
	// posture. It is not an index, representative market price or stock observation.
	EvidenceReportedConsumerPriceQuote SignalEvidenceType = "reported-consumer-price-quote"
	// EvidenceReportedConsumerAveragePrice reports a source-produced price-level
	// estimate with its population, weighting, package normalization and coverage.
	// It must not be used as a pure price-change index without separate evidence.
	EvidenceReportedConsumerAveragePrice SignalEvidenceType = "reported-consumer-average-price"
	// EvidencePublishedConsumerPriceBasketWeight reports an expenditure or other
	// published weight under exact price, quantity and weight reference periods.
	// A weight is not a purchase count, quantity demanded or household burden.
	EvidencePublishedConsumerPriceBasketWeight SignalEvidenceType = "published-consumer-price-basket-weight"
	// EvidencePublishedConsumerPriceIndexDefinition reports the exact index family,
	// formula, reference period, link policy, seasonal treatment and revision scope.
	// Re-referencing an index changes its scale, not the measured price movement.
	EvidencePublishedConsumerPriceIndexDefinition SignalEvidenceType = "published-consumer-price-index-definition"
	// EvidenceReportedConsumerPriceIndexObservation reports one published index,
	// rate, contribution or change observation under an exact measure and period.
	// Index points, monthly change and annual change are distinct observations.
	EvidenceReportedConsumerPriceIndexObservation SignalEvidenceType = "reported-consumer-price-index-observation"
	// EvidencePublishedConsumerPriceAdjustment reports a source-declared quality,
	// replacement, imputation, seasonal, tax or package-size treatment. It does not
	// prove the counterfactual price or that the product was available in inventory.
	EvidencePublishedConsumerPriceAdjustment SignalEvidenceType = "published-consumer-price-adjustment"
	// EvidenceReportedConsumerPriceAvailabilityPosture reports only an exact
	// publisher-defined availability, missing-quote or publication posture. Missing,
	// imputed or suppressed prices must not be promoted to stock availability.
	EvidenceReportedConsumerPriceAvailabilityPosture SignalEvidenceType = "reported-consumer-price-availability-posture"
	// EvidencePublishedConsumerPriceReleaseRevision reports preliminary, revised,
	// corrected, rebased, backcast, superseded or final lineage for one exact product.
	// A current value must not silently overwrite the earlier evidence vintage.
	EvidencePublishedConsumerPriceReleaseRevision SignalEvidenceType = "published-consumer-price-release-revision"
	// EvidencePublishedConsumerAffordabilityDenominator reports an exact income,
	// earnings or expenditure denominator with compatible population, unit and period.
	// A consumer price index alone is not evidence of household affordability.
	EvidencePublishedConsumerAffordabilityDenominator SignalEvidenceType = "published-consumer-affordability-denominator"
	// EvidenceReportedConsumerAffordabilityAggregate reports a source-published or
	// governed derived burden measure with exact numerator, denominator, household
	// type, method and uncertainty. It is not evidence about an individual household.
	EvidenceReportedConsumerAffordabilityAggregate SignalEvidenceType = "reported-consumer-affordability-aggregate"
	// EvidencePublishedRentalHousingProgramDefinition reports the exact survey,
	// administrative-statistics or rental-index program and its target population.
	// ACS, PIPR, EU-SILC and RMS do not become one population because they report rent.
	EvidencePublishedRentalHousingProgramDefinition SignalEvidenceType = "published-rental-housing-program-definition"
	// EvidencePublishedRentalHousingPopulationDefinition reports the exact dwelling,
	// unit, household or person population, inclusion rules and reference period.
	// A renter household, rental unit and person living in that household are distinct.
	EvidencePublishedRentalHousingPopulationDefinition SignalEvidenceType = "published-rental-housing-population-definition"
	// EvidencePublishedRentalHousingTenureDefinition reports the source's market,
	// subsidised, free, owner or provider-defined tenure classification and validity.
	// Similar labels do not establish comparable tenure populations across members.
	EvidencePublishedRentalHousingTenureDefinition SignalEvidenceType = "published-rental-housing-tenure-definition"
	// EvidenceReportedRentalHousingRentLevel reports a source-produced advertised,
	// achieved, contract, gross, occupied, vacant or modelled rent estimate under an
	// exact population, unit, period and method. It is not automatically a listing.
	EvidenceReportedRentalHousingRentLevel SignalEvidenceType = "reported-rental-housing-rent-level"
	// EvidencePublishedRentalHousingPriceIndexDefinition reports an exact rental price
	// index formula, basket/model, reference period, weighting and revision policy.
	// A rent level and a rental price index are not interchangeable.
	EvidencePublishedRentalHousingPriceIndexDefinition SignalEvidenceType = "published-rental-housing-price-index-definition"
	// EvidenceReportedRentalHousingPriceIndexObservation reports an index point or
	// rate of change under an exact measure and period. Index points, levels and rates
	// remain separate even when a publisher releases them in the same workbook.
	EvidenceReportedRentalHousingPriceIndexObservation SignalEvidenceType = "reported-rental-housing-price-index-observation"
	// EvidenceReportedRentalHousingVacancyAvailability reports a source-defined rental
	// vacancy, immediate-availability or available-unit estimate and its denominator.
	// It is not a listing count, future supply, homelessness or individual availability.
	EvidenceReportedRentalHousingVacancyAvailability SignalEvidenceType = "reported-rental-housing-vacancy-availability"
	// EvidenceReportedRentalHousingTurnover reports a source-defined tenancy or unit
	// turnover estimate under an exact window and repeat-count policy. It is not churn,
	// displacement, a unique-household count or a completed new lease by default.
	EvidenceReportedRentalHousingTurnover SignalEvidenceType = "reported-rental-housing-turnover"
	// EvidencePublishedRentalHousingUniverse reports a source-published rental stock,
	// sampled universe or eligible-unit denominator. It does not prove occupied demand,
	// construction completion, current listing supply or population coverage outside scope.
	EvidencePublishedRentalHousingUniverse SignalEvidenceType = "published-rental-housing-universe"
	// EvidencePublishedHousingCostBurdenDefinition reports exact housing-cost components,
	// allowance treatment, income denominator, threshold and household/person population.
	// A rent-to-income quotient invented across incompatible sources is not this evidence.
	EvidencePublishedHousingCostBurdenDefinition SignalEvidenceType = "published-housing-cost-burden-definition"
	// EvidenceReportedHousingCostBurdenAggregate reports a published burden share,
	// distribution or ratio with exact numerator, denominator, estimate unit and uncertainty.
	// It is not evidence that a particular household is burdened or in housing need.
	EvidenceReportedHousingCostBurdenAggregate SignalEvidenceType = "reported-housing-cost-burden-aggregate"
	// EvidencePublishedRentalHousingEstimateQuality reports margin of error, standard
	// error, coefficient of variation, significance, suppression or model-quality posture.
	// Suppression and low reliability are not zero observations.
	EvidencePublishedRentalHousingEstimateQuality SignalEvidenceType = "published-rental-housing-estimate-quality"
	// EvidencePublishedRentalHousingReleaseRevision reports preliminary, current,
	// corrected, revised, superseded or method-break lineage for one exact product.
	// A newer edition must not silently overwrite the earlier evidence vintage.
	EvidencePublishedRentalHousingReleaseRevision SignalEvidenceType = "published-rental-housing-release-revision"
	// EvidencePublishedLaborDemandProgramDefinition reports the exact employer,
	// establishment or post survey and its target population. JOLTS, the ONS
	// Vacancy Survey, Eurostat JVS and StatCan JVWS are not one population.
	EvidencePublishedLaborDemandProgramDefinition SignalEvidenceType = "published-labor-demand-program-definition"
	// EvidencePublishedLaborDemandPopulationDefinition reports the statistical
	// unit, sampling frame, included sectors, establishment-size threshold and
	// filled/vacant post universe. A post, job, employee and person are distinct.
	EvidencePublishedLaborDemandPopulationDefinition SignalEvidenceType = "published-labor-demand-population-definition"
	// EvidencePublishedLaborVacancyDefinition reports the exact paid-position,
	// work-availability, external-recruitment, reference-date and intended-fill
	// rules. A published job advert is not automatically a statistical vacancy.
	EvidencePublishedLaborVacancyDefinition SignalEvidenceType = "published-labor-vacancy-definition"
	// EvidenceReportedLaborVacancyStock reports a source-estimated stock or
	// source-defined multi-month distinct-position count. It is not a posting,
	// unique employer, hire, unfilled duration or person-level opportunity.
	EvidenceReportedLaborVacancyStock SignalEvidenceType = "reported-labor-vacancy-stock"
	// EvidenceReportedLaborOccupiedEmploymentStock reports the exact occupied-post,
	// payroll-employment or employee-job denominator produced by the source. These
	// concepts must not be substituted merely because each counts filled work.
	EvidenceReportedLaborOccupiedEmploymentStock SignalEvidenceType = "reported-labor-occupied-employment-stock"
	// EvidencePublishedLaborDemandRateDefinition reports an exact numerator,
	// denominator, scale, adjustment and time basis for a vacancy or turnover rate.
	// A percentage, percentage-point change and vacancies-per-100-jobs ratio differ.
	EvidencePublishedLaborDemandRateDefinition SignalEvidenceType = "published-labor-demand-rate-definition"
	// EvidenceReportedLaborDemandRate reports one source-produced vacancy/opening,
	// hire or separation rate with its exact definition and period. It is not a
	// portable cross-member score until the denominator and timing are compatible.
	EvidenceReportedLaborDemandRate SignalEvidenceType = "reported-labor-demand-rate"
	// EvidenceReportedLaborHireFlow reports additions to payroll during an exact
	// window under source inclusion and exclusion rules. It is not vacancy filling,
	// net employment growth, a unique-person count or a successful posting outcome.
	EvidenceReportedLaborHireFlow SignalEvidenceType = "reported-labor-hire-flow"
	// EvidenceReportedLaborSeparationFlow reports source-defined quits, layoffs and
	// discharges, other separations or total separations during an exact window. It
	// is not churn, dissatisfaction, redundancy, firing or causal employer distress.
	EvidenceReportedLaborSeparationFlow SignalEvidenceType = "reported-labor-separation-flow"
	// EvidenceReportedLaborOfferedCompensation reports a source-defined offered wage
	// aggregate and its component and conversion rules. Offered or lower-bound wage
	// is not actual pay, accepted compensation, labour cost or household income.
	EvidenceReportedLaborOfferedCompensation SignalEvidenceType = "reported-labor-offered-compensation"
	// EvidenceReportedLaborRecruitmentCharacteristic reports a source-produced
	// occupation, duration, education, experience, position-type or recruitment-
	// strategy aggregate. It is not an individual vacancy or verified skill shortage.
	EvidenceReportedLaborRecruitmentCharacteristic SignalEvidenceType = "reported-labor-recruitment-characteristic"
	// EvidencePublishedLaborDemandEstimateQuality reports standard error, coefficient
	// of variation, confidence, response, imputation, suppression or significance.
	// Low reliability, suppression and non-significance are not zero observations.
	EvidencePublishedLaborDemandEstimateQuality SignalEvidenceType = "published-labor-demand-estimate-quality"
	// EvidencePublishedLaborDemandAdjustmentMethod reports weighting, calibration,
	// alignment, benchmarking, imputation, modelling, moving-average or seasonal-
	// adjustment rules. Adjusted and unadjusted observations are distinct products.
	EvidencePublishedLaborDemandAdjustmentMethod SignalEvidenceType = "published-labor-demand-adjustment-method"
	// EvidencePublishedLaborDemandReleaseRevision reports preliminary, flash, final,
	// corrected, benchmarked, reclassified, method-break or superseded lineage. A
	// current table must not silently overwrite an earlier evidence vintage.
	EvidencePublishedLaborDemandReleaseRevision SignalEvidenceType = "published-labor-demand-release-revision"
	// EvidencePublishedBusinessDemographyProgramDefinition reports the exact
	// administrative/statistical program, source registers and target population.
	// BFS, BDS, ONS/Eurostat business demography and StatCan MBOC are not one
	// interchangeable business population merely because each publishes counts.
	EvidencePublishedBusinessDemographyProgramDefinition SignalEvidenceType = "published-business-demography-program-definition"
	// EvidencePublishedBusinessDemographyPopulationDefinition reports the exact
	// application, legal-unit, enterprise, firm, establishment, employer-business
	// or payroll-remitter universe. These units must not be joined by label alone.
	EvidencePublishedBusinessDemographyPopulationDefinition SignalEvidenceType = "published-business-demography-population-definition"
	// EvidencePublishedBusinessLifecycleDefinition reports a source-defined
	// application, formation, birth, opening, closure, death, exit, reopening,
	// survival, first-employee or high-growth rule. Registration is not birth,
	// closure is not permanent exit and an application is not an operating firm.
	EvidencePublishedBusinessLifecycleDefinition SignalEvidenceType = "published-business-lifecycle-definition"
	// EvidenceReportedBusinessApplicationAggregate reports a source-defined count
	// of tax-ID, corporation, high-propensity or planned-wage applications. It is
	// not an enterprise birth, employer startup, operating business or unique owner.
	EvidenceReportedBusinessApplicationAggregate SignalEvidenceType = "reported-business-application-aggregate"
	// EvidenceReportedBusinessActivePopulation reports an active, continuing,
	// registered, employer or payroll-remitting business stock under exact activity
	// and reference-period rules. It is not the total legal or informal economy.
	EvidenceReportedBusinessActivePopulation SignalEvidenceType = "reported-business-active-population"
	// EvidenceReportedBusinessBirthFormationOpening reports a source-defined birth,
	// first payroll, employer formation, startup, opening, entrant or first-employee
	// aggregate. These events remain distinct and do not prove product-market fit.
	EvidenceReportedBusinessBirthFormationOpening SignalEvidenceType = "reported-business-birth-formation-opening"
	// EvidenceReportedBusinessDeathClosureExit reports a source-defined death,
	// closing, shutdown, no-employee transition or permanent exit. It is not legal
	// dissolution, bankruptcy, failure cause or an identified firm's current state.
	EvidenceReportedBusinessDeathClosureExit SignalEvidenceType = "reported-business-death-closure-exit"
	// EvidenceReportedBusinessReopeningTemporaryClosure reports a source-defined
	// reopening or temporary/extended closure under an exact look-back and model.
	// It must not be collapsed into a new entrant, permanent exit or continuous firm.
	EvidenceReportedBusinessReopeningTemporaryClosure SignalEvidenceType = "reported-business-reopening-temporary-closure"
	// EvidencePublishedBusinessDemographyRateDefinition reports an exact numerator,
	// denominator, scale, event window and population for a birth, death, opening,
	// closure, churn, survival or high-growth rate.
	EvidencePublishedBusinessDemographyRateDefinition SignalEvidenceType = "published-business-demography-rate-definition"
	// EvidenceReportedBusinessDemographyRate reports one source-produced rate with
	// its exact definition. It is not portable across application, enterprise,
	// employer or establishment populations without a comparability decision.
	EvidenceReportedBusinessDemographyRate SignalEvidenceType = "reported-business-demography-rate"
	// EvidenceReportedBusinessSurvivalCohort reports survival for an exact birth or
	// employer-birth cohort, age horizon and activity test. It is not current firm
	// health, owner persistence or a forecast for any identified business.
	EvidenceReportedBusinessSurvivalCohort SignalEvidenceType = "reported-business-survival-cohort"
	// EvidenceReportedBusinessHighGrowthAggregate reports a source-defined high-
	// growth or young-high-growth population with its starting-size threshold,
	// growth variable, horizon and denominator. It is not startup success or revenue.
	EvidenceReportedBusinessHighGrowthAggregate SignalEvidenceType = "reported-business-high-growth-aggregate"
	// EvidenceReportedBusinessEmploymentDynamics reports source-defined employment,
	// job-creation or job-destruction aggregates attached to business lifecycle
	// populations. It is not hires, separations, vacancies or unique workers.
	EvidenceReportedBusinessEmploymentDynamics SignalEvidenceType = "reported-business-employment-dynamics"
	// EvidencePublishedBusinessDemographyEstimateQuality reports disclosure noise,
	// suppression, provisional status, model uncertainty, comparability breaks or
	// other publisher quality posture. Missing and suppressed are not zero.
	EvidencePublishedBusinessDemographyEstimateQuality SignalEvidenceType = "published-business-demography-estimate-quality"
	// EvidencePublishedBusinessDemographyAdjustmentMethod reports seasonal
	// adjustment, projection/splicing, reactivation adjustment, exit modelling,
	// classification holding or disclosure treatment. Adjusted products are distinct.
	EvidencePublishedBusinessDemographyAdjustmentMethod SignalEvidenceType = "published-business-demography-adjustment-method"
	// EvidencePublishedBusinessDemographyReleaseRevision reports provisional,
	// corrected, revised, reclassified, final or superseded lineage. A current API,
	// workbook or cube must not silently replace a prior evidence vintage.
	EvidencePublishedBusinessDemographyReleaseRevision SignalEvidenceType = "published-business-demography-release-revision"
	// EvidencePublishedBusinessInsolvencyProgramDefinition reports the exact
	// court, statistical or administrative program and the legislation/product
	// boundary under which insolvency records are counted.
	EvidencePublishedBusinessInsolvencyProgramDefinition SignalEvidenceType = "published-business-insolvency-program-definition"
	// EvidencePublishedBusinessInsolvencyPopulationDefinition reports whether the
	// population is cases, debtors, registered companies, active businesses,
	// legal units, individual businesses or another source-defined universe.
	EvidencePublishedBusinessInsolvencyPopulationDefinition SignalEvidenceType = "published-business-insolvency-population-definition"
	// EvidencePublishedBusinessInsolvencyProceedingDefinition reports an exact
	// petition, filing, court order, declaration, liquidation, administration,
	// proposal, reorganisation, receivership, moratorium or plan definition.
	EvidencePublishedBusinessInsolvencyProceedingDefinition SignalEvidenceType = "published-business-insolvency-proceeding-definition"
	// EvidenceReportedBusinessInsolvencyFilingCommencement reports a source-defined
	// filing or commencement aggregate. A petition, order, declaration and
	// registered proceeding remain distinct and do not prove business cessation.
	EvidenceReportedBusinessInsolvencyFilingCommencement SignalEvidenceType = "reported-business-insolvency-filing-commencement"
	// EvidenceReportedBusinessInsolvencyLiquidation reports a source-defined
	// liquidation proceeding aggregate. It does not prove assets were realised,
	// creditors were paid, the business stopped trading or the entity dissolved.
	EvidenceReportedBusinessInsolvencyLiquidation SignalEvidenceType = "reported-business-insolvency-liquidation"
	// EvidenceReportedBusinessInsolvencyReorganizationRescue reports a formal
	// administration, proposal, arrangement, reorganisation or rescue-process
	// aggregate. It does not prove a plan was confirmed or the business survived.
	EvidenceReportedBusinessInsolvencyReorganizationRescue SignalEvidenceType = "reported-business-insolvency-reorganization-rescue"
	// EvidenceReportedBusinessInsolvencyReceivershipMoratorium reports a formal
	// receivership, moratorium or equivalent protection aggregate under the exact
	// jurisdictional definition. These procedures are not interchangeable.
	EvidenceReportedBusinessInsolvencyReceivershipMoratorium SignalEvidenceType = "reported-business-insolvency-receivership-moratorium"
	// EvidenceReportedBusinessInsolvencyCaseFlow reports filed, terminated or
	// pending case stock/flow under an exact court, chapter, period and counting
	// rule. A terminated case is not necessarily discharged, paid or successful.
	EvidenceReportedBusinessInsolvencyCaseFlow SignalEvidenceType = "reported-business-insolvency-case-flow"
	// EvidenceReportedBusinessInsolvencyOutcome reports a source-defined dismissal,
	// discharge, plan confirmation, closure or other formal outcome aggregate. It
	// does not establish commercial recovery, creditor recovery or causality.
	EvidenceReportedBusinessInsolvencyOutcome SignalEvidenceType = "reported-business-insolvency-outcome"
	// EvidencePublishedBusinessInsolvencyRateDefinition reports the exact
	// numerator, denominator, scale, population, event window and reference stock
	// for an insolvency, bankruptcy, liquidation or rescue-procedure rate.
	EvidencePublishedBusinessInsolvencyRateDefinition SignalEvidenceType = "published-business-insolvency-rate-definition"
	// EvidenceReportedBusinessInsolvencyRate reports one source-produced rate with
	// its exact definition. Registered-company, active-business and legal-unit
	// denominators cannot be compared or substituted by label alone.
	EvidenceReportedBusinessInsolvencyRate SignalEvidenceType = "reported-business-insolvency-rate"
	// EvidenceReportedBusinessInsolvencyFinancialAggregate reports published
	// aggregate declared asset, liability, claim or recovery amounts. Debtor-filed
	// values are claims, may be missing and do not prove valuation or payment.
	EvidenceReportedBusinessInsolvencyFinancialAggregate SignalEvidenceType = "reported-business-insolvency-financial-aggregate"
	// EvidencePublishedBusinessInsolvencyAdjustmentMethod reports seasonal
	// adjustment, matching, deduplication, migration, imputation, indexing,
	// confidentiality or other source transformation applied to observations.
	EvidencePublishedBusinessInsolvencyAdjustmentMethod SignalEvidenceType = "published-business-insolvency-adjustment-method"
	// EvidencePublishedBusinessInsolvencyEstimateQuality reports provisional
	// status, administrative lag, unmatched population, suppression, debtor-
	// supplied data, comparability breaks or other publisher quality posture.
	EvidencePublishedBusinessInsolvencyEstimateQuality SignalEvidenceType = "published-business-insolvency-estimate-quality"
	// EvidencePublishedBusinessInsolvencyReleaseRevision reports revised,
	// corrected, reclassified, seasonally re-estimated, migrated, final or
	// superseded lineage. A current table must not overwrite an earlier vintage.
	EvidencePublishedBusinessInsolvencyReleaseRevision SignalEvidenceType = "published-business-insolvency-release-revision"
	// EvidencePublishedBusinessCreditSurveyProgramDefinition reports the exact
	// lender survey, panel, frequency and standard-versus-ad-hoc question boundary.
	// A central-bank publication is not a census of businesses or loan contracts.
	EvidencePublishedBusinessCreditSurveyProgramDefinition SignalEvidenceType = "published-business-credit-survey-program-definition"
	// EvidencePublishedBusinessCreditPopulationDefinition reports the exact
	// respondent-institution, borrower-segment and loan-category population. A
	// weighted bank panel is not a count of applicants, firms, loans or approvals.
	EvidencePublishedBusinessCreditPopulationDefinition SignalEvidenceType = "published-business-credit-population-definition"
	// EvidencePublishedBusinessCreditQuestionDefinition reports the wording,
	// response scale, reference period and past/current/expected role of a survey
	// question. Similar chart labels do not make questions interchangeable.
	EvidencePublishedBusinessCreditQuestionDefinition SignalEvidenceType = "published-business-credit-question-definition"
	// EvidenceReportedBusinessCreditAvailabilityStandard reports a source-defined
	// change in credit availability or approval standards. It does not prove an
	// individual application was accepted, rejected or even submitted.
	EvidenceReportedBusinessCreditAvailabilityStandard SignalEvidenceType = "reported-business-credit-availability-standard"
	// EvidenceReportedBusinessCreditDemand reports lenders' aggregate assessment
	// of stronger or weaker demand under one question and borrower segment. It is
	// not loan applications, credit volume, investment or borrower-stated intent.
	EvidenceReportedBusinessCreditDemand SignalEvidenceType = "reported-business-credit-demand"
	// EvidenceReportedBusinessCreditPriceTerm reports a source-defined change in
	// spreads, fees, premiums or another price term. It is not the policy rate,
	// the contractual interest rate or the amount paid by an identified borrower.
	EvidenceReportedBusinessCreditPriceTerm SignalEvidenceType = "reported-business-credit-price-term"
	// EvidenceReportedBusinessCreditNonPriceTerm reports a source-defined change
	// in collateral, covenants, maturity, credit-line size or another non-price
	// condition. It is not a contractual term for any identified loan.
	EvidenceReportedBusinessCreditNonPriceTerm SignalEvidenceType = "reported-business-credit-non-price-term"
	// EvidenceReportedBusinessCreditApproval reports an exact survey measure about
	// approval likelihood, approval rate or willingness to lend. It remains a
	// respondent assessment and must not become an observed credit decision.
	EvidenceReportedBusinessCreditApproval SignalEvidenceType = "reported-business-credit-approval"
	// EvidenceReportedBusinessCreditPerformance reports a source-defined change
	// in defaults, losses given default, delinquency, charge-offs or credit quality.
	// Direction-of-change is not a default count, level or realised loss amount.
	EvidenceReportedBusinessCreditPerformance SignalEvidenceType = "reported-business-credit-performance"
	// EvidenceReportedBusinessCreditDriver reports respondents' assessment of a
	// factor contributing to supply, demand or terms. It is not a causal estimate
	// and does not prove the factor affected any particular firm or loan.
	EvidenceReportedBusinessCreditDriver SignalEvidenceType = "reported-business-credit-driver"
	// EvidenceReportedBusinessCreditExpectation reports a forward-looking survey
	// balance for an exact horizon. It is not a realised outturn, forecast produced
	// by the publisher or commitment by respondent institutions.
	EvidenceReportedBusinessCreditExpectation SignalEvidenceType = "reported-business-credit-expectation"
	// EvidenceReportedBusinessCreditHistoricalLevel reports a current standard or
	// condition relative to a source-defined historical range or benchmark. It is
	// not the same measure as quarter-on-quarter tightening or easing.
	EvidenceReportedBusinessCreditHistoricalLevel SignalEvidenceType = "reported-business-credit-historical-level"
	// EvidencePublishedBusinessCreditBalanceDefinition reports the response
	// scoring, sign convention, net-percentage, diffusion-index, balance-of-opinion
	// or qualitative band definition required to interpret an observation.
	EvidencePublishedBusinessCreditBalanceDefinition SignalEvidenceType = "published-business-credit-balance-definition"
	// EvidencePublishedBusinessCreditWeightingMethod reports respondent, market-
	// share, loan-stock, national-share or sample weighting. Unweighted and weighted
	// balances must not be compared as if they shared a denominator.
	EvidencePublishedBusinessCreditWeightingMethod SignalEvidenceType = "published-business-credit-weighting-method"
	// EvidencePublishedBusinessCreditResponseQuality reports panel coverage,
	// response count, nonresponse, not-applicable treatment, confidentiality,
	// special-question coverage or a method/sign break. Missing is not unchanged.
	EvidencePublishedBusinessCreditResponseQuality SignalEvidenceType = "published-business-credit-response-quality"
	// EvidencePublishedBusinessCreditReleaseRevision reports questionnaire,
	// series, methodology, backcast, corrected, revised or superseded lineage. A
	// current download must not silently replace an earlier survey vintage.
	EvidencePublishedBusinessCreditReleaseRevision SignalEvidenceType = "published-business-credit-release-revision"
	// EvidencePublishedBusinessConditionsProgramDefinition reports the exact
	// survey programme, cadence, core/rotating content and active, ending or
	// discontinued standing. A similarly named confidence series is not enough.
	EvidencePublishedBusinessConditionsProgramDefinition SignalEvidenceType = "published-business-conditions-program-definition"
	// EvidencePublishedBusinessConditionsPopulationDefinition reports the target
	// population, sampling frame, reporting/statistical unit, sector exclusions
	// and geography. Employer businesses, enterprises and establishments differ.
	EvidencePublishedBusinessConditionsPopulationDefinition SignalEvidenceType = "published-business-conditions-population-definition"
	// EvidencePublishedBusinessConditionsQuestionDefinition reports exact wording,
	// routing, response scale, reference window, horizon and questionnaire revision.
	// A recurring label cannot bridge a changed or suspended question by itself.
	EvidencePublishedBusinessConditionsQuestionDefinition SignalEvidenceType = "published-business-conditions-question-definition"
	// EvidencePublishedBusinessConditionsResponseScaleDefinition reports category,
	// intensity, multi-select, numeric, not-applicable and don't-know semantics.
	// Response shares, balances and diffusion indexes are not interchangeable.
	EvidencePublishedBusinessConditionsResponseScaleDefinition SignalEvidenceType = "published-business-conditions-response-scale-definition"
	// EvidenceReportedBusinessConditionsActivity reports source-defined current or
	// recent performance, revenue, turnover, sales, hours, employment or operating
	// status. It is a survey aggregate, not an audited realised business result.
	EvidenceReportedBusinessConditionsActivity SignalEvidenceType = "reported-business-conditions-activity"
	// EvidenceReportedBusinessConditionsDemand reports a business assessment of
	// demand, orders or order books. It is not lender-reported credit demand,
	// transaction volume, a customer request or an identified sales opportunity.
	EvidenceReportedBusinessConditionsDemand SignalEvidenceType = "reported-business-conditions-demand"
	// EvidenceReportedBusinessConditionsPriceCost reports source-defined input
	// costs, input/output prices or price expectations. It is not a price quote,
	// transaction, CPI observation, margin or verified cost ledger.
	EvidenceReportedBusinessConditionsPriceCost SignalEvidenceType = "reported-business-conditions-price-cost"
	// EvidenceReportedBusinessConditionsWorkforce reports source-defined staffing,
	// hiring difficulty, recruitment, hours or workforce expectations. It is not a
	// vacancy posting, filled job, hire, separation or person-level employment fact.
	EvidenceReportedBusinessConditionsWorkforce SignalEvidenceType = "reported-business-conditions-workforce"
	// EvidenceReportedBusinessConditionsSupplyChain reports a respondent assessment
	// of delays, inventory or input availability. It is not an observed shipment,
	// stock level, supplier event or independently verified disruption.
	EvidenceReportedBusinessConditionsSupplyChain SignalEvidenceType = "reported-business-conditions-supply-chain"
	// EvidenceReportedBusinessConditionsConstraint reports an exact selected or
	// most-challenging obstacle with its population and denominator. Selection does
	// not prove severity, causality, monetary loss or that no unselected issue exists.
	EvidenceReportedBusinessConditionsConstraint SignalEvidenceType = "reported-business-conditions-constraint"
	// EvidenceReportedBusinessConditionsResilienceLiquidity reports source-defined
	// operating resilience, cash/liquid-asset horizon or continuity assessment. It
	// is not insolvency, bank balance, verified runway or a credit decision.
	EvidenceReportedBusinessConditionsResilienceLiquidity SignalEvidenceType = "reported-business-conditions-resilience-liquidity"
	// EvidenceReportedBusinessConditionsConfidenceUncertainty reports an exact
	// optimism, uncertainty, confidence or sentiment response/indicator. It is not
	// a publisher forecast, causal risk score or promise by the respondent.
	EvidenceReportedBusinessConditionsConfidenceUncertainty SignalEvidenceType = "reported-business-conditions-confidence-uncertainty"
	// EvidenceReportedBusinessConditionsCapacityInvestment reports a source-defined
	// capacity-utilisation assessment or investment intention. It is not installed
	// capacity, capital expenditure, procurement, financing or completed investment.
	EvidenceReportedBusinessConditionsCapacityInvestment SignalEvidenceType = "reported-business-conditions-capacity-investment"
	// EvidenceReportedBusinessConditionsExpectation reports a respondent outlook
	// for an exact measure and horizon. It is not a realised outturn, official
	// forecast, commitment or comparable expectation without the same question.
	EvidenceReportedBusinessConditionsExpectation SignalEvidenceType = "reported-business-conditions-expectation"
	// EvidenceReportedBusinessConditionsPlannedAction reports a selected business
	// intention or adaptation. It does not establish that the action was approved,
	// funded, started, completed or caused by the reported condition.
	EvidenceReportedBusinessConditionsPlannedAction SignalEvidenceType = "reported-business-conditions-planned-action"
	// EvidencePublishedBusinessConditionsEstimateMethod reports weighting,
	// calibration, imputation, aggregation, seasonal adjustment, balance/index or
	// composite construction. Same numeric scale does not imply same estimator.
	EvidencePublishedBusinessConditionsEstimateMethod SignalEvidenceType = "published-business-conditions-estimate-method"
	// EvidencePublishedBusinessConditionsEstimateQuality reports response,
	// standard error, confidence interval, reliability grade, suppression,
	// experimental/development status, method break or coverage limitation.
	EvidencePublishedBusinessConditionsEstimateQuality SignalEvidenceType = "published-business-conditions-estimate-quality"
	// EvidencePublishedBusinessConditionsReleaseRevision reports corrected,
	// revised, back-cast, reweighted, superseded or schema/questionnaire lineage.
	// Current tables must not silently overwrite earlier estimates or definitions.
	EvidencePublishedBusinessConditionsReleaseRevision SignalEvidenceType = "published-business-conditions-release-revision"
	// EvidencePublishedBusinessConditionsProgramLifecycle reports the announced
	// continuation, transition, final collection, final release, termination or
	// archive state of a programme and each dissemination route independently.
	EvidencePublishedBusinessConditionsProgramLifecycle SignalEvidenceType = "published-business-conditions-program-lifecycle"
	// EvidencePublishedBusinessDigitalAdoptionProgramDefinition reports the exact
	// statistical programme, module cadence, target topic and lifecycle standing.
	// An available questionnaire, table or API route does not prove current results.
	EvidencePublishedBusinessDigitalAdoptionProgramDefinition SignalEvidenceType = "published-business-digital-adoption-program-definition"
	// EvidencePublishedBusinessDigitalAdoptionPopulationDefinition reports the
	// target population, frame, exclusions, enterprise/firm/reporting unit and
	// weighting scope. A percentage cannot travel across a different denominator.
	EvidencePublishedBusinessDigitalAdoptionPopulationDefinition SignalEvidenceType = "published-business-digital-adoption-population-definition"
	// EvidencePublishedBusinessDigitalTechnologyDefinition reports the exact
	// source taxonomy and revision for internet, software, cloud, AI, analytics,
	// IoT, robotics, security or skills. Similar labels are not interchangeable.
	EvidencePublishedBusinessDigitalTechnologyDefinition SignalEvidenceType = "published-business-digital-technology-definition"
	// EvidencePublishedBusinessDigitalAdoptionQuestionDefinition reports exact
	// wording, routing, response scale, reference period and questionnaire role.
	// A questionnaire-only question is not a published statistical observation.
	EvidencePublishedBusinessDigitalAdoptionQuestionDefinition SignalEvidenceType = "published-business-digital-adoption-question-definition"
	// EvidencePublishedBusinessDigitalAdoptionStageDefinition reports the source
	// distinction among applicability, testing, current use, intensity and plans.
	// The stages must not be collapsed into a single installed-or-adopted flag.
	EvidencePublishedBusinessDigitalAdoptionStageDefinition SignalEvidenceType = "published-business-digital-adoption-stage-definition"
	// EvidenceReportedBusinessDigitalConnectivity reports an aggregate business
	// internet-access, connection-type or speed response. It is not a verified
	// network inventory, service entitlement, outage or provider performance fact.
	EvidenceReportedBusinessDigitalConnectivity SignalEvidenceType = "reported-business-digital-connectivity"
	// EvidenceReportedBusinessDigitalPresence reports an aggregate website,
	// social-presence or related digital-presence response. It is not a discovered
	// property, verified account ownership, audience measure or active storefront.
	EvidenceReportedBusinessDigitalPresence SignalEvidenceType = "reported-business-digital-presence"
	// EvidenceReportedBusinessECommerceActivity reports a source-defined aggregate
	// online order, purchase, sales or turnover measure. An order is not necessarily
	// online payment, fulfilment, end-customer demand or transaction-system truth.
	EvidenceReportedBusinessECommerceActivity SignalEvidenceType = "reported-business-ecommerce-activity"
	// EvidenceReportedBusinessDigitalTechnologyUse reports respondent-declared use
	// of an exact technology category and stage. It is not installed inventory,
	// entitlement, verified deployment, successful implementation or value realised.
	EvidenceReportedBusinessDigitalTechnologyUse SignalEvidenceType = "reported-business-digital-technology-use"
	// EvidenceReportedBusinessDigitalTechnologyIntensity reports a source-defined
	// ordinal or share-based degree of use. It cannot be treated as adoption success,
	// maturity, capability, spend or a comparable value without the same scale.
	EvidenceReportedBusinessDigitalTechnologyIntensity SignalEvidenceType = "reported-business-digital-technology-intensity"
	// EvidenceReportedBusinessDigitalSkillWorkforce reports aggregate ICT-specialist,
	// employee-use, training, vacancy or workforce-impact responses. It is not a
	// person-level fact, verified headcount, hiring outcome or employment decision.
	EvidenceReportedBusinessDigitalSkillWorkforce SignalEvidenceType = "reported-business-digital-skill-workforce"
	// EvidenceReportedBusinessDigitalSecurityControl reports a respondent-declared
	// control, practice or policy. It does not prove implementation quality,
	// effectiveness, compliance, absence of vulnerability or security assurance.
	EvidenceReportedBusinessDigitalSecurityControl SignalEvidenceType = "reported-business-digital-security-control"
	// EvidenceReportedBusinessDigitalSecurityIncident reports a source-defined
	// aggregate incident or consequence response. It is not a verified breach,
	// vulnerability, legal finding, root cause or complete incident population.
	EvidenceReportedBusinessDigitalSecurityIncident SignalEvidenceType = "reported-business-digital-security-incident"
	// EvidenceReportedBusinessDigitalTechnologySpending reports an aggregate spend,
	// cost or turnover-related estimate under an exact unit and period. It is not
	// vendor-specific revenue, approved budget, procurement or cash payment.
	EvidenceReportedBusinessDigitalTechnologySpending SignalEvidenceType = "reported-business-digital-technology-spending"
	// EvidenceReportedBusinessDigitalAdoptionPurposeSource reports an exact stated
	// use purpose, source of expertise or internal/external implementation mode.
	// External help does not establish a contract, procurement or qualified lead.
	EvidenceReportedBusinessDigitalAdoptionPurposeSource SignalEvidenceType = "reported-business-digital-adoption-purpose-source"
	// EvidenceReportedBusinessDigitalAdoptionBarrier reports an exact source-defined
	// non-use reason or obstacle with its question and denominator. It does not prove
	// causality, severity, loss, willingness to pay or an addressable sales lead.
	EvidenceReportedBusinessDigitalAdoptionBarrier SignalEvidenceType = "reported-business-digital-adoption-barrier"
	// EvidenceReportedBusinessDigitalWorkforceBusinessImpact reports a declared
	// workforce or business impact under one technology and question revision. It is
	// not a verified employee event, causal effect, productivity gain or realised ROI.
	EvidenceReportedBusinessDigitalWorkforceBusinessImpact SignalEvidenceType = "reported-business-digital-workforce-business-impact"
	// EvidenceReportedBusinessDigitalPlannedAdoptionSupport reports an exact future
	// adoption, external-support, hiring or financing intention and horizon. It is not
	// a solicitation, application, approval, purchase, contract or completed action.
	EvidenceReportedBusinessDigitalPlannedAdoptionSupport SignalEvidenceType = "reported-business-digital-planned-adoption-support"
	// EvidencePublishedBusinessDigitalCompositeIndicator reports a publisher-defined
	// composite such as digital intensity with its component set and year. It must
	// not replace raw adoption facts or bridge changes in component composition.
	EvidencePublishedBusinessDigitalCompositeIndicator SignalEvidenceType = "published-business-digital-composite-indicator"
	// EvidencePublishedBusinessDigitalAdoptionEstimateMethod reports weighting,
	// expansion, ratio estimation, imputation, disclosure and aggregation rules.
	// Business, employee, turnover, count and monetary estimates remain distinct.
	EvidencePublishedBusinessDigitalAdoptionEstimateMethod SignalEvidenceType = "published-business-digital-adoption-estimate-method"
	// EvidencePublishedBusinessDigitalAdoptionEstimateQuality reports sample,
	// response, uncertainty, suppression, mode effect, method break or country
	// deviation. Missing, not asked and suppressed values are not zero adoption.
	EvidencePublishedBusinessDigitalAdoptionEstimateQuality SignalEvidenceType = "published-business-digital-adoption-estimate-quality"
	// EvidencePublishedBusinessDigitalAdoptionReleaseRevision reports questionnaire,
	// taxonomy, table, cube, schema, correction and supersession lineage. A current
	// download must not silently overwrite the definition used by an older estimate.
	EvidencePublishedBusinessDigitalAdoptionReleaseRevision SignalEvidenceType = "published-business-digital-adoption-release-revision"
	// EvidencePublishedBusinessDigitalAdoptionProgramLifecycle reports active,
	// transitioning, paused, discontinued or archived standing independently for
	// programme, questionnaire, results release and each dissemination route.
	EvidencePublishedBusinessDigitalAdoptionProgramLifecycle SignalEvidenceType = "published-business-digital-adoption-program-lifecycle"
	// EvidencePublishedBusinessInnovationProgramDefinition reports the exact
	// survey programme, cadence, Oslo Manual basis, module scope and lifecycle.
	// A questionnaire, report, table or route alone does not prove current data.
	EvidencePublishedBusinessInnovationProgramDefinition SignalEvidenceType = "published-business-innovation-program-definition"
	// EvidencePublishedBusinessInnovationPopulationDefinition reports the target
	// population, frame, enterprise/firm/business unit, size/revenue thresholds,
	// sector exclusions and denominator. Survey populations are not interchangeable.
	EvidencePublishedBusinessInnovationPopulationDefinition SignalEvidenceType = "published-business-innovation-population-definition"
	// EvidencePublishedBusinessInnovationDefinition reports the source definition
	// of innovation, product, business process, novelty and significant difference.
	// An invention, idea, R&D activity or technology purchase is not automatically an innovation.
	EvidencePublishedBusinessInnovationDefinition SignalEvidenceType = "published-business-innovation-definition"
	// EvidencePublishedBusinessInnovationQuestionDefinition reports exact wording,
	// routing, response scale, population, reference window and questionnaire revision.
	// A similarly titled series cannot bridge a changed question or denominator.
	EvidencePublishedBusinessInnovationQuestionDefinition SignalEvidenceType = "published-business-innovation-question-definition"
	// EvidencePublishedBusinessInnovationActivityStatusDefinition reports whether
	// activity introduced an innovation, was completed but not implemented, remains
	// ongoing, was abandoned/suspended, or did not occur. Those states must not collapse.
	EvidencePublishedBusinessInnovationActivityStatusDefinition SignalEvidenceType = "published-business-innovation-activity-status-definition"
	// EvidenceReportedBusinessProductInnovation reports respondent-declared new or
	// significantly improved goods/services made available to potential users. It is
	// not product success, adoption, sales growth, an invention or a customer request.
	EvidenceReportedBusinessProductInnovation SignalEvidenceType = "reported-business-product-innovation"
	// EvidenceReportedBusinessProcessInnovation reports respondent-declared new or
	// significantly improved processes brought into use. It is not verified deployment,
	// operating improvement, productivity gain, software installation or compliance.
	EvidenceReportedBusinessProcessInnovation SignalEvidenceType = "reported-business-process-innovation"
	// EvidenceReportedBusinessInnovationNovelty reports source-defined new-to-business,
	// new-to-market or other novelty. It does not prove first-in-world status, patentability,
	// technical originality, competitive advantage or commercial success.
	EvidenceReportedBusinessInnovationNovelty SignalEvidenceType = "reported-business-innovation-novelty"
	// EvidenceReportedBusinessInnovationActivity reports an exact introduced,
	// completed-not-implemented, ongoing, abandoned, suspended or other activity state.
	// Innovation-active does not mean the innovation was launched, successful or valuable.
	EvidenceReportedBusinessInnovationActivity SignalEvidenceType = "reported-business-innovation-activity"
	// EvidenceReportedBusinessInnovationExpenditure reports source-defined spending
	// on R&D, equipment, software, knowledge, training, design, market introduction or
	// other innovation activity. It is not an approved budget, procurement or payment.
	EvidenceReportedBusinessInnovationExpenditure SignalEvidenceType = "reported-business-innovation-expenditure"
	// EvidenceReportedBusinessInnovationTurnoverShare reports a source-defined share
	// of turnover/sales attributed to a product category under one period and method.
	// It is not incremental revenue, causal impact, profit, market size or vendor revenue.
	EvidenceReportedBusinessInnovationTurnoverShare SignalEvidenceType = "reported-business-innovation-turnover-share"
	// EvidenceReportedBusinessInnovationDeveloperSource reports whether innovation
	// was developed internally, jointly, by adaptation or externally. It is not ownership,
	// authorship, a supplier contract, procurement, technology transfer or qualified lead.
	EvidenceReportedBusinessInnovationDeveloperSource SignalEvidenceType = "reported-business-innovation-developer-source"
	// EvidenceReportedBusinessInnovationCooperation reports source-defined shared
	// responsibility for innovation or R&D with exact partner type and location. It is
	// not information use, outsourcing, a contract, payment, endorsement or outcome.
	EvidenceReportedBusinessInnovationCooperation SignalEvidenceType = "reported-business-innovation-cooperation"
	// EvidenceReportedBusinessInnovationInformationSource reports a declared source
	// and importance of information used for innovation. It does not prove cooperation,
	// reliance, licensing, purchase, influence, causality or ongoing relationship.
	EvidenceReportedBusinessInnovationInformationSource SignalEvidenceType = "reported-business-innovation-information-source"
	// EvidenceReportedBusinessInnovationObjectiveBenefit reports a respondent-stated
	// objective, expected result, realised-looking benefit or importance category. It is
	// not an independently measured causal effect, ROI, verified saving or market outcome.
	EvidenceReportedBusinessInnovationObjectiveBenefit SignalEvidenceType = "reported-business-innovation-objective-benefit"
	// EvidenceReportedBusinessInnovationBarrier reports an exact discouraging,
	// constraining or non-activity reason with question, population and denominator.
	// It is not proven cause, severity, loss, willingness to pay or an identified lead.
	EvidenceReportedBusinessInnovationBarrier SignalEvidenceType = "reported-business-innovation-barrier"
	// EvidenceReportedBusinessInnovationPublicSupport reports declared use or receipt
	// of a source-defined support programme. It is not eligibility, application, award,
	// obligation, payment, effectiveness, additionality or future funding availability.
	EvidenceReportedBusinessInnovationPublicSupport SignalEvidenceType = "reported-business-innovation-public-support"
	// EvidenceReportedBusinessInnovationProtection reports a declared protection
	// method, filing or use of an intellectual-property mechanism. It does not prove a
	// valid right, grant, ownership, enforceability, freedom to operate or commercial value.
	EvidenceReportedBusinessInnovationProtection SignalEvidenceType = "reported-business-innovation-protection"
	// EvidenceReportedBusinessInnovationEnvironmentalBenefit reports a respondent-
	// declared environmental contribution and source-defined extent. It is not verified
	// impact, avoided emissions, lifecycle assessment, compliance or causal attribution.
	EvidenceReportedBusinessInnovationEnvironmentalBenefit SignalEvidenceType = "reported-business-innovation-environmental-benefit"
	// EvidencePublishedBusinessInnovationEstimateMethod reports survey weights,
	// expansion, calibration, imputation, denominator and aggregation rules. Counts,
	// shares, money, turnover shares and importance scales remain different measures.
	EvidencePublishedBusinessInnovationEstimateMethod SignalEvidenceType = "published-business-innovation-estimate-method"
	// EvidencePublishedBusinessInnovationEstimateQuality reports sample, response,
	// standard error, confidence, imputation, suppression, method break, optional
	// coverage or country deviation. Missing and not asked are not zero innovation.
	EvidencePublishedBusinessInnovationEstimateQuality SignalEvidenceType = "published-business-innovation-estimate-quality"
	// EvidencePublishedBusinessInnovationReleaseRevision reports questionnaire,
	// definition, table, dataset, correction and supersession lineage. A latest report
	// must not silently replace the period, unit or definition of an earlier estimate.
	EvidencePublishedBusinessInnovationReleaseRevision SignalEvidenceType = "published-business-innovation-release-revision"
	// EvidencePublishedBusinessInnovationProgramLifecycle reports active, transitioning,
	// paused, discontinued or archived standing separately for programme, questionnaire,
	// results release and each machine/file distribution route.
	EvidencePublishedBusinessInnovationProgramLifecycle SignalEvidenceType = "published-business-innovation-program-lifecycle"
	// EvidencePublishedDigitalAccessProgramDefinition reports the exact survey
	// programme, sponsor, collector, cadence, target units and lifecycle. A proposed
	// questionnaire, report, table or data route does not by itself prove current results.
	EvidencePublishedDigitalAccessProgramDefinition SignalEvidenceType = "published-digital-access-program-definition"
	// EvidencePublishedDigitalAccessPopulationDefinition reports the household or
	// individual target population, age bounds, geography, exclusions and denominator.
	// Household access and individual use populations must never be interchanged.
	EvidencePublishedDigitalAccessPopulationDefinition SignalEvidenceType = "published-digital-access-population-definition"
	// EvidencePublishedDigitalAccessDefinition reports an exact access, use, user,
	// activity, barrier, concern or skill definition under one revision and time window.
	EvidencePublishedDigitalAccessDefinition SignalEvidenceType = "published-digital-access-definition"
	// EvidencePublishedDigitalAccessQuestionDefinition reports wording, routing,
	// response options, respondent/proxy role, reference window and questionnaire revision.
	EvidencePublishedDigitalAccessQuestionDefinition SignalEvidenceType = "published-digital-access-question-definition"
	// EvidenceReportedHouseholdDigitalAccess reports respondent-declared household
	// access to an exact connection, service or device. It is not availability, speed,
	// reliability, affordability, ownership, individual use or successful participation.
	EvidenceReportedHouseholdDigitalAccess SignalEvidenceType = "reported-household-digital-access"
	// EvidenceReportedIndividualInternetUse reports respondent-declared individual
	// use under an exact recency and location definition. It is not household access,
	// competence, benefit, satisfaction, identity or a verified telemetry event.
	EvidenceReportedIndividualInternetUse SignalEvidenceType = "reported-individual-internet-use"
	// EvidenceReportedDigitalDeviceAccessUse reports respondent-declared access to or
	// use of an exact device. Access, ownership, primary use and smartphone-only use
	// remain distinct and must retain household/person denominator and question routing.
	EvidenceReportedDigitalDeviceAccessUse SignalEvidenceType = "reported-digital-device-access-use"
	// EvidenceReportedDigitalNonUseBarrier reports an exact selected reason for no or
	// limited use. It is not proven cause, severity, willingness to pay, vulnerability,
	// product request, commercial lead or permission to target a demographic group.
	EvidenceReportedDigitalNonUseBarrier SignalEvidenceType = "reported-digital-non-use-barrier"
	// EvidenceReportedDigitalAffordabilityConstraint reports a source-defined cost or
	// affordability response. It is not an audited household budget, inability to pay,
	// willingness to pay, price elasticity, eligibility or product-market demand.
	EvidenceReportedDigitalAffordabilityConstraint SignalEvidenceType = "reported-digital-affordability-constraint"
	// EvidenceReportedDigitalReliabilityQualityConstraint reports a respondent-declared
	// connection or service experience. It is not a network measurement, outage fact,
	// SLA finding, provider fault, root cause or verified service-quality incident.
	EvidenceReportedDigitalReliabilityQualityConstraint SignalEvidenceType = "reported-digital-reliability-quality-constraint"
	// EvidenceReportedDigitalSkillActivity reports an exact self-reported activity used
	// as a skill proxy. It is not tested proficiency, confidence, employability, literacy,
	// qualification or permission to infer an individual's capability.
	EvidenceReportedDigitalSkillActivity SignalEvidenceType = "reported-digital-skill-activity"
	// EvidencePublishedDigitalSkillComposite reports a publisher-defined composite and
	// its activity components, eligibility population and algorithm. It must not replace
	// component facts or bridge changes in questionnaire or methodology.
	EvidencePublishedDigitalSkillComposite SignalEvidenceType = "published-digital-skill-composite"
	// EvidenceReportedDigitalCommunicationParticipation reports an exact declared
	// communication or social activity. It is not engagement quality, belonging,
	// relationship strength, benefit, harm or consent to identify participants.
	EvidenceReportedDigitalCommunicationParticipation SignalEvidenceType = "reported-digital-communication-participation"
	// EvidenceReportedDigitalCommerceActivity reports a source-defined online search,
	// order, purchase, banking or payment activity. It is not fulfilment, satisfaction,
	// merchant demand, spend, payment success, financial advice or purchase intent.
	EvidenceReportedDigitalCommerceActivity SignalEvidenceType = "reported-digital-commerce-activity"
	// EvidenceReportedDigitalGovernmentActivity reports a declared interaction with a
	// public body or service. It is not entitlement, application outcome, service quality,
	// administrative completion, legal status or consent to contact the respondent.
	EvidenceReportedDigitalGovernmentActivity SignalEvidenceType = "reported-digital-government-activity"
	// EvidenceReportedDigitalHealthActivity reports a declared health-related online
	// activity. It is not a diagnosis, health status, treatment, clinical outcome,
	// care quality or permission to retain sensitive health information.
	EvidenceReportedDigitalHealthActivity SignalEvidenceType = "reported-digital-health-activity"
	// EvidenceReportedDigitalWorkLearningActivity reports an exact work, education or
	// skill-learning activity. It is not employment status, productivity, qualification,
	// completion, educational outcome or verified demand from an employer or learner.
	EvidenceReportedDigitalWorkLearningActivity SignalEvidenceType = "reported-digital-work-learning-activity"
	// EvidenceReportedDigitalPrivacySecurityConcern reports a respondent-declared
	// concern, trust attitude or protective action. Concern is not a verified incident,
	// legal finding, technical vulnerability, breach, harm or provider responsibility.
	EvidenceReportedDigitalPrivacySecurityConcern SignalEvidenceType = "reported-digital-privacy-security-concern"
	// EvidenceReportedOnlineHarmIncident reports a source-defined self-reported event or
	// experience. It is not independently verified, attributable, legally adjudicated,
	// clinically assessed or safe to persist at respondent or natural-person level.
	EvidenceReportedOnlineHarmIncident SignalEvidenceType = "reported-online-harm-incident"
	// EvidenceReportedDigitalAssistanceAccessibilityConstraint reports declared need
	// for help, accessibility or usability constraint. It is not a disability diagnosis,
	// incapacity, dependence, individual vulnerability or consequential-decision input.
	EvidenceReportedDigitalAssistanceAccessibilityConstraint SignalEvidenceType = "reported-digital-assistance-accessibility-constraint"
	// EvidencePublishedDigitalAccessEstimateMethod reports weights, calibration,
	// replicate weights, imputation, denominator and aggregation rules. Household share,
	// individual share, user share, count and composite are not interchangeable.
	EvidencePublishedDigitalAccessEstimateMethod SignalEvidenceType = "published-digital-access-estimate-method"
	// EvidencePublishedDigitalAccessEstimateQuality reports sample, response, standard
	// error, confidence interval, suppression, mode effect and comparability breaks.
	// Missing, not asked, inapplicable and suppressed values are not zero.
	EvidencePublishedDigitalAccessEstimateQuality SignalEvidenceType = "published-digital-access-estimate-quality"
	// EvidencePublishedDigitalAccessReleaseRevision reports questionnaire, table,
	// dataset, schema, correction and supersession lineage. A latest resource must not
	// silently overwrite the definition or reference window of an older observation.
	EvidencePublishedDigitalAccessReleaseRevision SignalEvidenceType = "published-digital-access-release-revision"
	// EvidencePublishedDigitalAccessProgramLifecycle reports active, proposed,
	// transitioning, paused, discontinued or archived standing independently for the
	// programme, questionnaire, results release and each dissemination route.
	EvidencePublishedDigitalAccessProgramLifecycle SignalEvidenceType = "published-digital-access-program-lifecycle"
	// EvidencePublishedHouseholdExpenditureProgramDefinition reports the exact
	// survey programme, sponsor, collector, cadence, instruments and lifecycle.
	// A questionnaire, table, report or route alone does not prove current results.
	EvidencePublishedHouseholdExpenditureProgramDefinition SignalEvidenceType = "published-household-expenditure-program-definition"
	// EvidencePublishedHouseholdExpenditurePopulationDefinition reports the target
	// population, consumer-unit/household definition, reference person, geography,
	// exclusions and denominator. Those units are not interchangeable across members.
	EvidencePublishedHouseholdExpenditurePopulationDefinition SignalEvidenceType = "published-household-expenditure-population-definition"
	// EvidencePublishedHouseholdExpenditureDefinition reports the exact expenditure,
	// consumption, acquisition, payment, liability, imputation, inclusion and exclusion
	// rules. Expenditure is not automatically use, need, value, satisfaction or demand.
	EvidencePublishedHouseholdExpenditureDefinition SignalEvidenceType = "published-household-expenditure-definition"
	// EvidencePublishedHouseholdExpenditureClassificationDefinition reports the exact
	// CE/UCC, COICOP/ECOICOP, SHS or provider category revision and correspondence.
	// Similar category labels do not authorize a cross-revision or cross-country join.
	EvidencePublishedHouseholdExpenditureClassificationDefinition SignalEvidenceType = "published-household-expenditure-classification-definition"
	// EvidencePublishedHouseholdExpenditureInstrumentDefinition reports interview,
	// diary, administrative-linkage and integrated-estimate coverage, recall period,
	// respondent burden and overlap rule. Instrument estimates cannot silently merge.
	EvidencePublishedHouseholdExpenditureInstrumentDefinition SignalEvidenceType = "published-household-expenditure-instrument-definition"
	// EvidencePublishedHouseholdExpenditureQuestionDefinition reports wording,
	// routing, recall window, diary duration, response unit and questionnaire revision.
	EvidencePublishedHouseholdExpenditureQuestionDefinition SignalEvidenceType = "published-household-expenditure-question-definition"
	// EvidenceReportedHouseholdExpenditure reports a respondent-declared amount under
	// one category, instrument and period. It is not transaction telemetry, current
	// consumption, quantity, price, successful fulfilment, satisfaction or unmet need.
	EvidenceReportedHouseholdExpenditure SignalEvidenceType = "reported-household-expenditure"
	// EvidenceReportedHouseholdConsumptionExpenditure reports an amount classified by
	// the publisher as consumption expenditure. It is not national-accounts household
	// final consumption, product demand, welfare, living standard or service outcome.
	EvidenceReportedHouseholdConsumptionExpenditure SignalEvidenceType = "reported-household-consumption-expenditure"
	// EvidenceReportedHouseholdNonConsumptionDisbursement reports taxes, transfers,
	// savings, debt, asset or another source-defined non-consumption flow. It must not
	// be combined with consumption or treated as a product/service purchase.
	EvidenceReportedHouseholdNonConsumptionDisbursement SignalEvidenceType = "reported-household-non-consumption-disbursement"
	// EvidenceReportedHouseholdIncome reports source-defined before/after-tax or
	// disposable income used as a survey characteristic. It is not verified cash flow,
	// wealth, affordability, credit capacity, poverty status or consequential input.
	EvidenceReportedHouseholdIncome SignalEvidenceType = "reported-household-income"
	// EvidenceReportedHouseholdHousingServiceExpenditure reports source-defined rent,
	// owner cost, mortgage component, utilities or imputed housing service. Purchase of
	// an asset, interest, principal, net rent and imputed rent remain distinct.
	EvidenceReportedHouseholdHousingServiceExpenditure SignalEvidenceType = "reported-household-housing-service-expenditure"
	// EvidenceReportedHouseholdDurableGoodsAcquisition reports an acquisition amount
	// for a durable under an exact period. It is not current use, replacement need,
	// ownership inventory, product quality, financing status or future purchase intent.
	EvidenceReportedHouseholdDurableGoodsAcquisition SignalEvidenceType = "reported-household-durable-goods-acquisition"
	// EvidenceReportedHouseholdGiftInKindExpenditure reports a source-defined gift,
	// transfer or in-kind treatment. Given, received, reimbursed and third-party-paid
	// goods and services do not share expenditure or consumption authority.
	EvidenceReportedHouseholdGiftInKindExpenditure SignalEvidenceType = "reported-household-gift-in-kind-expenditure"
	// EvidencePublishedHouseholdExpenditureShare reports a category share under an
	// exact total and population. It is a budget-composition statistic, not market share,
	// quantity share, preference strength, priority, price sensitivity or satisfaction.
	EvidencePublishedHouseholdExpenditureShare SignalEvidenceType = "published-household-expenditure-share"
	// EvidencePublishedHouseholdExpenditureReportingPrevalence reports the percentage
	// of units reporting an item under the instrument window. It is not annual buyer
	// penetration, unique customers, ownership, regular use or need prevalence.
	EvidencePublishedHouseholdExpenditureReportingPrevalence SignalEvidenceType = "published-household-expenditure-reporting-prevalence"
	// EvidencePublishedHouseholdExpenditureAggregate reports a source-weighted total.
	// It is not the mean, national-accounts total, merchant revenue, market size or a
	// value that can be combined across currencies, populations or category revisions.
	EvidencePublishedHouseholdExpenditureAggregate SignalEvidenceType = "published-household-expenditure-aggregate"
	// EvidencePublishedHouseholdExpenditurePriceAdjusted reports a publisher-deflated,
	// constant-price or purchasing-power value with its price reference and method. It
	// does not decompose nominal change into price, quantity, quality or substitution.
	EvidencePublishedHouseholdExpenditurePriceAdjusted SignalEvidenceType = "published-household-expenditure-price-adjusted"
	// EvidencePublishedHouseholdExpenditureEquivalised reports a value adjusted by a
	// publisher equivalence scale. It is not per-capita spending, household welfare,
	// adequacy, disposable resources or an identified household constraint.
	EvidencePublishedHouseholdExpenditureEquivalised SignalEvidenceType = "published-household-expenditure-equivalised"
	// EvidencePublishedHouseholdExpenditureEstimateMethod reports integration,
	// annualisation, weighting, calibration, imputation, outlier and variance rules.
	// Interview, diary and integrated estimates retain separate source authority.
	EvidencePublishedHouseholdExpenditureEstimateMethod SignalEvidenceType = "published-household-expenditure-estimate-method"
	// EvidencePublishedHouseholdExpenditureEstimateQuality reports sample, response,
	// standard error, relative standard error, confidence, suppression and method break.
	// Zero, no purchase, missing, not collected and unreliable are different states.
	EvidencePublishedHouseholdExpenditureEstimateQuality SignalEvidenceType = "published-household-expenditure-estimate-quality"
	// EvidencePublishedHouseholdExpenditureReleaseRevision reports questionnaire,
	// classification, table, correction and supersession lineage. A latest workbook
	// must not silently overwrite the definition or uncertainty of an earlier estimate.
	EvidencePublishedHouseholdExpenditureReleaseRevision SignalEvidenceType = "published-household-expenditure-release-revision"
	// EvidencePublishedHouseholdExpenditureProgramLifecycle reports active,
	// transitioning, occasional, paused, discontinued or archived standing separately
	// for programme, instrument, results release and every distribution route.
	EvidencePublishedHouseholdExpenditureProgramLifecycle SignalEvidenceType = "published-household-expenditure-program-lifecycle"
	// EvidencePublishedTimeUseProgramDefinition reports the exact survey
	// programme, sponsor, collector, cadence, instruments and lifecycle. A live
	// questionnaire or old table alone does not prove a current published result.
	EvidencePublishedTimeUseProgramDefinition SignalEvidenceType = "published-time-use-program-definition"
	// EvidencePublishedTimeUsePopulationDefinition reports the target population,
	// respondent unit, geography, age floor, exclusions and diary-day denominator.
	// Household members, diary respondents and published populations do not merge.
	EvidencePublishedTimeUsePopulationDefinition SignalEvidenceType = "published-time-use-population-definition"
	// EvidencePublishedTimeUseActivityClassificationDefinition reports the exact
	// activity coding list, hierarchy, composite mapping and revision. Similar labels
	// do not authorize a join across ATUS, OTUS, HETUS or Statistics Canada codes.
	EvidencePublishedTimeUseActivityClassificationDefinition SignalEvidenceType = "published-time-use-activity-classification-definition"
	// EvidencePublishedTimeUseDiaryInstrumentDefinition reports diary boundaries,
	// slot or episode rules, assigned days, collection mode and simultaneous-activity
	// treatment. One diary day is not a usual week, annual routine or personal profile.
	EvidencePublishedTimeUseDiaryInstrumentDefinition SignalEvidenceType = "published-time-use-diary-instrument-definition"
	// EvidencePublishedTimeUseQuestionDefinition reports wording, routing, prompts,
	// context columns and revision. A question can be fielded without published results.
	EvidencePublishedTimeUseQuestionDefinition SignalEvidenceType = "published-time-use-question-definition"
	// EvidenceReportedPrimaryActivityTime reports respondent-declared time classified
	// as a main activity. It is not effort, intensity, productivity, preference, pain,
	// task completion, service quality or unmet need.
	EvidenceReportedPrimaryActivityTime SignalEvidenceType = "reported-primary-activity-time"
	// EvidenceReportedSecondaryActivityTime reports source-defined simultaneous,
	// secondary or supervisory time. It must not be added to primary time or compared
	// across instruments unless the activity-role and collection rule are compatible.
	EvidenceReportedSecondaryActivityTime SignalEvidenceType = "reported-secondary-activity-time"
	// EvidenceReportedTimeUseParticipation reports whether an activity occurred on the
	// diary day under an exact population and classification. Zero means no reported
	// occurrence in that diary window, not never, no use, no interest or no need.
	EvidenceReportedTimeUseParticipation SignalEvidenceType = "reported-time-use-participation"
	// EvidenceReportedPaidWorkTime reports classified paid-work time under a diary or
	// published estimate. It is not contractual hours, employment status, output,
	// productivity, compensation, job quality or employer demand.
	EvidenceReportedPaidWorkTime SignalEvidenceType = "reported-paid-work-time"
	// EvidenceReportedUnpaidHouseholdWorkTime reports source-classified domestic work.
	// Duration is not burden, willingness, obligation, quality or replaceable service demand.
	EvidenceReportedUnpaidHouseholdWorkTime SignalEvidenceType = "reported-unpaid-household-work-time"
	// EvidenceReportedCareTime reports source-defined primary, secondary, supervisory,
	// child or adult care time. Those roles remain separate and do not establish care
	// adequacy, recipient need, caregiver strain or a clinical/social-service outcome.
	EvidenceReportedCareTime SignalEvidenceType = "reported-care-time"
	// EvidenceReportedTravelTime reports source-classified travel duration and optional
	// mode or purpose. It is not trip count, distance, delay, reliability, accessibility,
	// commute quality or transport-service demand.
	EvidenceReportedTravelTime SignalEvidenceType = "reported-travel-time"
	// EvidenceReportedLearningTime reports source-classified education or learning time.
	// It is not enrolment, attainment, qualification, completion, learning outcome or need.
	EvidenceReportedLearningTime SignalEvidenceType = "reported-learning-time"
	// EvidenceReportedLeisureSocialTime reports source-classified leisure, social,
	// volunteering or civic time. A residual or category label is not unconstrained free
	// time, social connection quality, preference, wellbeing or service opportunity.
	EvidenceReportedLeisureSocialTime SignalEvidenceType = "reported-leisure-social-time"
	// EvidenceReportedMediaDigitalTime reports source-classified media, ICT or screen
	// activity. Classification and parallel-device rules are required; it is not verified
	// app usage, attention, engagement, exposure, satisfaction or digital dependence.
	EvidenceReportedMediaDigitalTime SignalEvidenceType = "reported-media-digital-time"
	// EvidenceReportedPersonalCareSleepTime reports source-classified sleep, rest,
	// eating or personal-care time. It is not sleep quality, health status, treatment,
	// functional ability, self-care adequacy or medical evidence.
	EvidenceReportedPersonalCareSleepTime SignalEvidenceType = "reported-personal-care-sleep-time"
	// EvidencePublishedTimeUsePopulationMean reports mean duration across every unit in
	// the stated population, including non-participants where defined. It must not be
	// substituted for a participant mean, typical individual day or universal routine.
	EvidencePublishedTimeUsePopulationMean SignalEvidenceType = "published-time-use-population-mean"
	// EvidencePublishedTimeUseParticipantMean reports mean duration only among diary-day
	// participants. It cannot be compared with a population mean without participation
	// prevalence and denominator, or treated as a usual duration for each participant.
	EvidencePublishedTimeUseParticipantMean SignalEvidenceType = "published-time-use-participant-mean"
	// EvidencePublishedTimeUseEpisodeCount reports a source-defined number of spells or
	// episodes. It is not duration, task count, trip count, interruption, switching cost,
	// completion, productivity or fragmentation without an explicit derivation method.
	EvidencePublishedTimeUseEpisodeCount SignalEvidenceType = "published-time-use-episode-count"
	// EvidencePublishedTimeUseTimeOfDayProfile reports participation or activity share
	// at exact slots in a weighted day. It is not an identified schedule, future
	// availability, habitual routine or permission to target people at that time.
	EvidencePublishedTimeUseTimeOfDayProfile SignalEvidenceType = "published-time-use-time-of-day-profile"
	// EvidencePublishedTimeUseEstimateMethod reports diary selection, weekday/weekend
	// allocation, weights, calibration, imputation, aggregation and variance rules.
	EvidencePublishedTimeUseEstimateMethod SignalEvidenceType = "published-time-use-estimate-method"
	// EvidencePublishedTimeUseEstimateQuality reports sample, response, confidence,
	// suppression, reliability, mode, season and comparability breaks. Missing,
	// not-collected, inapplicable, suppressed and zero remain different states.
	EvidencePublishedTimeUseEstimateQuality SignalEvidenceType = "published-time-use-estimate-quality"
	// EvidencePublishedTimeUseReleaseRevision reports questionnaire, classification,
	// table, dataset, schema, correction and supersession lineage. Latest-only services
	// must not erase the definition or uncertainty of an earlier estimate.
	EvidencePublishedTimeUseReleaseRevision SignalEvidenceType = "published-time-use-release-revision"
	// EvidencePublishedTimeUseProgramLifecycle reports active, experimental,
	// transitioning, occasional, paused, discontinued or archived standing separately
	// for programme, collection, results release, API, file and microdata routes.
	EvidencePublishedTimeUseProgramLifecycle SignalEvidenceType = "published-time-use-program-lifecycle"
	// EvidencePublishedHealthCareAccessProgramDefinition reports the exact survey
	// programme, sponsor, collector, cadence, health-system scope and lifecycle.
	EvidencePublishedHealthCareAccessProgramDefinition SignalEvidenceType = "published-health-care-access-program-definition"
	// EvidencePublishedHealthCareAccessPopulationDefinition reports target population,
	// age, geography, registration, exclusions, proxy rules and denominator.
	EvidencePublishedHealthCareAccessPopulationDefinition SignalEvidenceType = "published-health-care-access-population-definition"
	// EvidencePublishedHealthCareServiceDefinition reports the exact medical, dental,
	// primary, specialist, hospital, pharmacy or other service covered by a measure.
	EvidencePublishedHealthCareServiceDefinition SignalEvidenceType = "published-health-care-service-definition"
	// EvidencePublishedHealthCareAccessInstrumentDefinition reports questionnaire,
	// mode, proxy, routing, reference window and response eligibility.
	EvidencePublishedHealthCareAccessInstrumentDefinition SignalEvidenceType = "published-health-care-access-instrument-definition"
	// EvidencePublishedHealthCareAccessQuestionDefinition reports exact wording,
	// response options, main-versus-any-reason rule and question revision.
	EvidencePublishedHealthCareAccessQuestionDefinition SignalEvidenceType = "published-health-care-access-question-definition"
	// EvidenceReportedHealthCareNeed reports a person's source-defined self-assessment
	// that care was needed. It is not clinical necessity, diagnosis or eligibility.
	EvidenceReportedHealthCareNeed SignalEvidenceType = "reported-health-care-need"
	// EvidenceReportedHealthCareReceipt reports source-defined receipt or use of care.
	// It is not timely access, appropriate treatment, quality, benefit or outcome.
	EvidenceReportedHealthCareReceipt SignalEvidenceType = "reported-health-care-receipt"
	// EvidenceReportedHealthCareDelay reports care obtained or sought later than the
	// source-defined threshold. It is distinct from nonreceipt and official wait lists.
	EvidenceReportedHealthCareDelay SignalEvidenceType = "reported-health-care-delay"
	// EvidenceReportedHealthCareNonReceipt reports needed care not obtained or not
	// sought under exact wording. It does not establish provider denial or root cause.
	EvidenceReportedHealthCareNonReceipt SignalEvidenceType = "reported-health-care-nonreceipt"
	// EvidenceReportedHealthCareCostBarrier reports cost as a source-defined main or
	// contributing reason. It is not verified affordability, income or financial harm.
	EvidenceReportedHealthCareCostBarrier SignalEvidenceType = "reported-health-care-cost-barrier"
	// EvidenceReportedHealthCareWaitingBarrier reports a wait, waiting list or
	// respondent-unacceptable duration. Subjective and measured waits remain distinct.
	EvidenceReportedHealthCareWaitingBarrier SignalEvidenceType = "reported-health-care-waiting-barrier"
	// EvidenceReportedHealthCareDistanceTransportBarrier reports distance or transport
	// as a declared barrier. It is not route telemetry or transport causal attribution.
	EvidenceReportedHealthCareDistanceTransportBarrier SignalEvidenceType = "reported-health-care-distance-transport-barrier"
	// EvidenceReportedHealthCareAvailabilityAppointmentBarrier reports service
	// availability, opening, appointment or contact constraints under exact wording.
	EvidenceReportedHealthCareAvailabilityAppointmentBarrier SignalEvidenceType = "reported-health-care-availability-appointment-barrier"
	// EvidenceReportedHealthCareTimeCaregivingBarrier reports work, own time or caring
	// responsibility as a reason. It is not verified schedule capacity or employer cause.
	EvidenceReportedHealthCareTimeCaregivingBarrier SignalEvidenceType = "reported-health-care-time-caregiving-barrier"
	// EvidenceReportedHealthCarePreferenceInformationBarrier reports fear, waiting to
	// see, not knowing a provider or another source-coded reason without clinical judgment.
	EvidenceReportedHealthCarePreferenceInformationBarrier SignalEvidenceType = "reported-health-care-preference-information-barrier"
	// EvidenceReportedHealthCareContactExperience reports ability or experience when
	// contacting a service. Contact, appointment, attendance and treatment are distinct.
	EvidenceReportedHealthCareContactExperience SignalEvidenceType = "reported-health-care-contact-experience"
	// EvidenceReportedHealthCareContinuityExperience reports a usual or preferred
	// professional and whether that preference was met. It is not clinical continuity.
	EvidenceReportedHealthCareContinuityExperience SignalEvidenceType = "reported-health-care-continuity-experience"
	// EvidenceReportedHealthCareExperience reports a source-defined experience or
	// acceptability response. It is not objective service quality, safety or outcome.
	EvidenceReportedHealthCareExperience SignalEvidenceType = "reported-health-care-experience"
	// EvidencePublishedHealthCareNeedConditionalRate reports a statistic among people
	// who said they needed the service. It must not be used as a population prevalence.
	EvidencePublishedHealthCareNeedConditionalRate SignalEvidenceType = "published-health-care-need-conditional-rate"
	// EvidencePublishedHealthCarePopulationRate reports a statistic using the exact
	// total-population, registered-patient or survey-population denominator.
	EvidencePublishedHealthCarePopulationRate SignalEvidenceType = "published-health-care-population-rate"
	// EvidencePublishedHealthCareAccessEstimateMethod reports selection, weights,
	// calibration, imputation, routing, aggregation and variance rules.
	EvidencePublishedHealthCareAccessEstimateMethod SignalEvidenceType = "published-health-care-access-estimate-method"
	// EvidencePublishedHealthCareAccessEstimateQuality reports response, base, standard
	// error, margin, confidence, suppression and method/comparability breaks.
	EvidencePublishedHealthCareAccessEstimateQuality SignalEvidenceType = "published-health-care-access-estimate-quality"
	// EvidencePublishedHealthCareAccessReleaseRevision reports questionnaire, table,
	// CSV, dataset, correction, preliminary/final and supersession lineage.
	EvidencePublishedHealthCareAccessReleaseRevision SignalEvidenceType = "published-health-care-access-release-revision"
	// EvidencePublishedHealthCareAccessProgramLifecycle reports programme, collection,
	// results, interactive tool, file, API and microdata standing independently.
	EvidencePublishedHealthCareAccessProgramLifecycle SignalEvidenceType = "published-health-care-access-program-lifecycle"
	// EvidencePublishedHouseholdEnergyProgramDefinition reports the exact survey,
	// modelled-statistics or regulatory-reporting programme and its jurisdiction.
	EvidencePublishedHouseholdEnergyProgramDefinition SignalEvidenceType = "published-household-energy-program-definition"
	// EvidencePublishedHouseholdEnergyPopulationDefinition reports the exact housing-unit,
	// household, person, customer-account or hardship-account population and exclusions.
	EvidencePublishedHouseholdEnergyPopulationDefinition SignalEvidenceType = "published-household-energy-population-definition"
	// EvidencePublishedHouseholdEnergyServiceDefinition reports electricity, gas, bulk
	// fuel, heating, cooling or all-household-energy scope without treating them as equal.
	EvidencePublishedHouseholdEnergyServiceDefinition SignalEvidenceType = "published-household-energy-service-definition"
	// EvidencePublishedHouseholdEnergyInstrumentDefinition reports questionnaire,
	// model, retailer template, reporting schedule, routing and reference period.
	EvidencePublishedHouseholdEnergyInstrumentDefinition SignalEvidenceType = "published-household-energy-instrument-definition"
	// EvidencePublishedHouseholdEnergyIndicatorDefinition reports exact item, metric,
	// threshold, composite, amount role, event and denominator semantics.
	EvidencePublishedHouseholdEnergyIndicatorDefinition SignalEvidenceType = "published-household-energy-indicator-definition"
	// EvidenceReportedHouseholdEnergyInsecurity reports source-defined household energy
	// insecurity. It is not a universal poverty definition or an individual classification.
	EvidenceReportedHouseholdEnergyInsecurity SignalEvidenceType = "reported-household-energy-insecurity"
	// EvidenceReportedHouseholdEnergyBasicsTradeoff reports reducing or forgoing a
	// source-defined basic need to pay energy costs, not verified deprivation or harm.
	EvidenceReportedHouseholdEnergyBasicsTradeoff SignalEvidenceType = "reported-household-energy-basics-tradeoff"
	// EvidenceReportedHouseholdEnergyUnsafeTemperature reports a respondent-described
	// unhealthy or unsafe home temperature, not a sensor reading or medical outcome.
	EvidenceReportedHouseholdEnergyUnsafeTemperature SignalEvidenceType = "reported-household-energy-unsafe-temperature"
	// EvidenceReportedHouseholdEnergyEquipmentUnavailable reports inability to use
	// heating or cooling under exact cost, repair or nonpayment wording.
	EvidenceReportedHouseholdEnergyEquipmentUnavailable SignalEvidenceType = "reported-household-energy-equipment-unavailable"
	// EvidenceReportedHouseholdEnergyWarmthInability reports inability to afford keeping
	// a home adequately warm. It is subjective and not measured indoor temperature.
	EvidenceReportedHouseholdEnergyWarmthInability SignalEvidenceType = "reported-household-energy-warmth-inability"
	// EvidenceReportedHouseholdEnergyUtilityArrears reports a source-defined utility-bill
	// arrears item. It is not debt balance, default, disconnection or all housing arrears.
	EvidenceReportedHouseholdEnergyUtilityArrears SignalEvidenceType = "reported-household-energy-utility-arrears"
	// EvidenceReportedHouseholdEnergyDisconnectionNotice reports a disconnect or
	// delivery-stop notice. A notice is not an executed service disconnection.
	EvidenceReportedHouseholdEnergyDisconnectionNotice SignalEvidenceType = "reported-household-energy-disconnection-notice"
	// EvidenceReportedHouseholdEnergyDisconnection reports an exact source-declared
	// nonpayment disconnection, not a network outage or equipment failure.
	EvidenceReportedHouseholdEnergyDisconnection SignalEvidenceType = "reported-household-energy-disconnection"
	// EvidenceReportedHouseholdEnergyReconnection reports an exact reconnection event.
	// It does not establish that debt, hardship or service quality was resolved.
	EvidenceReportedHouseholdEnergyReconnection SignalEvidenceType = "reported-household-energy-reconnection"
	// EvidencePublishedHouseholdEnergyModeledFuelPoverty reports a publisher-defined
	// model classification such as England LILEE, not a portable poverty truth.
	EvidencePublishedHouseholdEnergyModeledFuelPoverty SignalEvidenceType = "published-household-energy-modeled-fuel-poverty"
	// EvidencePublishedHouseholdEnergyFuelPovertyGap reports the source model's currency
	// gap under an exact price basis. It is not a bill, debt or cash transfer.
	EvidencePublishedHouseholdEnergyFuelPovertyGap SignalEvidenceType = "published-household-energy-fuel-poverty-gap"
	// EvidencePublishedHouseholdEnergyRequiredBill reports a modelled required-energy
	// bill. It is not actual consumption, billed expenditure, debt or willingness to pay.
	EvidencePublishedHouseholdEnergyRequiredBill SignalEvidenceType = "published-household-energy-required-bill"
	// EvidencePublishedHouseholdEnergyAffordabilityBurden reports an exact threshold or
	// ratio with numerator, denominator and income/expenditure basis preserved.
	EvidencePublishedHouseholdEnergyAffordabilityBurden SignalEvidenceType = "published-household-energy-affordability-burden"
	// EvidencePublishedHouseholdEnergyCustomerDebt reports retailer/regulator-defined
	// aggregate debt with account population, amount role and aging rules fixed.
	EvidencePublishedHouseholdEnergyCustomerDebt SignalEvidenceType = "published-household-energy-customer-debt"
	// EvidencePublishedHouseholdEnergyHardshipParticipation reports aggregate enrolment
	// in a defined programme. It is not an individual vulnerability or resolution claim.
	EvidencePublishedHouseholdEnergyHardshipParticipation SignalEvidenceType = "published-household-energy-hardship-participation"
	// EvidencePublishedHouseholdEnergyPaymentPlanAssistance reports aggregate plan or
	// assistance activity, distinguishing offered, accepted, active and completed states.
	EvidencePublishedHouseholdEnergyPaymentPlanAssistance SignalEvidenceType = "published-household-energy-payment-plan-assistance"
	// EvidencePublishedHouseholdEnergyConcession reports an aggregate source-defined
	// concession population or amount, not eligibility, receipt or causal effectiveness.
	EvidencePublishedHouseholdEnergyConcession SignalEvidenceType = "published-household-energy-concession"
	// EvidencePublishedHouseholdEnergyPopulationRate reports a value using an exact
	// housing-unit, household or person population denominator.
	EvidencePublishedHouseholdEnergyPopulationRate SignalEvidenceType = "published-household-energy-population-rate"
	// EvidencePublishedHouseholdEnergyAccountRate reports a value using an exact customer,
	// fuel, residential or hardship account denominator, never a person denominator.
	EvidencePublishedHouseholdEnergyAccountRate SignalEvidenceType = "published-household-energy-account-rate"
	// EvidencePublishedHouseholdEnergyAmount reports an exact billed, required, debt,
	// arrears, gap or assistance amount with currency, price basis and sign preserved.
	EvidencePublishedHouseholdEnergyAmount SignalEvidenceType = "published-household-energy-amount"
	// EvidencePublishedHouseholdEnergyEstimateMethod reports survey weighting, model,
	// projection, regulatory aggregation, imputation and variance rules.
	EvidencePublishedHouseholdEnergyEstimateMethod SignalEvidenceType = "published-household-energy-estimate-method"
	// EvidencePublishedHouseholdEnergyEstimateQuality reports response, sample, RSE,
	// suppression, uncertainty, reporting coverage and comparability breaks.
	EvidencePublishedHouseholdEnergyEstimateQuality SignalEvidenceType = "published-household-energy-estimate-quality"
	// EvidencePublishedHouseholdEnergyReleaseRevision reports table, model, guideline,
	// template, correction, preliminary/final/projection and supersession lineage.
	EvidencePublishedHouseholdEnergyReleaseRevision SignalEvidenceType = "published-household-energy-release-revision"
	// EvidencePublishedHouseholdEnergyProgramLifecycle reports programme, collection,
	// model, result, file, API, submission and microdata standing independently.
	EvidencePublishedHouseholdEnergyProgramLifecycle SignalEvidenceType = "published-household-energy-program-lifecycle"
	EvidenceRepeatedRequest                          SignalEvidenceType = "repeated-request"
	EvidenceSearchIntent                             SignalEvidenceType = "search-intent"
	// EvidenceProductRequest means a subject or counterparty created or
	// supported an item on a product-feedback surface under a fixed board,
	// taxonomy, identity, visibility, and counting definition. A provider vote,
	// supporter, request, score, or merged total is not automatically an
	// independent repeated request.
	EvidenceProductRequest SignalEvidenceType = "product-request"
	// EvidenceObservedUsage represents behavior recorded under a fixed,
	// reviewable instrumentation and analysis definition. It is evidence that
	// an event or sequence was observed, not by itself activation, product
	// value, satisfaction, pain, identity, causal impact, or subscription
	// retention. Missing activity is also ambiguous until tracking health,
	// identity policy, coverage, and incomplete periods have been assessed.
	EvidenceObservedUsage SignalEvidenceType = "observed-usage"
	// EvidencePaymentFailure represents a source-declared failed or incomplete
	// collection attempt. It is not by itself churn, inability to pay, or product
	// dissatisfaction because authentication, processor, fraud, and timing
	// failures can produce the same state.
	EvidencePaymentFailure SignalEvidenceType = "payment-failure"
	// EvidenceRetentionOutcome represents a source-declared continuation,
	// non-renewal, cancellation, pause, or terminal subscription outcome. Its
	// attribution and cause must remain explicit; provider dunning and a
	// customer cancellation are not interchangeable.
	EvidenceRetentionOutcome SignalEvidenceType = "retention-outcome"
	// EvidenceValueReversal represents a refund, credit, adjustment, chargeback,
	// or similar reversal. Native subtype and cash-versus-non-cash semantics must
	// remain in the source projection; the existence of a reversal is not by
	// itself proof of a complaint or product failure.
	EvidenceValueReversal SignalEvidenceType = "value-reversal"
	// EvidenceDispute represents a source-declared contested payment. A dispute
	// reason is a claim in a financial process, not an accepted statement of fact.
	EvidenceDispute SignalEvidenceType = "dispute"
	// EvidencePurchaseDecision represents a source-declared commercial outcome
	// such as won, lost, or no-decision. It is not proof of budget or payment.
	EvidencePurchaseDecision SignalEvidenceType = "purchase-decision"
	// EvidenceOperationalDisruption represents a provider-published incident or
	// an instrumented failure observed under a fixed operational-status or
	// product-reliability definition. It is evidence that a disruption was
	// declared or observed, not independent proof of root cause, SLA breach,
	// affected-user count, customer pain, severity, or recovery. Scheduled
	// maintenance does not qualify unless a separate unplanned disruption is
	// explicitly evidenced.
	EvidenceOperationalDisruption SignalEvidenceType = "operational-disruption"
	// EvidencePublishedVulnerability represents a source-published advisory or
	// vulnerability record under a fixed identifier, affected-subject, range,
	// and source-lineage definition. It does not prove that a particular asset
	// is installed, reachable, affected, exploitable, or compromised.
	EvidencePublishedVulnerability SignalEvidenceType = "published-vulnerability"
	// EvidenceKnownExploitation represents an exact authority assertion that a
	// vulnerability is known to have been exploited. It does not prove local
	// exploitation, prevalence, attribution, ransomware use, or asset impact.
	EvidenceKnownExploitation SignalEvidenceType = "known-exploitation"
	// EvidencePackageLifecyclePressure represents a registry or publisher
	// assertion that an exact package, version range, release, version, or
	// artifact was deprecated, yanked, unpublished, deleted, or archived. It is
	// a migration or supply-continuity signal, not proof that any user is
	// affected, that the stated reason is true, or that an alternative is safe.
	EvidencePackageLifecyclePressure SignalEvidenceType = "package-lifecycle-pressure"
	// EvidencePackageUsageProxy represents a registry-defined aggregate such as
	// download events or dependent-package counts under a fixed metric, window,
	// and counting policy. It is not unique users, installations, adoption,
	// retention, demand, quality, revenue, or market size.
	EvidencePackageUsageProxy SignalEvidenceType = "package-usage-proxy"
)

type DemandSignalCandidate struct {
	ID                  SignalID
	Scope               ScopeRef
	Audience            string
	Situation           string
	Problem             string
	DesiredOutcome      string
	CurrentAlternatives []string
	Evidence            map[SignalEvidenceType][]EvidenceSpanID
	CounterEvidence     []EvidenceSpanID
	Frequency           string
	Severity            string
	Urgency             string
	Falsifier           string
	Confidence          float64
	DerivationProfile   string
	DerivationVersion   string
	ModelRoute          string
	DerivedAt           time.Time
}

type ReviewStatus string

const (
	ReviewProposed   ReviewStatus = "proposed"
	ReviewAccepted   ReviewStatus = "accepted"
	ReviewRejected   ReviewStatus = "rejected"
	ReviewSuperseded ReviewStatus = "superseded"
)

type DemandSignalRevision struct {
	Candidate  DemandSignalCandidate
	Revision   uint64
	Previous   *RevisionRef
	Status     ReviewStatus
	ReviewNote string
	ReviewedBy PrincipalID
	ReviewedAt *time.Time
}

type OpportunityDimension struct {
	Name        string
	Score       float64
	Explanation string
	Evidence    []EvidenceSpanID
}

type OpportunityCandidate struct {
	ID                  OpportunityID
	Scope               ScopeRef
	Title               string
	Audience            string
	JobToBeDone         string
	Signals             []RevisionRef
	Dimensions          []OpportunityDimension
	CounterEvidence     []EvidenceSpanID
	SuggestedProbeTypes []string
	DerivedAt           time.Time
}

type OpportunityRevision struct {
	Candidate  OpportunityCandidate
	Revision   uint64
	Previous   *RevisionRef
	Status     ReviewStatus
	DecisionBy PrincipalID
	DecisionAt *time.Time
}

type SignalExtractionRequest struct {
	Operation         OperationContext
	Question          ResearchQuestion
	Evidence          []EvidenceSpan
	DerivationProfile string
	DerivationVersion string
	ModelRoute        string
}

type OpportunitySynthesisRequest struct {
	Operation OperationContext
	Signals   []DemandSignalRevision
	Profile   string
	Version   string
}

type SignalMiner interface {
	Extract(context.Context, SignalExtractionRequest) ([]DemandSignalCandidate, error)
}

type SignalReviewer interface {
	ReviewSignal(context.Context, DemandSignalCandidate, string, PrincipalID, string) (DemandSignalRevision, error)
}

type OpportunitySynthesizer interface {
	Synthesize(context.Context, OpportunitySynthesisRequest) ([]OpportunityCandidate, error)
}

type OpportunityReviewer interface {
	ReviewOpportunity(context.Context, OpportunityCandidate, string, PrincipalID, string) (OpportunityRevision, error)
}
