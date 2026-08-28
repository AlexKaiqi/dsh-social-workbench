# 公开监管投诉与事故报告候选分流（2026-08-26）

状态：`evidence-reviewed triage`；无网络 route、无数据下载、无平台写入  
研究目的：发现已经发生并被提交给监管机构的产品/服务问题、消费者声称的伤害、企业回应与监管处理缺口

## 1. 为什么这是新的需求信号

普通评论说明使用后的主观体验，客服说明进入企业自有渠道的问题；监管投诉/事故报告还增加了产品或公司分类、提交/转送/公开过程、企业回应、事故影响声明和潜在调查关系。但“提交给监管机构”不等于投诉属实、存在违法或缺陷，也不形成市场暴露分母。

成功标准不是收集最多投诉，而是找到至少一个官方、可版本化、能够在字段进入仓库前完成身份最小化的来源，并把 complainant claim、company response 与 regulator finding 分开。边界是：不提交投诉、不下载 live 数据、不保存 VIN/姓名/联系方式、不把公开数量当发生率或市场规模。

## 2. 候选比较与决策

| 候选 | 需求价值 | 官方表面与当前漂移 | 决策 |
| --- | --- | --- | --- |
| NHTSA ODI Consumer Complaints | 车辆、轮胎、儿童座椅和设备的具体组件、故障叙述、crash/fire/injury/death 声明；可关联车型与潜在调查 | 官方 complaints API 支持 year/make/model 与 ODI number lookup；daily bulk files + data dictionary；bulk schema 同时含直接身份字段，且 2021/2026 有显著语义变化 | 首个 Pack；`fixture-eligible / schema+PII-gated / no route` |
| CFPB Consumer Complaint Database | 金融产品/issue/sub-issue、company、response/timeliness 与历史叙述 | 2026-08-14 官方宣布停止发布未核验 complaint narratives 与 visualizations；8月7日数据库主页和部分 API/field docs仍描述旧能力，current contract 冲突 | `drift-blocked`；structured metadata 也需重新核验 current schema，不假设 narrative fallback |
| CPSC SaferProducts unsafe product reports | 消费品、品牌/型号、伤害严重度和公开事故叙述 | 官方提供 public search 与全量 public database export；本轮未找到当前、版本化的 unsafe-report API，且 publication eligibility、manufacturer/privacy redaction 需逐 schema 核验 | `manual-export / contract-gated`；不使用网页自动化 |

选择 NHTSA 不是因为它风险最低，而是因为它同时有官方 API、daily bulk、字段字典和变更记录，能够在不接触 live 数据时构建有意义的 root/row、assertion、PII 与 drift fixtures。它仍然没有 callable route。

## 3. 官方证据要点

### 3.1 NHTSA

- [NHTSA Datasets and APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis)说明 complaint 数据用于结合其他来源识别可能值得调查的安全趋势，提供按车型与 ODI number 查询的 API，以及每日全量/五年分片下载；
- [Complaint flat-file dictionary](https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt)说明 `CMPLID` 记录可更新，`ODINO` 可因多个 component 重复，且 2002-12-15 以前还可能因同一投诉人的多个产品重复；
- 同一字典记录 2021 年将原先空的 Y/N 变成 `N`、空数字变成 `0`，并警告生成系统更新导致 flat file 差异；2026-04-30 又增加 incident state 与 vehicle operator 字段；
- 字典包含 VIN、consumer city、dealer contact、vehicle operator name 等不应进入需求系统的字段。公开数据并不解除最小化义务；
- [NHTSA Terms of Use](https://www.nhtsa.gov/about-nhtsa/terms-use)允许分发或复制 public information，同时明确不保证准确、完整或充分；这支持研究用途，不支持把 complaint 当成官方认定；
- [API Use Policy](https://api.nhtsa.gov/)说明 API 为向公众提供 safety information，并限制 bulk VIN lookup。本设计不提供 VIN capability。

### 3.2 CFPB 的即时漂移

[CFPB 2026-08-14 announcement](https://www.consumerfinance.gov/about-us/newsroom/the-cfpb-to-cease-discretionary-publication-of-complaint-narratives-and-visualizations/)明确停止数据库中的未核验投诉叙述和可视化，并称旧叙述将通过 FOIA Reading Room 主动披露。它同时强调叙述是单方面、未核验且不具代表性的声明。

这与核验日期较早的[Consumer Complaint Database 页面](https://www.consumerfinance.gov/data-research/consumer-complaints/)和[API field reference](https://cfpb.github.io/api/ccdb/fields.html)仍描述公开 narrative/consent 的内容冲突。[Release notes](https://cfpb.github.io/api/ccdb/release-notes.html)又显示 2026-06 导出已移除 consent/dispute 字段，2026-07 filtered CSV 限 100,000 且 JSON export 退役。结论是 capability 必须局部 degrade；旧 API/OpenAPI、FOIA Reading Room 或历史文件都不是自动 fallback。

### 3.3 CPSC

[CPSC Data](https://www.cpsc.gov/Data)列出 SaferProducts recalls/unsafe reports public export；[SaferProducts search](https://www.saferproducts.gov/PublicSearch)提供 report/recall、product/brand/model、injury severity 与时间筛选；[Clearinghouse](https://www.cpsc.gov/Research--Statistics/Clearinghouse-Online-Query-Tool)说明报告来自多种来源、叙述经 redaction，最近十年可在线访问且年度数据存在发布滞后。它们证明研究价值和 manual/export 表面，不证明当前自动 API 或统一许可。

## 4. 抽象结论

现有 `ProductFeedback*` 不足以承载监管投诉：review/reply围绕产品评价，而监管记录包含 submission/publication process、监管计划与jurisdiction、投诉根与重复component/product rows、公司回应与监管处置，以及“来源声称的影响”和“监管核验”之间的明确鸿沟。

因此新增 `RegulatoryComplaintDefinitionMetadata`、`RegulatoryComplaintRecordMetadata` 与 `RegulatoryComplaintSpanMetadata`：

- root、subject row、narrative、organization response、regulator disposition、publication event、aggregate分开；
- canonical/current published/search/bulk/aggregate representation分开；
- published、response received、timely、disputed、regulator verified、active investigation正交；
- crash/fire/injury/fatality/financial loss等是 `ImpactAssertion`，保存 reporter role 与可空 verified，不自动成为监管事实；
- actor attribution无person identifier；organization/product作为subject；
- publication consent、deidentification、PII review、rights、retention/deletion是记录级治理事实。

`EvidenceComplaint` 已是足够的派生证据类型；新类型只描述来源representation，不新增“监管投诉一定更真实”的证据等级。

## 5. OSS 与 Agent Skill 静态快照

未 clone、安装或执行任何项目。

| Artifact | Fixed revision | 价值 | 决策 |
| --- | --- | --- | --- |
| [cfpb/ccdb5-api](https://github.com/cfpb/ccdb5-api/tree/9bf8c3e8b013d846394dd285bb49470a23ead628) | `9bf8c3e8b013d846394dd285bb49470a23ead628` | 官方 OpenAPI、search/detail、pagination/meta stale flags；CC0 | `official-reference`；README明确旧docs不再更新，且 narrative retirement 后需重新conformance |
| [cfpb/ccdb-data-pipeline](https://github.com/cfpb/ccdb-data-pipeline/tree/e6b75ad6cdfd9bec6f578b382b80826e07c8bfb0) | `e6b75ad6cdfd9bec6f578b382b80826e07c8bfb0` | 官方 public CSV→OpenSearch、PII-scrubbed pipeline与daily load参考；CC0 | `official-reference`；含内部/上传运维面，不执行 |
| [cfpb/ccdb5-ui](https://github.com/cfpb/ccdb5-ui/tree/99847c258d654ca35ec8ab2aab0cae45ca10c09a) | `99847c258d654ca35ec8ab2aab0cae45ca10c09a` | 官方 filters/fixtures/search representation；CC0 | `reference-only`；UI/旧fixture不能证明2026-08 current contract |
| [cyanheads/nhtsa-vehicle-safety-mcp-server](https://github.com/cyanheads/nhtsa-vehicle-safety-mcp-server/tree/f359e7303ae84f8ada76ac2f09de5fa901cc8ff5) | `f359e7303ae84f8ada76ac2f09de5fa901cc8ff5` | community NHTSA API mapping、partial availability、date anomaly与MCP observability参考；Apache-2.0 | `reference-only/rejected-route`；Hosted MCP、VIN、aggregate safety profile与broad model tools越过本Pack最小表面 |

本轮未识别到 NHTSA、CFPB 或 CPSC 官方 demand-research Agent Skill/MCP。社区 MCP 的存在不能替代官方 schema、rights、field drop 或 fixture conformance。

## 6. 分流结果与下一触发

```text
NHTSA ──> 首个 Platform Pack ──> fixture eligible ──> schema/PII/rights gate ──> no route
CFPB  ──> narrative retired + stale contract conflict ──> drift blocked
CPSC  ──> public export/manual candidate ──> exact schema/terms/API missing
```

重新研究触发包括：NHTSA dictionary/API/schema/terms变更；CFPB发布新的post-2026-08 schema和structured-data contract；CPSC发布版本化 unsafe-report API/schema/license；某成员publication/redaction/deletion规则变化；或fixture发现PII无法在持久化前可靠剔除。触发只生成 evidence proposal，不自动变更 route。
