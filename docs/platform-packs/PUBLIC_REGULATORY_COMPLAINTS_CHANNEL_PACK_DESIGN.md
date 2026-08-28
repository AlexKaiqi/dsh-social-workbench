# Public Regulatory Complaints & Incident Reports Channel Pack 设计

状态：`researched`；1 个 fixture-eligible candidate，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-regulatory-complaints/v0-design`

## 1. Channel 目的与成员状态

本 Channel 组合监管机构公开的消费者投诉和事故报告，用于发现具体问题、报告影响、企业回应与处理缺口。Channel统一研究目的和`RegulatoryComplaint*` projection，不统一法律含义、真实性、人口分母、taxonomy或许可。

| Candidate | Pack/contract | 状态 | 当前 coverage |
| --- | --- | --- | --- |
| NHTSA ODI Complaints | [NHTSA Vehicle Safety Complaints Pack](NHTSA_VEHICLE_SAFETY_COMPLAINTS_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | API/bulk/schema evidence存在；root/row、PII、rights和live schema未验证 |
| CFPB Consumer Complaint Database | official database/API/2026-08 announcement | `drift-blocked` | narrative publication retired；主页/field/OpenAPI/release状态冲突；post-change structured contract未重新验证 |
| CPSC SaferProducts unsafe reports | public search/export/Clearinghouse | `manual-export / contract-gated` | public export存在；当前版本化unsafe-report API/schema/license未固定 |

requested=3、fixture-eligible=1、callable=0、drift-blocked=1、manual/contract-gated=1。NHTSA fixture成功不能让CFPB/CPSC变绿；旧CFPB narrative、FOIA Reading Room、CPSC HTML或community MCP均不能替代缺失成员。

## 2. 共同 representation 与不可比较边界

成员可共享：regulator/jurisdiction/program、root/record/representation、subject/issue taxonomy、narrative/response/disposition content、reported impact assertion、publication/deidentification、history/coverage/rights和evidence lineage。

必须保留差异：

- NHTSA是owner safety complaints，可能一项投诉对应多个component rows；
- CFPB是sent-to-company的consumer finance complaints，company response/timeliness是独立状态，且 narrative capability已退役；
- CPSC unsafe report有publication eligibility、manufacturer/privacy审查与多来源Clearinghouse；
- NHTSA crash/fire/injury/death、CFPB company response、CPSC injury severity不可放进同一severity scale；
- 三者都不是总体样本。complaint/report count没有产品销量、客户数、使用暴露或人口分母时不能比较发生率；
- published不等于verified，response不等于resolved，regulator investigation不等于confirmed defect，recall也不等于每条complaint因果成立。

## 3. Channel Projection 与动态物化

共同projection只要求 member/Pack/definition、regulator/jurisdiction、root/record/representation、subject/issue、narrative/response/disposition span、reported impacts、source/process dates、publication/deidentification、history/coverage/rights与evidence。

可重建的动态视图：

- `reported-problems-by-product-component`：按成员native subject taxonomy聚合reviewed narrative spans；
- `reported-impact-cooccurrence`：只标注source assertions和verified coverage，不生成风险率；
- `organization-response-and-disposition-gaps`：仅在成员官方response/disposition schema存在时构建；
- `regulator-followup-relation-candidates`：exact relation与待人工证据candidate分开；
- `publication-and-narrative-coverage`：结构化记录、公开叙述、redacted/quarantined/missing比例；
- `member-contract-and-schema-drift`：CFPB narrative retirement、NHTSA cutover、CPSC contract gap等局部健康。

所有view固定definition、member、taxonomy、selection/population、rights revision与watermark。不能跨成员计算“最差公司/产品”、投诉率、安全评分、伤亡率或市场规模。

## 4. Channel Skills

### `regulatory-complaint-source-research/v1`

研究官方docs/schema/terms/publication policy、固定OSS与Agent Skill，输出member/Pack/drift proposal；不调用数据API、下载export或注册route。

### `public-regulatory-complaint-research/v1`（未来候选）

只调度各成员已verified且被用户批准的read capability。当前返回NHTSA `no-authorized-binding`、CFPB `drift-blocked:narrative-retired-contract-conflict`、CPSC `manual-contract-gated`，不能cross-member fallback。

### `regulatory-complaint-channel-conformance/v1`

验证root/row、subject/response/disposition、claim-vs-finding、PII drop、publication/rights、member-specific population、partial degradation、dynamic projection、no-fallback和zero-write。

Channel没有Probe Skill。向监管机构提交投诉/事故报告、制造伤害声明、联系企业、flag或修改监管记录均拒绝；合法真实投诉属于用户本人和监管流程，不是市场实验。

## 5. Fixture 与可观测性

| Scenario | 必须结果 |
| --- | --- |
| NHTSA fixture passes, CFPB/CPSC unavailable | Channel partial；requested=3、callable=0和missing reasons保持可见 |
| same company/product text across members | 不merge；仅生成带evidence的subject relation candidate |
| complaint/report counts differ | 不做跨成员总量或rate；population/exposure missing显式 |
| source claim vs regulator finding | 不同record/span authority；claim不能晋升finding |
| CFPB stale docs request narrative | capability drift rejection；不调用旧API/FOIA fallback |
| CPSC HTML automation request | manual/contract gate拒绝 |
| PII field or narrative leakage | member quarantine；其他成员结果不掩盖 |
| any submission/write | effect policy拒绝且zero-write成立 |

Telemetry按`Channel revision × member × definition/schema × representation × capability/route`分层，记录expected/fixture/callable/succeeded/blocked/manual/quarantined、root/row/subject counts、narrative/response/disposition/impact/history/rights coverage、PII drop/quarantine、schema/publication/terms drift、last verified与zero-write。单一“监管数据读取成功”不是健康指标。

## 6. 晋级规则

至少一个成员完成fixture conformance后，Channel才可成为`modeled-partial`；成员只有经用户批准完成read-only sandbox才能增加callable coverage。CFPB只有post-2026-08官方current schema与publication contract一致后才能解除drift block；CPSC只有exact export/API schema、许可与redaction policy固定后才能自动化。任何成员write、VIN或身份字段不会随read晋级自动开放。
