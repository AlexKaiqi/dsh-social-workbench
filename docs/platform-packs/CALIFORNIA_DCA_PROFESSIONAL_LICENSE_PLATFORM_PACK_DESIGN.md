# California DCA Professional License Platform Pack 设计

状态：`concept-fixture + exact public-file layout / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`california-dca-professional-license/v0-design`

## 1. 稳定概念与官方证据

[Licensee Lists Overview](https://www.dca.ca.gov/consumers/public_info/index.shtml)说明DCA通过Boards/Bureaus/Committees/Programs覆盖150+ professional license types，并按Agency文件夹在月初刷新公开名册；layout含Agency、license type/number、individual/organization、姓名、公开地址、original issue、expiry和Current/Delinquent/Inactive状态。页面同时列出未包含Agencies，所以文件集合不是DCA全部许可。

[DCA License Search](https://search.dca.ca.gov/)用于验证current/expired和suspension/revocation等disciplinary action，并列出未进入统一搜索的实体。bulk roster、interactive search、各board enforcement document是不同representation与population。

## 2. 处分语义样本

[CBA lookup说明](https://www.dca.ca.gov/cba/consumers/about-lookup.shtml)明确accusation是可争议allegation；probation仍可在条件下执业；stayed action未必立即生效；revocation/surrender与reinstatement不同；summary可能在final decision后约30天才出现且不能替代order。[Formal Accusations](https://www.dca.ca.gov/cba/consumers/formal_accusations.shtml)再次说明pending accusation不是最终wrongdoing determination。

这些定义只固定CBA member，不能当作所有DCA Agencies的统一处分规则。每个board的publication window、document availability、status hints和removal policy都必须单独版本化。

## 3. 概念映射与只读边界

| Native | `PublicRegulatedLicense*` |
| --- | --- |
| Agency code/name | authority/board roster revision |
| license type code/name | category/credential taxonomy |
| individual/organization | exact subject kind与不同privacy policy |
| Current/Delinquent/Inactive | source standing mapping；非统一法律结论 |
| accusation / pending case | allegation + proposed/pending finality |
| final decision / probation / suspension / revocation | finding + sanction + effective/finality |
| stayed / judicial modification | appeal/stay/variation relation |
| reinstatement | remediation/restoration；不删除历史finding |

`definition.read`、`public-file.layout.read`、`agency-file.metadata.read`、`selected-license.metadata.read`和`selected-public-discipline.metadata.read`仅为fixture capability。未来route必须固定exact Agency folder/file、refresh watermark、layout revision、excluded-Agency roster、public-field allowlist、board-specific discipline route与publication rules。姓名、license number和address of record即使依法公开，也不进入普通需求分析索引。

申请、考试、续期、complaint、document、subscription、payment、appeal/reinstatement petition及任何write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖individual/organization、one person→multiple licenses/boards、Current/Delinquent/Inactive、excluded Agency、monthly snapshot replacement、accusation→dismissed/final、probation with stayed revocation、surrender、revocation→reinstatement、summary lag、court modification、name/address/license-number/document drop。

Telemetry逐`Agency/file × layout/refresh revision × subject kind × license type/standing × allegation/finding/finality/sanction × publication window × privacy/rights`记录available/missing/withheld/removed、returned/retained/dropped、late publication、schema/status drift、quarantine和zero effects。本轮没有访问Box文件或任何license row。
