# Greenhouse Job Board Platform Pack 设计样本

状态：`researched` 设计候选；未发布、未调用 API、未运行 live probe  
核验日期：2026-08-26  
Pack ref：`greenhouse-public-job-demand/v0-design`

## 1. 定位与边界

本 Pack 只覆盖 Greenhouse Recruiting 的公开 Job Board API，不覆盖 Harvest API、Recruiting Webhooks、Ingestion API、Assessment API、Onboarding API、候选人数据或客户后台。

官方文档说明 Job Board API 的 GET 数据公开且无需认证，提供 organization 的 job board、published job posts、departments 和 offices；只有 application submission POST 需要 Basic Auth：[Job Board API](https://developer.greenhouse.io/job-board.html)。因此它适合观察目标企业公开表达的岗位投入，但不是全网职位搜索、企业内部 headcount、实际招聘结果或候选人数据库。

```text
platform             greenhouse-recruiting
surface              public job board API v1
state                researched
knowledge snapshot   proposal only
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `greenhouse.job-board/v1` | entity | board token | 一个组织的公开 board namespace；token 不是组织通用 ID |
| `greenhouse.job-post/v1` | entity | job post `id` | 对外发布单元；与内部 job 不同，申请目标使用该 ID |
| `greenhouse.internal-job/v1` | entity | `internal_job_id` | 内部职位对象的引用；公开 prospect post 可为 null |
| `greenhouse.prospect-post/v1` | entity | job post `id` | 未指向具体内部 job 的公开 prospect post；由 null `internal_job_id` 区分 |
| `greenhouse.department/v1` | entity | board + department ID | 可形成 parent/child tree；不是跨企业标准部门 taxonomy |
| `greenhouse.office/v1` | entity | board + office ID | 可形成 parent/child tree，并带 location 文本 |
| `greenhouse.job-location/v1` | value/entity | job post + location position | 平台返回的展示位置，不自动等于合法工作地点范围 |
| `greenhouse.job-metadata/v1` | extension/value | board + custom field key | 只有客户选择公开的 custom fields；结构按 board 变化 |
| `greenhouse.application-question/v1` | entity/schema | job post + question ID | 求职申请表字段，可能包含合规/人口统计问题；本 Pack 默认不读取 |

主要关系：

```text
job-board ── publishes ──> job-post
job-post ── may-reference ──> internal-job
prospect-post ── is-a ──> job-post
job-post ── classified-by ──> department
job-post ── located-in ──> office / job-location
job-post ── may-expose ──> job-metadata
```

### 2.1 原生差异必须保留

- `id` 是 job post ID，`internal_job_id` 是内部 job ID；不能互换或用后者作为公开稳定身份。
- prospect post 的 `internal_job_id=null` 不是数据错误，也不应被当成普通明确职位需求。
- department、office 和 metadata 是 board-local；跨企业映射只能是派生 projection。
- `updated_at` 是平台 post 更新时间，不等于首次发布、招聘启动或实际 headcount 变化时间。
- listing 消失可能是关闭、下线、迁移、权限/board 变化或短暂故障；仅靠一次 404/缺失不能断言已招满。

公共设计映射使用 `design/go/demandintel/ingress.go` 中的 `JobPostingDefinitionMetadata`、`JobPostingRecordMetadata`、`JobPostingSpanMetadata`、`JobPostingPlacementMetadata` 和 `JobCompensationTermBinding`。Greenhouse 原生 board、post、internal job、prospect post、department 与 office ID 始终保留；公共类型不是删除原生差异的统一 Job DTO。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.read.job-board/v1` | board token → board revision | public | `eligible` | 读取 organization display name/content |
| `discovery.list.published-jobs/v1` | job board → current job-post refs | public | `eligible` | 不是全文 search，也不是跨 board discovery |
| `content.read.job-posting/v1` | job-post ref → job-post revision | public | `eligible` | 默认不请求 application questions |
| `taxonomy.list.job-departments/v1` | job board → departments | public | `eligible` | 保存 tree 与 board-local identity |
| `taxonomy.list.job-offices/v1` | job board → offices | public | `eligible` | location 文本不提前地理编码 |
| `change.observe.published-jobs/v1` | repeated board snapshots → appeared/updated/disappeared observations | derived pull | `eligible` | 只是观察差异，disappeared 不是官方关闭事件 |
| `application.submit.job/v1` | applicant data → application receipt | authorized write | `rejected` | 与需求研究无关，包含候选人 PII，禁止自动投递/测试申请 |
| `content.read.internal-job/v1` | customer account → internal job | Harvest/customer API | `deferred` | 不属于公开 Job Board Pack |

## 4. Access Methods

### 4.1 `greenhouse-job-board-public-get/v1`

- mode：`official-api`
- official：`true`
- authentication：公开 GET 不需要；
- namespace：显式 board token；
- endpoints：board、jobs、single job、departments、offices、sections 的文档化 GET 子集；
- default query：job list 可请求 `content=true`，single job 不请求 `questions=true`；
- effect：`none/local-write`；
- coverage boundary：一个已登记 board token 当次返回的公开 job posts；不是所有 Greenhouse 客户、企业全部招聘、internal jobs 或招聘市场；
- completion：只有响应有效、`len(jobs)` 与 provider `meta.total` 一致且无截断/错误时，才可对该 board snapshot 标记 `complete`。

### 4.2 明确排除的写入面

Greenhouse 文档提供 application submission POST，但要求服务器代理 secret API key，并提醒自建表单需承担 required-field 校验、spam protection 和 applicant data 处理：[Job Board API applications](https://developer.greenhouse.io/job-board.html#submit-an-application)。本 Pack 不创建该 access method 的 route；伪造申请也不是合法 Probe。

Harvest API 是客户/partner 的独立授权面，具有认证、分页、rate-limit 和更广泛私有数据。它不能因为同属 Greenhouse 就继承公开 GET 的 access class；若未来需要自有 ATS 分析，应单独建 `greenhouse-owned-recruiting` Pack 或 profile。

## 5. Platform Skills

### `greenhouse-pack-research/v1`

- purpose：`research/curate`；
- 核验 Job Board API、support changelog、terms、官方 docs repo 和字段变化；
- 只输出 EvidenceLink/KnowledgeProposal；禁止调用 board、读取候选人或执行外部代码。

### `greenhouse-public-job-demand/v1`

- purpose：`acquire`；
- 输入：固定 knowledge snapshot、获批 board roster、研究问题和时间窗；
- capability allowlist：board/jobs/departments/offices 的公开 read；
- 输出：Observation + board-scoped CoverageAssessment；
- 禁止：自动发现/猜测任意 board token、读取 application questions、收集候选人或提交申请。

### `greenhouse-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；sandbox 只对用户批准的公开 board allowlist；
- 必须验证 job-post/internal-job/prospect-post 分流、metadata extension、board coverage 和 disappearance uncertainty。

本 Pack 不定义 Probe Skill。岗位发布和求职申请都涉及真实招聘主体或真实候选人，不应被需求研究系统当成低成本测试渠道。

## 6. 数据治理与需求解释

- 只采公开 job-post 事实；不采姓名、邮箱、电话、简历、申请表答案、EEO/人口统计或候选人状态。
- job description 原文作为受限 evidence 保存，分析索引只保留必要 span 与来源；不默认建立整站镜像或再发布职位库。
- board token 必须来自企业 career page、用户 roster 或可追溯证据，不能通过批量枚举猜测。
- 一个公开岗位证明组织公开表达了招聘意图，不证明预算已批准、仍有 headcount、正在积极面试或会采购某类软件。
- 重复岗位、evergreen role、prospect post 和多地点 post 必须独立标记，不能直接累计成 headcount。
- Greenhouse customer MSA 的 API 权利和限额依赖客户 Order Form；公开 GET 的技术可访问性不自动授予私有 API 或无限再利用：[Greenhouse legal](https://www.greenhouse.com/legal)。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 核验；没有 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [grnhse/greenhouse-api-docs](https://github.com/grnhse/greenhouse-api-docs/tree/bce460167e939315b10a8f0b3f65b2eb34aa9a99) `bce460167e939315b10a8f0b3f65b2eb34aa9a99` | Greenhouse 官方文档源；Apache-2.0 | 固定 job-board schema、文档 source diff 和 drift evidence | `official-evidence`；不是 SDK/adapter |
| [noble-ronin/ats-job-apis](https://github.com/noble-ronin/ats-job-apis/tree/18942b18a452e92d5ecb09e7b527c29fee8b74a3) `18942b18a452e92d5ecb09e7b527c29fee8b74a3` | community；未见许可证 | ATS endpoint 发现目录 | `discovery-only`；claim 必须回到官方文档 |
| [bonus414/job-scanner](https://github.com/bonus414/job-scanner/tree/292e530e843b13524c28e4ca5bdeb2d44ba58ca2) `292e530e843b13524c28e4ca5bdeb2d44ba58ca2` | community；MIT；单 commit 快照 | roster、provider adapter、first/last seen 和显式 polling 参考 | `reference-only`；未审计实现，不作为运行依赖 |

## 8. Verification Plan

### evidence-review

- 官方 GET authentication、endpoint、field、board namespace 和 application POST 边界可追溯；
- 官方 docs source commit/license 固定；community project ownership/license 分开；
- “全网搜索”“一个 job post 等于一个新增 headcount”“消失即招满”等 claim 被拒绝。

当前只有设计态 evidence review，没有 content hash、accepted snapshot 或 VerificationReport。

### static-contract

- platform ID、board token、job-post ID 与 internal-job ID 不混用；
- public GET route 不包含 credential、application question 或 candidate schema；
- `discovery.list.published-jobs` 不得注册成 `search.jobs`；
- CoverageAssessment 必须包含 board population boundary；
- application.submit adoption 为 rejected，不能物化 route；
- raw HTML 与 derived text 分离，metadata 进入 schema-bound extension。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| jobs list + `meta.total` | 数量一致才完成 board-scoped coverage |
| normal post + prospect post | 按 `internal_job_id` null 分流 |
| duplicate post revisions | `id` 稳定、`updated_at`/payload hash 产生新 revision |
| department/office trees | parent/child 保留，board-local ID 不跨企业归并 |
| custom metadata shape change | core schema 不污染，extension 版本化 |
| HTML/entity content | 原始 evidence 与安全文本 projection 分离 |
| one-run disappearance | 先记录 unknown/disappeared observation，不直接 tombstone 为 filled |
| 404/invalid board | unknown-board 与 empty-board 区分 |
| application payload fixture | policy/static gate 拒绝，不读取 PII |

### sandbox-live / operational-canary

需用户另行授权后，才可对有限公开 board allowlist 做 read-only sandbox；验证 `meta.total`、conditional request/header、404、更新和删除解释，不调用 POST。只有 sandbox 通过后才设计低频 canary，监测 docs commit、endpoint/schema、board availability、错误率和 coverage drift。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted concept/capability/access-method snapshot、evidence hash、normative schemas、rights/retention 和 board roster 契约；从 `modeled` 到 `verified` 需要离线 fixture report，并经用户授权完成有限公开 board sandbox。当前不授权这些动作。
