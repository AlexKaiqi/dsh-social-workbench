# SAM.gov Contract Opportunities Platform Pack 设计

状态：`researched` 设计候选；未申请 API key、未调用 API、未运行 live probe  
核验日期：2026-08-26  
Pack ref：`sam-gov-public-opportunities/v0-design`

## 1. 定位与边界

本 Pack 只覆盖 SAM.gov Get Opportunities Public API v2 暴露的公开合同机会，不覆盖 Entity Management、敏感/FOUO 数据、Contract Awards API、Data Services 全量历史、Opportunity Management 写入 API 或 SAM.gov 页面抓取。

官方文档说明公开 API 需要个人或系统账号的 public API key，`postedFrom`/`postedTo` 为必填且跨度最多一年，按 `limit`/`offset` 分页；响应只提供平台当前暴露的最新版本，而全部版本需另用 SAM.gov Data Services：[Get Opportunities Public API](https://open.gsa.gov/api/get-opportunities-public-api/)。[SAM.gov Terms of Use](https://sam.gov/about/terms-of-use) 明确禁止自动化页面抓取，并要求程序化访问使用获准 API/数据服务，因此站点搜索不是备用 crawler route。

```text
platform             sam-gov
surface              public contract opportunities API v2
state                researched
knowledge snapshot   proposal only
verified level       evidence-review design only
callable routes      none
external effects     none
```

它提供比讨论或招聘更接近预算承诺的信号，但一个 Sources Sought、Pre-solicitation、Solicitation 或 Award 分别代表不同采购阶段，不能都解释成“当前可投标 RFP”。

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `sam.contract-opportunity-notice/v2` | entity | `noticeId` | 公开机会公告；唯一原生主键不是 solicitation number |
| `sam.notice-type/v2` | enumeration | API `ptype`/`type` | Sources Sought、Pre-solicitation、Solicitation、Award、Special Notice 等阶段/文类 |
| `sam.solicitation-reference/v2` | value | issuing organization + `solicitationNumber` | 业务编号，可跨公告复用或缺失，不代替 notice identity |
| `sam.federal-organization-path/v2` | entity/value | `fullParentPathCode` | 发布公告的层级组织路径；deprecated department/subtier/office 不作主映射 |
| `sam.procurement-classification/v2` | value | NAICS / classification code | 采购分类，不等同于需求主题的模型推断 |
| `sam.set-aside/v2` | enumeration/value | set-aside code | 竞争资格限制；缺失不能解释为 unrestricted |
| `sam.response-deadline/v2` | event/value | notice + deadline | 官方响应截止；字段拼写/时区按原始 schema 保存 |
| `sam.award-summary/v2` | entity/value | notice + award number | Award 类型可携金额、日期和 awardee；不是完整合同/付款历史 |
| `sam.opportunity-resource/v2` | entity/manifest | notice + resource URL/order | 附件/资源链接描述符；链接存在不证明已下载或可任意再分发 |
| `sam.point-of-contact/v2` | entity | notice + contact position | 可含姓名、邮箱、电话；默认不入分析投影，仅在必要 evidence 中受限保存 |

主要关系：

```text
organization-path ── publishes ──> opportunity-notice
opportunity-notice ── has-type ──> notice-type
opportunity-notice ── may-reference ──> solicitation-reference
opportunity-notice ── classified-by ──> NAICS / classification / set-aside
opportunity-notice ── may-list ──> opportunity-resource
award notice ── may-report ──> award-summary
```

### 2.1 历史语义

- `noticeId` 是公告身份；`solicitationNumber` 不是可靠的全局唯一键。
- API 文档的 latest-only 是来源历史覆盖边界。重复采集形成的 payload revision 只能标为 `observed-snapshot`，不能声称恢复了 SAM 原生全部版本。
- `type` 与 `baseType` 应分别保留；当前文类变化不应改写初始文类。
- archive、inactive、截止和 award 是不同状态/事件；一次搜索缺失不自动成为取消或授标事实。
- description/resource URL 的二次读取仍需要 public API key，必须作为独立文档读取步骤和证据记录。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `discovery.search.procurement-notices/v1` | date/query scope → notice refs | public-key API | `eligible` | 强制日期窗；只对查询边界声明 coverage |
| `content.read.procurement-notice/v1` | notice ref → notice observation | public-key API | `eligible` | 保存 noticeId、type/baseType 和 provider fields |
| `document.list.procurement-notice/v1` | notice → resource descriptors | public-key API | `eligible` | 只生成 manifest，不隐式下载 |
| `document.read.procurement-notice/v1` | approved resource/description → bytes | public-key API | `eligible-with-policy` | MIME、大小、安全、rights、retention 独立判定 |
| `change.observe.procurement-notice/v1` | repeated observations → appeared/changed/missing | derived pull | `eligible` | 不是平台原生 revision feed |
| `history.read.procurement-notice/v1` | notice → all native versions | Data Services | `deferred` | 当前 Pack 未研究/采用 Data Services 契约 |
| `response.submit.procurement-bid/v1` | vendor bid → receipt | authenticated procurement process | `rejected` | 不是轻量 Probe；涉及真实资格、法律和商业承诺 |
| `content.write.procurement-notice/v1` | federal role → notice mutation | Opportunity Management API | `rejected` | 只面向获权 federal roles，与需求研究隔离 |

[Opportunity Management API](https://open.gsa.gov/api/opportunities-api/) 的 create/publish/revise/cancel/archive 和附件操作属于授权写入面。它与公开搜索 API 不是同一个 access method，不能因技术存在就出现在研究 Connector 的 capability surface。

## 4. Access Method

### `sam-opportunities-public-v2/v1`

- mode：`official-api`；official：`true`；
- endpoint：`https://api.sam.gov/opportunities/v2/search`；
- credential：public API key reference，只在 Host credential lease 中解析，禁止写入 query log、聊天、fixture 或 Git；
- mandatory window：`postedFrom`/`postedTo`，跨度不超过一年；
- pagination：`limit` 最大 1000，使用 `offset`；
- provider limit：按账号/角色限制请求量，当前 Pack 不写死未由该 API 页面承诺的具体数值；
- completion：页耗尽且 `totalRecords`、offset/limit 与累计唯一 `noticeId` 一致，才可对该 query/window 标为 best-effort complete；
- history：`latest-exposed-only`；active 每日、archived 每周更新节奏分别记录；
- effect：network-read/local-write；无 platform write。

Terms 要求 API key 定期更新且不得共享；只能通过 public API 公布公共数据。公开字段仍可能混入联系人信息或第三方数据，Connector 必须按字段最小化，而不能因为 endpoint 名为 public 就全部长期索引。

## 5. Platform Skills

### `sam-opportunity-pack-research/v1`

- purpose：`research/curate`；
- 核验 Open GSA docs source、SAM terms、API version/change log、notice types、Data Services 边界和开源候选；
- 只输出 EvidenceLink、ResearchArtifact 和 KnowledgeProposal；禁止索取/展示 API key、抓取 SAM 页面或执行第三方项目。

### `sam-public-procurement-research/v1`

- purpose：`acquire`；
- 输入：固定 knowledge snapshot、获批 query/date window、NAICS/organization/type filters 与成本预算；
- allowlist：公开 search/read/document manifest；
- 输出：原生 Observation、native history assessment、document descriptors、query-scoped CoverageAssessment；
- 禁止：Entity/FOUO/sensitive API、联系人画像、自动联系、写公告、响应或投标。

### `sam-opportunity-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；sandbox 需要用户批准的 credential ref 和极小日期窗；
- 必须验证 offset、date-window split、noticeId 去重、latest-only history、type/baseType、resource manifest、PII minimization、429/401 和 credential redaction。

本 Pack 没有 Probe Skill。虚假 Sources Sought 回复、报价或投标会制造真实采购流程和法律/商业影响，不是需求研究实验。

## 6. 数据治理

- 默认索引 title、notice type、organization path、NAICS/classification、set-aside、posted/archive/deadline、award summary 和必要 description spans。
- point-of-contact 姓名、邮箱、电话、awardee address/UEI 等不进入通用需求 projection；确有审计需要时使用受限 blob、最短 retention 和 access audit。
- resourceLinks 先存 `SourceArtifactDescriptor`；下载前验证 scheme/host、大小、MIME、恶意内容、rights 与研究必要性。
- D&B/Entity 数据限制与本 Pack 的机会公告不是同义边界；不得通过 opportunity awardee 字段扩张为 entity marketing database。
- SAM.gov 页面抓取和自动登录被 Terms 禁止；API 故障时降级为暂停或用户导出的 manual import，不切换浏览器 crawler。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [GSA/open-gsa-redesign](https://github.com/GSA/open-gsa-redesign/tree/92a23c445872c6c225a54a16120eb3c73b878f91) `92a23c445872c6c225a54a16120eb3c73b878f91` | GSA official；CC0/public domain | Opportunities API source、字段和 change log drift evidence | `official-evidence`；不是 runtime SDK |
| [MindPetal/sam-search](https://github.com/MindPetal/sam-search/tree/349e09bdc994528c4b37f517f2e5abdf42026ed6) `349e09bdc994528c4b37f517f2e5abdf42026ed6` | community；MIT | date/NAICS query、daily schedule、secret 与 pagination 测试参考 | `reference-only`；Teams action 不进入本 Pack，claims 回到官方 docs |
| [ab75173/sam-gov-mcp](https://github.com/ab75173/sam-gov-mcp/tree/4b300be168d0b369da98a8aff79c140d3b449db4) `4b300be168d0b369da98a8aff79c140d3b449db4` | community；未完成独立许可证/安全审计 | MCP tool surface 与 typed-client 候选 | `discovery-only`；不安装、不作为 capability 证据 |

## 8. Verification Plan

### evidence-review / static-contract

- public search、Data Services history、Opportunity Management write 三个 surface 分离；
- API key 只以 CredentialRef 出现，禁止进入 URL telemetry；
- notice identity 使用 `noticeId`，solicitation number 只作业务 reference；
- `SourceHistoryCoverage=latest-exposed-only`，payload hash 不冒充 native version；
- resource link 只生成 descriptor，未下载不得产生 evidence blob claim；
- coverage 固定 query/date/type/organization/NAICS population 和 exclusions；
- bid/notice write adoption 为 rejected，不能生成 route。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| multi-page `totalRecords` | offset/limit、唯一 noticeId 与完成条件一致 |
| >1 year requested window | planner 静态拒绝或拆成有界子窗，coverage 保留每个窗 |
| same notice changed payload | 形成 observed snapshot，不制造 native version ID |
| `type != baseType` | 两者保留，不覆写生命周期起点 |
| award/non-award notices | amount/awardee 仅在适用类型映射，缺失为 unknown |
| resource/description links | manifest 与 retrieved bytes 分离，API key 不泄露 |
| contacts and awardee details | 默认投影最小化，原始 blob rights 受限 |
| 401/403/429/5xx | 分类、retry-after/backoff、checkpoint 不越过失败页 |
| once-only missing notice | 不直接断言 cancelled/archived/awarded |
| management/bid request | policy/static gate 拒绝 |

### sandbox-live / operational-canary

需用户另行提供 credential ref、批准费用/配额和极小公共查询窗后，才可验证真实分页、错误、description/resource access 与 redaction；不调用页面、Entity、Data Services 或写入 API。通过后才设计低频 canary，监测 docs commit、v2 schema/change log、key expiry、active/archive lag、rate-limit 与 coverage drift。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted concepts/capabilities/access method、normative schema、notice-type mapping、rights/retention 和 credential policy；从 `modeled` 到 `verified` 需要离线 fixture report，并经用户授权完成有限 sandbox。当前不授权任何 Connector、key 申请或 live call。
