# Canada FCSI / FCSAP Platform Pack 设计

状态：`concept-fixture + exact official bulk fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`canada-fcsi-fcsap/v0-design`

## 1. 稳定概念与population

[Federal Contaminated Sites Inventory](https://open.canada.ca/data/en/dataset/1d42f7b9-1549-40aa-8ac6-0e0302ff2902)覆盖联邦departments/agencies/consolidated Crown corporations custodianship下的known、suspected或investigated sites，以及政府已接受部分或全部财务责任的non-federal sites。它明确不覆盖私人、其他政府层级或enterprise Crown corporations造成且控制的污染。daily XML/ZIP、data dictionary与Open Government Licence Canada构成exact bulk fixture，但不构成全加拿大污染场地分母。

[FCSAP Decision-Making Framework v4.1](https://www.canada.ca/en/environment-climate-change/services/federal-contaminated-sites/publications/decision-making-framework-version-4-1.html)定义十步生命周期；许多场地在1–6步评估后即可判定无需cleanup/risk reduction。[Annual Report的步骤说明](https://www.canada.ca/en/environment-climate-change/services/federal-contaminated-sites/publications/2021-2022-annual-report.html)把strategy、implementation、confirmatory sampling/final reporting及long-term monitoring分开。

## 2. 概念映射

| Native | `PublicContaminationRemediation*` |
| --- | --- |
| federal site / custodian / accepted responsibility | site identity、custodian与accepted-responsibility posture；不自动为liability finding |
| step 1 suspected / step 2 history | potential posture与assessment |
| steps 3/5 testing | exact medium observation；方法/单位/qualifier coverage独立 |
| steps 4/6 classification | source-defined risk/priority class；不等于actual harm |
| step 7 R/RM strategy | remedy decision/plan |
| step 8 implementation | remediation或risk-management action |
| step 9 confirmatory sampling | verification evidence；不自动whole-site closure |
| step 10 long-term monitoring | control/stewardship |
| cost/liability fields | exact cost role与accounting period，不混合成spend/payment |

## 3. 能力、安全与Conformance

`definition.read`、`FCSI bulk-resource/schema.read`与`selected-site metadata.read`只作fixture。未来bulk canary固定dataset resource、data dictionary revision、daily watermark、population/custodian definition、status/step/classification mapping、currency/amount role、rights与field allowlist；禁止用同名场地或坐标跨jurisdiction合并。

Synthetic fixtures覆盖suspected→closed without cleanup、reclassification、risk management without contaminant removal、confirmatory sampling failed→return to strategy、long-term monitoring ended/reopened、custodian vs accepted financial responsibility，以及estimate/funding/expenditure/liability reduction分离。exact coordinates、Indigenous/sensitive-community detail、party/contact/documents/raw values先drop或quarantine。

Telemetry按`resource/data-dictionary revision × custodian/program population × site × DMF step × classification × R/RM/action/completion/control × amount role × coverage/rights`记录returned/retained/dropped/quarantined、missing step、reclassification、loopback、role mismatch与effects=0。本轮未下载XML或请求记录。
