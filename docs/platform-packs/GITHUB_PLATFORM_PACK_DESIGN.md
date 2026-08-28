# GitHub Platform Pack 设计样本

状态：`researched` 设计候选；未发布、未接入、未运行 live probe  
核验日期：2026-08-25  
目标：用一个官方 API 较完整的非社交需求场域，验证 Platform Pack 的概念、能力、Skill、开源 Artifact 和分级测试模型。

## 1. Pack 摘要

```text
pack ref             github-demand-research/v0-design
platform             github.com
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review only
callable routes      none
external effects     none
```

这不是“GitHub 已接入”的声明。当前只证明官方产品面和候选实现存在；没有 ConnectorInstance、账号授权、fixture report、sandbox run 或 operational canary，因此所有 route 仍是 `registered-only`。

GitHub 对开发者工具、API、基础设施和 B2B 软件的需求研究价值较高：Issues 和 Discussions 能表达问题、期望、替代方案、维护成本与反例；release、代码 workaround 和 issue event 可以补充变化过程。但 issue、comment、star 或 reaction 都不是购买意愿，必须与使用、预算、迁移或 Probe 证据组合。

本 Pack 作为 [Public Software Issues / Maintenance Friction Channel Pack](PUBLIC_SOFTWARE_ISSUES_CHANNEL_PACK_DESIGN.md) 的成员，映射到通用 `SoftwareWorkItemDefinitionMetadata`、`SoftwareWorkItemRecordMetadata` 与 `SoftwareWorkItemSpanMetadata`；该映射保留 Issue/Discussion、Issue Comment/Discussion Comment、event、state reason 和 repository-local taxonomy，不把 source representation 直接升级为需求语义。

## 2. 平台边界

本 Pack 只覆盖 `github.com`。GitHub Enterprise Server 具有独立版本、base URL、功能和管理员政策，后续应作为单独 platform profile 或明确 variant，不默认继承本 Pack 的验证结果。

首版只读范围：

- 公开 repository 的 Issue、Issue Comment 和有限 repository metadata；
- 获得明确授权后读取 repository Discussions；
- 自有/已授权 repository 的 webhook ingress；
- 不读取 private repository，除非用户另行建立 connector、最小权限和用途；
- 不创建 issue/discussion/comment，不自动推广，不分析个人开发者档案。

### 2.1 使用条款与治理边界

官方 API 可访问不等于数据可任意再利用。GitHub API Terms 禁止滥用 API、过量请求、垃圾信息和出售个人信息，且所有 API 使用仍受 GitHub Terms 与隐私政策约束：[GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)。Acceptable Use Policies 还限制过量自动化批量活动、未经请求的广告，以及不当收集或利用个人信息：[GitHub Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)。

因此本 Pack 的默认 policy 是：

- 仅用于聚合问题、需求模式、产品摩擦与解决方案缺口，不用于招聘名单、销售线索、个人信誉评分或开发者画像；
- canonical observation 默认不保存登录邮箱等个人字段；作者标识只在去重、对话结构或证据追溯确有必要时，以最小化、可删除的受限字段保存；
- 不依据公开 issue/comment 自动联系作者，不生成或执行未经请求的推广、评论、mention 或私信；
- 尊重 API rate-limit、repository visibility、删除/隐藏状态、用途限制、retention 与删除请求；研究 projection 不能恢复已被策略剥离的个人字段；
- 若具体研究、再发布或数据保留用途超出上述边界，必须重新做 terms/privacy review，而不是继承本 Pack 的 `researched` 状态。

## 3. Platform Concepts

以下是平台原生概念候选，不是具体 GitHub 数据：

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `github.account/v1` | entity | node ID | user 或 organization；默认只作来源/所有者上下文，不建立个人画像 |
| `github.repository/v1` | entity | repository node ID / database ID | Issues、Discussions、release 和代码的容器；visibility/archived/disabled 会影响读取 |
| `github.issue/v1` | entity | issue node ID；repo + number 为可读定位 | 问题、需求或工作项；必须排除带 `pull_request` key 的 PR |
| `github.pull-request/v1` | entity | pull request node ID | REST Issues endpoint 可能返回；不能误当普通 issue 计数 |
| `github.issue-comment/v1` | entity | comment node ID / database ID | Issue 与 PR 共享的 conversation comment；不同于 review comment |
| `github.issue-event/v1` | event | event node/database ID | label、assign、close、reopen、transfer 等活动；用于解释生命周期 |
| `github.discussion-category/v1` | enumeration/entity | category node ID | Discussion 的分类和回答语义上下文 |
| `github.discussion/v1` | entity | discussion node ID / repo + number | 论坛式问题、公告、想法或 Q&A；可有 answered 状态 |
| `github.discussion-comment/v1` | entity | comment node ID | Discussion thread 回复；不要与 Issue Comment 合并原始类型 |
| `github.label/v1` | entity | label node ID；name 仅在 repository 内有意义 | `bug`、`enhancement` 等用户定义分类，不是跨 repo 标准 taxonomy |
| `github.milestone/v1` | entity | milestone ID；repo + number | 计划窗口和工作集合，不等同公开 roadmap 承诺 |
| `github.webhook-delivery/v1` | event | delivery ID | push ingress 去重与审计信封，不是业务对象 |
| `github.rate-limit-state/v1` | metric/state | resource + reset time | primary/search/GraphQL 等预算状态，不能合并成单一全局额度 |

主要关系：

```text
account/organization ── owns ──> repository
repository ── contains ──> issue ── has ──> issue-comment
repository ── contains ──> discussion ── has ──> discussion-comment
issue ── classified-by ──> label
issue ── scheduled-in ──> milestone
issue ── transitions-via ──> issue-event
webhook-delivery ── carries ──> issue/issue-comment/discussion event
```

### 3.1 不能提前规范化掉的差异

- GitHub REST 把每个 Pull Request 也视为 Issue；必须依据 `pull_request` key 分流。[Issues API](https://docs.github.com/en/rest/issues/issues)
- Issue Comment 与 Pull Request Review Comment 是不同资源和 API。
- Label 名称、颜色和含义由 repository 自定义；跨 repository 聚类只能是派生 projection。
- `closed` 可能是 completed、not planned 或其他上下文；不能统一解释为“问题解决”。
- transferred/deleted/unauthorized 可能分别表现为 301、410 或 404；tombstone 与权限丢失不能仅靠状态码猜测。

## 4. Capability 候选

这些 ID 是 knowledge proposal，不是已经注册的 normative capability：

| Capability | Subject → Result | Access | Effect | 首版决策 |
| --- | --- | --- | --- | --- |
| `discovery.search.issues/v1` | query → issue/pull-request refs | public/authorized | none | P0，必须用 `is:issue` 或结果分流 |
| `content.read.issue/v1` | issue ref → issue revision | public/authorized | none | P0 |
| `engagement.read.issue-comments/v1` | issue ref → issue-comment revisions | public/authorized | none | P0 |
| `change.read.issue-events/v1` | repository/issue → issue-event revisions | public/authorized | none | P1 |
| `discovery.list.discussions/v1` | repository/category → discussion refs | authorized | none | P1，GraphQL |
| `content.read.discussion/v1` | discussion ref → discussion revision | authorized | none | P1，GraphQL |
| `engagement.read.discussion-comments/v1` | discussion ref → discussion-comment revisions | authorized | none | P1，GraphQL |
| `change.receive.repository-events/v1` | webhook delivery → typed platform events | owned/authorized | local-write | P1，自有或明确授权 repo |

写入能力——创建 issue、discussion 或 comment——不进入首版。GitHub 提供这些 API 不代表系统应把社区发帖作为无人值守 Probe；若未来加入，必须独立定义 create/reconcile capability、社区范围、真实性、批准和反推广政策。

## 5. Access Methods

### 5.1 REST API / 公开读取

- `github-rest-public/v1`
- mode：`official-api`
- 支持：公开 repository issue、comment、event 和 search 的只读子集；部分公共读取可无认证。
- API version 必须固定在 request header。核验时当前受支持版本包括 `2026-03-10` 和 `2022-11-28`；版本接近 sunset 时会返回 Deprecation/Sunset header：[API Versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions)。
- 未认证公共请求按 IP 计 primary rate limit；认证、GitHub App、search 和 secondary limit 有不同预算，必须读取 response headers，不能硬编码一个速率：[REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)。
- Search API 有独立 rate limit、最多返回 1,000 个结果，并可能返回 `incomplete_results`；不能把结果集当全量市场事实：[Search API](https://docs.github.com/en/rest/search/search)。

### 5.2 GraphQL Discussions

- `github-graphql-discussions/v1`
- mode：`official-api`
- 支持：repository discussions、category、answered 状态和 comments 的查询。
- GraphQL Discussions 可读取和修改 discussion；本 Pack 只声明查询。官方指南说明 OAuth token 对 public repository 需要 `public_repo`，private repository 需要 `repo`；GitHub App 应另按实际 query 验证最小权限：[Discussions GraphQL](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)。
- GraphQL cost、cursor、partial data/errors 与 REST 分开建模。

### 5.3 GitHub App Webhooks

- `github-app-webhooks/v1`
- mode：`official-api`
- 支持：在 App 被安装且获得必要 permission 的 repository 接收 issues、issue_comment、discussion 等事件。
- GitHub App 默认无权限；权限决定 API 和 webhook 可见范围，应选择最小权限：[Choosing GitHub App permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)。
- delivery 先持久化、验签和按 delivery ID 去重，再 ack；payload 类型依据官方 webhook event catalog：[Webhook events](https://docs.github.com/en/webhooks/webhook-events-and-payloads)。

### 5.4 Events API 轮询

- `github-events-poll/v1`
- mode：`official-api`
- 仅作为低优先级补充。Events API 支持 ETag 和 `X-Poll-Interval`，但官方说明 repository event 延迟可能从约 30 秒到 6 小时，不适合实时事实：[Events API](https://docs.github.com/en/rest/activity/events)。

## 6. Platform Skills

### 6.1 `github-pack-research/v1`

- purpose：`research/curate`
- 输入：平台知识 snapshot、待核验 claim、官方 URL 或 changelog；
- 输出：带 EvidenceLink 的 KnowledgeProposal；
- 允许：读取官方 docs、API version、permission、rate-limit 和 changelog；
- 禁止：运行外部 MCP、安装 SDK、读取用户 repo、生成 callable 声明。

### 6.2 `github-demand-research/v1`

- purpose：`acquire`
- knowledge：必须固定 snapshot ID；
- capability allowlist：search/read issue、read issue comments、可选 discussions read；
- required ports：`pull-read`；
- allowed effects：`none/local-write`；
- 输出：Observation，保留 concept ref、repository、issue/PR distinction、API version、query 和 search completeness；
- 禁止：create/update issue、comment、discussion；禁止按作者建立画像；禁止向任意社区发 Probe。

### 6.3 `github-conformance/v1`

- purpose：`verify/diagnose`
- 只运行已登记 VerificationPlan；
- fixture 默认无网络；sandbox 仅使用公开 repo 或用户自有测试 repo；
- 任何 token 只以 credential ref 注入隔离 adapter，不能进入 Skill、fixture、日志或报告；
- live failure 只能记录 blocked/inconclusive，不得自动扩大 scope。

## 7. 开源 Artifact 候选

这里只做 evidence review，未固定本地依赖、未安装、未执行：

| Artifact / observed revision | Ownership / License | 候选价值 | 风险与采用边界 |
| --- | --- | --- | --- |
| [Octokit](https://github.com/octokit/octokit.js) `bc34deaf357486594c41f167c05921d16e6aabe9` | GitHub 官方 SDK 组织；MIT | REST/GraphQL/App/Webhook auth、pagination、throttling 的实现候选；REST methods 来自 GitHub OpenAPI | 此 commit 只固定研究证据，不是依赖决策；SDK 重试不能绕过本系统 checkpoint、预算和 error taxonomy |
| [GitHub MCP Server](https://github.com/github/github-mcp-server) `822c87761f8587395b3e1a04b5386b2611252cd1` | GitHub 官方；MIT | 已有 issues/discussions/repos toolsets、tool allowlist 和 read-only mode，可作为 delegated tool/Skill 研究样本 | 此 commit 只固定研究证据；默认 toolsets 含写能力面，必须显式 read-only + tool allowlist。其 lockdown 是 prompt-injection 缓解，不是 authorization boundary，仍需 DSH policy/credential 隔离 |

两个 revision 于 2026-08-25 通过只读 `git ls-remote <repo> HEAD` 核验；没有 clone、安装或执行上游代码。若进入 adapter spike，必须重新固定 release/commit、生成 digest/SBOM 并审查从该 revision 到采用 revision 的差异。

MCP server 不直接成为 Connector。若未来采用，仍需要 MCP tool → CapabilityRef → typed port → Observation 的 mapping、固定版本、输入/输出 schema、fixture 和 sandbox report。

## 8. Verification Plan

### 8.1 evidence-review

| Scenario | 预期 |
| --- | --- |
| REST/GraphQL/Webhook 官方文档可访问 | 记录 title、URL、checkedAt、API version 和证据哈希 |
| capability/access method 对齐 | 每项 capability 都有 subject/result concept 和官方入口 |
| OSS ownership/license | Octokit/GitHub MCP 的官方性、license、source 和版本可固定 |
| 未证实 claim | 公共 Discussions 无认证、全量搜索、无限速率、MCP 自动安全等 claim 必须拒绝 |

当前结果：官方证据已收集，满足设计态 `evidence-review`；尚未生成内容哈希和 commit snapshot，因此不能发布为 verified Pack。

### 8.2 static-contract

待实现前测试：

- concept ref 和 capability subject/result 完整；
- repository definition、primary item、comment/reply、event和selected span可无损映射到`SoftwareWorkItem*`，且native concept仍保留；
- Issue 与 Pull Request 必须互斥映射；
- Issue Comment 与 Review Comment schema 不混用；
- Search CollectionRun 必须携带 query/plan ref、API version、observedAt 和 `CoverageAssessment`；`incomplete_results=true` 时不得标记为 `complete`；
- REST/GraphQL/webhook cursor 与 checkpoint 不共用 opaque 格式；
- Skill 只允许声明的 read capability/effect；
- credential、login、email、raw token 不得进入 canonical ID、日志或 metric dimension。

### 8.3 fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| mixed issue/PR search page | 根据 `pull_request` key 分流；不重复计数 |
| Link pagination + overlap | 翻页、中断恢复、同 timestamp overlap 和 ID 去重 |
| `incomplete_results=true` | 标记覆盖不完整，禁止生成“全量”结论 |
| raw/text/html bodies | raw 内容进 evidence；派生 text 不覆盖原始正文 |
| transferred/deleted/hidden issue | 301、410、404 分别进入 transfer/tombstone/unknown-authority 流程 |
| comment update/minimize | 新 revision 保留 previous；不可原地覆盖证据 |
| rate-limit responses | primary/search/secondary 分类，尊重 remaining/reset/retry-after |
| GraphQL partial response | data 与 errors 同时保存，结果状态为 partial |
| repeated webhook delivery | 先持久化、按 delivery ID 去重、再 ack |
| revoked permission | authorization 变 blocked，不把 404 自动解释为删除 |

### 8.4 sandbox-live

需要用户另行授权后才可执行：

1. 无认证读取一个公开测试 repository，记录 primary/search headers；
2. 用最小权限 GitHub App 安装到用户自有 sandbox repository；
3. 读取 seeded issue/comments/discussion，覆盖 pagination 和 GraphQL cursor；
4. 接收 issues/issue_comment webhook，验证 signature、delivery dedupe 和 ack；
5. 撤销 permission/卸载 App，验证 connector 进入 blocked；
6. 删除/transfer sandbox issue，核对 REST 与 webhook 的 tombstone 解释；
7. 全程不创建外部内容，不访问非授权 private repository。

### 8.5 operational-canary

只有 sandbox 通过后才设计：

- 固定 API version 和 adapter/Skill commit；
- 定期只读一个自有 canary repository；
- 监测 endpoint/schema hash、Deprecation/Sunset、rate-limit、GraphQL cost、fixture drift；
- 监测 Octokit/MCP release、license/security/archived 状态；
- capability report 到期自动进入 reverify，不自动续期 production。

## 9. Projection 与需求解释

推荐 projection：

- lexical：错误码、产品/API 名、替代方案、价格/配额词；
- facet：repository、label、issue type、state reason、discussion category、时间；
- temporal：重复 issue、更新/关闭周期、相同 workaround 反复出现；
- relation：issue → workaround/library/release/competitor；
- semantic：相似痛点，但必须保留每条 source revision。

禁止推断：

- stars、reaction 或 comment 数直接等于需求强度；
- author association 等于购买决策权；
- closed 等于 solved；
- search 未命中等于需求不存在；
- 多 repository 同用户名自动归并为个人画像。

## 10. Drift Signals

| Drift | 处理 |
| --- | --- |
| REST API version Deprecation/Sunset | reverify 新版本；旧 route 到期前保持明确版本 |
| Search limit/query behavior 变化 | fixture + coverage semantics reverify |
| GraphQL schema/cost/permission 变化 | discussions capability 局部 degrade |
| Webhook event/payload/permission 变化 | push route suspend，pull route不连带失效 |
| Octokit/MCP release 或 security finding | artifact audit；不自动升级 |
| MCP toolset/alias 变化 | mapping/allowlist fixture 失败即 suspend delegated route |
| GitHub App permission 撤销 | connector blocked；不影响 platform knowledge existence |

## 11. Pack 晋级缺口

从 `researched` 到 `modeled`：

- 将本文件中的 concept/capability/access-method 候选转成 accepted KnowledgeProposal；
- 分配 normative SchemaRef、snapshot ID 和 evidence hash；
- 解决 GitHub.com 与 GHES variant、public data retention 和 user de-identification 规则。

从 `modeled` 到 `verified`：

- 有版本化 fixture 和 conformance report；
- 选择一个 adapter 候选并固定版本；
- 经用户授权完成 sandbox-live；
- 对每项 capability 分别发布 maturity 和 expiresAt。

本样本不授权这些后续动作。
