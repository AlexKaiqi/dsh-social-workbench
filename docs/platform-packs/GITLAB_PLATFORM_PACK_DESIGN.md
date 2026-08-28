# GitLab Software Work Items Platform Pack 设计

状态：`researched` 设计候选；GitLab.com 广域采集 `policy-blocked`；未发布、未接入、未运行 live probe  
核验日期：2026-08-26  
目标：为 GitLab issue、work item、note、discussion 和 resource event 建立可追溯的只读研究契约，并明确 GitLab.com 与 Self-Managed/Dedicated 的政策和版本边界。

## 1. Pack 摘要

```text
pack ref             gitlab-software-work-items/v0-design
platform variants    gitlab.com rolling / self-managed pinned / dedicated pinned
state                researched
verified level       evidence-review only
callable routes      none
gitlab.com bulk      policy-blocked
external effects     none
```

GitLab 的 project issue/work item 很适合发现软件失败、版本回归、维护摩擦、复现步骤、临时变通和未满足需求。它们仍然是协作记录，不是购买意愿；`closed`、upvote、note 数或 maintainer activity 也不自动证明问题已解决、需求强或用户满意。

本 Pack 不代表已获准采集 GitLab.com。现行 [GitLab API Terms](https://handbook.gitlab.com/handbook/legal/api-terms/) 第 1.3.9 条禁止通过 API 批量收集、抓取或重复/系统性批量导出 GitLab API Data，并明确包括 code、epic、issue 和 merge request content。因此：

- GitLab.com 的跨项目市场扫描、全量历史回填和持续语料库构建默认 `policy-blocked`；
- 单对象查看、小范围用途明确的研究也要记录用途、选择边界和适用条款，不能用“小批次循环”规避禁令；
- Self-Managed/Dedicated 必须固定实例版本、客户协议、实例管理员政策、组织批准和数据主体范围；“实例由客户控制”不自动等于允许任意二次利用；
- 任何超出本 Pack 的用途需要单独 legal/terms review。本文件只做工程边界建模，不给出法律意见。

## 2. Variant 与版本边界

GitLab REST 使用 `/api/v4`，但 minor version 不在 URL 中；同一 v4 会随 GitLab release 增加字段和能力。[REST versioning](https://docs.gitlab.com/api/rest/#versioning-and-deprecations) 还明确指出 experimental、beta 和 feature-flag 字段不享受完整 deprecation 保护。

所以每个 ConnectorInstance 必须记录：

- offering：GitLab.com、Self-Managed 或 Dedicated；
- canonical host、instance version/build、edition/tier 和 feature flags；
- REST v4 文档/Schema snapshot、GraphQL introspection hash 和 MCP tool-schema hash；
- Work Item、Search、keyset pagination、webhook signing token 等能力的实际 availability；
- applicable agreement/data-use decision 与到期时间。

GitLab.com 是 rolling variant；Self-Managed/Dedicated 必须按确切版本验证，不能继承核验日的在线文档。Work Item GraphQL 当前仍含 experimental surface，应按 schema item 分别发布 maturity：[Work Item migration guide](https://docs.gitlab.com/api/graphql/epic_work_items_api_migration_guide/)。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `gitlab.instance/v1` | container | canonical host + pinned instance variant | GitLab.com 与每个 Self-Managed/Dedicated 实例是不同 authority |
| `gitlab.namespace/v1` | container | global namespace/group ID | group/subgroup；名称与 path 可变 |
| `gitlab.project/v1` | container | global project ID | issue/work item 的权限、label、milestone 和 webhook 边界 |
| `gitlab.issue/v4` | work item | project ID + issue IID；global issue ID 辅助 | REST issue；`iid` 只在 project 内唯一 |
| `gitlab.work-item/graphql` | work item | global GraphQL ID + namespace/project context | Issue、Incident、TestCase、Requirement、Task、Ticket、Objective、KeyResult、Epic 等类型；schema maturity逐字段固定 |
| `gitlab.note/v4` | child record | project + noteable + note ID | authored comment 或 system note；`system`、`internal`、`confidential`、`imported` 不可丢 |
| `gitlab.discussion/v4` | child container | noteable + discussion ID | root note与threaded `DiscussionNote`；不能退化成无结构评论数组 |
| `gitlab.resource-state-event/v4` | event | resource + event ID | close/reopen等状态变化；不记录初始 opened/created |
| `gitlab.resource-label-event/v4` | event | resource + event ID | label add/remove；不同于自由文本 system note |
| `gitlab.resource-milestone-event/v4` | event | resource + event ID | milestone变化 |
| `gitlab.resource-iteration-event/v4` | event | resource + event ID | iteration变化；tier/版本相关 |
| `gitlab.resource-weight-event/v4` | event | resource + event ID | weight变化；不是需求强度 |
| `gitlab.issue-link/v4` | relation | source/target issue + observed link ID/tuple | `relates_to`、`blocks`、`is_blocked_by`；必须保留方向 |
| `gitlab.label/v4` | taxonomy entry | project/group-scoped label ID | 同名label不代表跨项目同义 |
| `gitlab.milestone/v4` | planning object | project/group milestone ID | 计划容器，不是交付承诺 |
| `gitlab.webhook-delivery/v1` | delivery | `webhook-id`/`Idempotency-Key` + hook UUID | retries保持message ID；delivery不是业务对象 |

主要关系：

```text
instance -> namespace -> project -> issue/work-item
issue/work-item -> note | discussion -> discussion-note
issue/work-item -> resource event | label | milestone | iteration
issue <-> issue-link
issue/work-item -> exact merge-request/commit/release relation
webhook-delivery -> work-item/comment/emoji event
```

### 3.1 不能提前抹平的差异

- `id` 是实例级对象 ID，`iid` 是 project 内部 ID；canonical key 不能只存 IID。[REST id vs iid](https://docs.gitlab.com/api/rest/#id-vs-iid)
- REST Issue、GraphQL WorkItem、Search `work_items` result 和 webhook payload 是不同 representation，不因指向同一页面就共享 schema/version。
- Note API 同时返回评论和 system records；部分系统变化又只在独立 resource event API 中出现。[Notes API](https://docs.gitlab.com/api/notes/)
- Discussion 是 thread，`DiscussionNote` 不从普通 Note API 完整返回。[Discussions API](https://docs.gitlab.com/api/discussions/)
- state events 不含初始状态；空列表不等于“没有生命周期”。[Resource state events](https://docs.gitlab.com/api/resource_state_events/)
- `opened`/`closed`、custom status、health、discussion lock、answered/accepted answer 是不同轴；不得压成 solved boolean。
- confidential/internal/private 内容与“对当前 credential 返回”不是同义；404 也可能是无权访问，不可直接生成删除 tombstone。
- issue move/clone/promotion/work-item conversion 会产生新 identity 或 relation；不能用标题/正文 hash 覆盖原记录。
- Merge Request 是代码变更对象。即使 issue、note、search 或 webhook API 同时暴露其引用，也不把 MR 当需求 item 计数。

## 4. Capability 候选

以下均是 knowledge proposal，不是 callable route：

| Capability | Subject → Result | Access / effect | 决策 |
| --- | --- | --- | --- |
| `taxonomy.read.software-work-item-definition/v1` | project/namespace → type/status/label/milestone definition | authorized / none | P0，固定definition revision |
| `discovery.list.software-work-items/v1` | pinned project/query → work-item refs | public或authorized / none | GitLab.com background bulk blocked；Self-Managed需协议+组织批准 |
| `discovery.search.software-work-items/v1` | query → work-item refs + coverage | authenticated / none | Search API offset；search type/tier必须固定 |
| `content.read.software-work-item/v1` | exact ref → observed item revision | public或authorized / none | P0，单对象读取与批量list成熟度分开 |
| `engagement.read.software-work-item-notes/v1` | item ref → authored/system note revisions | authorized / none | activity_filter与internal/confidential coverage显式 |
| `engagement.read.software-work-item-discussions/v1` | item ref → discussion/note revisions | authorized / none | thread关系与Note API分开 |
| `change.read.software-work-item-events/v1` | item ref → typed resource events | authorized / none | state/label/milestone/iteration/weight逐类声明 |
| `relation.read.software-work-item-links/v1` | item ref → exact issue/work-item relations | authorized / none | 只保存provider exact relation |
| `change.receive.software-work-item-events/v1` | verified delivery → typed observations | owned/authorized / local-write | push只作wakeup，必须pull reconcile |

create/update/delete issue/work item、comment/reply、emoji、label、move/clone/link、resolve discussion 和 webhook configuration 都是写能力，不进入首版。GitLab quick actions 还可能让一段 note 文本触发状态变化；未来任何 Probe 都必须同时验证正文和 quick-action 副作用。

## 5. Access Methods

### 5.1 REST Issues / Notes / Discussions / Resource Events

- mode：`official-api`；base path `/api/v4`。
- [Issues API](https://docs.gitlab.com/api/issues/) 可按 project/group/global context、state、issue type、labels、created/updated window 等过滤。全局 `/issues` 默认 `scope=created_by_me`，要列可见全集需显式 `scope=all`；默认值本身必须进入 query contract。
- REST list 默认每页20，最大通常100。offset是通用方法；keyset只对部分资源/排序组合可用，project issues 从 GitLab 18.3 起才列入支持范围。[REST pagination](https://docs.gitlab.com/api/rest/#pagination)
- GitLab.com 对超过10,000结果的查询可能省略 total/total-pages/last headers；“翻到没有next”只证明当前查询游标耗尽，不证明市场总体完整。
- 增量读取冻结 project roster、state/type/filter/order、`updated_after/before` 和 overlap window；同一 timestamp 以 global ID 去重，mutable item追加 observed revision。

### 5.2 Search API

- mode：`official-api`；所有调用要求认证。[Search API](https://docs.gitlab.com/api/search/)
- `issues` 与 `work_items` scope、basic/advanced/exact search、global/group/project scope和tier不可混用；comments/notes搜索可用性也依赖search variant/version。
- Search使用offset pagination，相关性结果可能在翻页期间重排。CollectionRun必须保存完整query、search type、scope、tier、project/group roster、page boundary和coverage，不能把未命中解释为没有需求。

### 5.3 GraphQL Work Items

- mode：`official-api`，endpoint `/api/graphql`，versionless但schema持续演化。
- Work Item widget/type能力按GitLab version、tier和feature state变化；experimental字段不继承稳定性。
- 每次route发布固定 introspection hash、query document hash、deprecated-field result 和最大complexity。官方默认大部分connection最多100 nodes/page，unauthenticated/authenticated complexity默认200/250，request timeout 30秒。[GraphQL limits](https://docs.gitlab.com/api/graphql/#limits)
- `data` 与 `errors` 并存时记录partial；不能只保存data并声称完整。

### 5.4 Authentication 与最小权限

- 未认证请求只在具体endpoint说明允许时读取public subset；大多数请求需要OAuth、personal/group/project access token等。[REST authentication](https://docs.gitlab.com/api/rest/authentication/)
- 首选资源范围最窄的project/group token或OAuth，并只申请`read_api`；`api`授予完整读写API，不能因adapter只调用GET就宣称credential least-privilege。[Access token scopes](https://docs.gitlab.com/security/tokens/access_token_scopes/)
- token只能以credential ref存在Host；不得进入Pack、Skill、日志、fixture、Git、browser payload或metric dimension。

### 5.5 Project/Group Webhooks

- mode：`official-api`；只能由有权的Maintainer/Owner配置，配置本身是平台写入。
- GitLab 19.0引入Standard Webhooks风格的`webhook-id`、timestamp和HMAC-SHA256 signing token，19.1 GA；旧实例的`X-Gitlab-Token`只是明文共享值，不能证明payload integrity。[Webhooks](https://docs.gitlab.com/user/project/integrations/webhooks/)
- `Idempotency-Key`从17.4开始可用且retry保持一致；receiver先保存原始信封、按message ID去重、验签和timestamp freshness，再ack。
- project与group hook可能同时发送相同业务事件；custom webhook template还可能改写payload。必须固定hook UUID、template hash和scope，并以pull reconcile补漏。
- GitLab会对连续失败的hook临时或永久禁用；`2xx` ack只证明接收，不证明后续canonicalization完成。Issue/work item、comment和emoji event应分开schema。[Webhook events](https://docs.gitlab.com/user/project/integrations/webhook_events/)

## 6. Platform Skills / Delegated Tools

### 6.1 `gitlab-pack-research/v1`

- purpose：核验官方docs、API/schema history、instance variant、terms、scope、rate和artifact revision；
- output：带EvidenceLink的KnowledgeProposal；
- 禁止：账号授权、执行MCP/glab、读取真实project或安装skill。

### 6.2 `gitlab-software-work-item-research/v1`

- purpose：对固定project roster和query读取已批准的数据；
- required knowledge：instance/version、definition revision、data-use decision、selection boundary；
- allowlist：list/search/read item、notes/discussions/events/links中的已验证子集；
- output：`Observation.SoftwareWorkItem`，保留item/record identity、native type/state、record kind、history/coverage和rights；
- 禁止：扩大roster、读取confidential/internal身份字段、调用write、执行quick action或向平台发布Probe。

### 6.3 官方 GitLab MCP Server

GitLab提供Beta远程MCP endpoint `/api/v4/mcp`，通过OAuth Dynamic Client Registration授权，并明确提醒调用方防范prompt injection：[GitLab MCP server](https://docs.gitlab.com/user/model_context_protocol/mcp_server/)。其tool catalog同时包含`get_issue`、`search`、work-item读取，也包含`create_issue`、`save_work_item`、comment/review、branch和pipeline等写能力：[MCP tools](https://docs.gitlab.com/user/model_context_protocol/mcp_server_tools/)。

因此它只能作为 `delegated-api` 研究候选：

- 不把“官方MCP”当Connector或least-privilege证明；
- 按instance version + MCP server version + tool-list/schema hash固定；
- DSH侧必须再做capability allowlist、effect gate、prompt-injection隔离、result→Observation mapping和negative-write fixture；
- 本轮未连接、未授权、未调用。

### 6.4 官方/官方维护的 Agent Skills

`glab` v1.114.0内置实验性Agent Skills安装能力；`glab` Skill同时指导issue/MR读写、评论和raw API调用，不适合作为只读研究权限边界。[glab skills](https://docs.gitlab.com/cli/skills/)。本 Pack只把固定SKILL内容用于命令语义、危险动作和fixture研究，不安装或执行。

GitLab Duo也支持project/user `SKILL.md`，但Skill是知识与工作流，不授予API权限，也不证明命令安全：[Agent Skills](https://docs.gitlab.com/user/duo_agent_platform/customize/agent_skills/)。

## 7. 固定开源 Artifact 候选

以下revision于2026-08-26通过只读`git ls-remote`或固定commit raw文件核验；只读了README/LICENSE/metadata/SKILL，没有clone、安装或执行：

| Artifact / fixed revision | Ownership / License | 候选价值 | 采用边界 |
| --- | --- | --- | --- |
| [GitLab client-go](https://gitlab.com/gitlab-org/api/client-go) v2.51.0 `91d04ac66c17f5a6a04074d523c3a7ea226e8d04` | GitLab namespace；Apache-2.0；官方docs仍将third-party clients列为community-maintained/not officially supported | REST object/pagination/webhook types、mock与Self-Managed base URL参考 | `reference-only`；client含全量写方法，retry不得绕过budget/checkpoint；版本支持不等于instance schema一致 |
| [GitLab CLI glab](https://gitlab.com/gitlab-org/cli) v1.114.0 tag object `4ad2989a…`，commit `4d7c6cda781ab2922c6f207d50cf744461c0e965` | GitLab维护；MIT | issue/work-item/API/MCP命令和官方bundled Skill语义 | `schema-discovery-only`；认证建议包含宽写scope；Skill含create/note/update动作，不执行 |
| `glab` bundled `glab/SKILL.md` blob `2994560c217027e4d9ad00ba76bf16fc88eee2c4`（同v1.114.0） | 随glab MIT；experimental | Agent Skill packaging、command pitfalls和write surface审计 | 不安装；不能整体加入acquire Skill；只能人工摘取已审查的read-only知识 |
| [gitlab-org/ai/skills](https://gitlab.com/gitlab-org/ai/skills) `27cf0dc8a0874e77c67063611f4d359f0e28dd9f` | GitLab B.V.；MIT | 官方Skill目录、跨agent布局与评测流程参考 | 大多是GitLab工程内部工作流，不是数据Connector；每个Skill独立审计 |
| [Airbyte source-gitlab](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-gitlab) `1339a9e…`; image `4.4.37`; manifest `6.56.8` | Airbyte certified/GA；ELv2 | project/group/issue schema、`updated_at` cursor、date window、rate headers和Self-Managed URL fixture参考 | `reference-only`；issues stream无notes/discussions/resource events；默认多stream和`scope=all`远超最小面；不得用来绕过GitLab API Terms |

没有候选被安装、执行或声明为dependency。进入adapter spike前需重新固定release/commit、digest/SBOM、license/security状态，并对选定route做最小代码审查。

## 8. Verification Plan

### 8.1 evidence-review

- 官方Issues/Notes/Discussions/Resource Events/Search/REST/GraphQL/Webhook/Terms链接可访问并记录checkedAt；
- GitLab.com、Self-Managed、Dedicated和GitLab version不共享隐式maturity；
- GitLab.com bulk collection policy gate在route resolution之前执行；
- client-go、glab、bundled Skill、AI Skills和Airbyte ownership/license/revision可追溯；
- 未证明的“public等于可批量采集”“MCP官方等于只读”“404等于deleted”“closed等于solved”claim被拒绝。

当前结果：满足设计态evidence review；未生成文档hash/snapshot release，仍不可调用。

### 8.2 static-contract

- `SoftwareWorkItemDefinitionMetadata`固定host/variant/project与native taxonomy；
- primary item、authored comment、thread reply、system note、resource event和reaction summary互斥映射；
- project ID + IID和global ID均有fixture，canonical identity不碰撞；
- provider state/reason与reviewed lifecycle同时存在，lock/answered为正交字段；
- credential为`api`宽scope时必须报告`least_privilege=false`；
- GitLab.com bulk policy deny不能由adapter、MCP、Skill或fallback route覆盖；
- create/update/note/emoji/link/move/hook config均未出现在read capability allowlist。

### 8.3 fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| 两project相同IID | canonical key不同，global ID与project scope正确 |
| Issue REST + WorkItem GraphQL representations | exact relation可关联，payload/schema/revision不互相覆盖 |
| note/system/discussion混合页 | authored comment、system note、DiscussionNote和thread root分离 |
| empty resource state events | 标为`initial-state-not-covered`，不宣称完整history |
| label/state/milestone独立events | 同一变化不因system note重复计数；exact native relation保留 |
| confidential/internal/404 | policy隔离；404进入unknown-authority，不自动tombstone |
| moved/cloned/converted item | append relation和新identity，旧record不覆盖 |
| updated_at同秒/late edit | overlap、global ID去重、observed revision追加 |
| offset/keyset/search分页 | query/sort不变；缺失headers、重排和>10K均降级coverage |
| GraphQL data+errors/deprecation | partial result；schema hash与future-removal检查 |
| legacy webhook token | 只证明shared-secret match，不冒充payload integrity |
| signed webhook/retry/replay | raw-body HMAC、timestamp window、message-ID dedupe、先持久化后ack |
| group+project duplicate hook | 同delivery不同hook/同业务event精确去重且保留delivery audit |
| custom webhook template | template hash改变触发schema reverify |
| MCP/glab/Skill negative writes | 所有create/note/update/link/emoji/branch/pipeline动作被policy拒绝 |
| GitLab.com bulk plan | resolution在发网络请求前`policy-blocked`，无自动分片规避 |

### 8.4 sandbox-live

只有用户另行授权且适用协议审查通过后才可执行：

1. 优先使用用户控制的Self-Managed sandbox或专用测试project，固定instance version；
2. seed issue/work-item、authored note、system note、thread、resource event、exact link和confidential negative case；
3. 仅用`read_api`或更窄的project-scoped credential验证list/detail/pagination/revoke；
4. 如验证webhook，由用户显式创建测试hook，覆盖legacy或19.1+signature variant、duplicate、disable和pull reconcile；
5. 不连接官方MCP、不运行glab/Airbyte、不创建对真实用户可见的内容；
6. 测试结束撤销credential/hook，并记录cleanup receipt。

GitLab.com live collection在本Pack仍保持blocked，除非另有可审计的条款/授权决定；技术token不是该决定。

### 8.5 operational-canary

- 固定一个自有canary project和无个人内容的fixture；
- 监测instance/version/tier/feature flag、REST/OpenAPI/GraphQL/MCP schema hash、deprecated removal和work-item type drift；
- 监测pagination/header/rate-limit、webhook signature/template/disable状态和reconciliation lag；
- 监测GitLab API Terms、Privacy、client-go/glab/Skill/Airbyte release/license/security/archived状态；
- data-use decision或verification过期自动suspend，不自动切到MCP、CLI、browser或其他host。

## 9. Projection 与需求解释

推荐动态物化视图：

- `software-problem-spans`：reviewed title/body/comment中的问题、环境和期望结果；
- `regression-by-version`：只用明确版本/commit/release relation，不从时间邻近推断；
- `workaround-and-maintenance-cost`：命令、配置、手工步骤和重复修复；
- `maintainer-response-state`：首个回应、请求复现、closed/reopen，但不命名为resolved；
- `duplicate-lineage`：只以native duplicate/move/explicit relation为authority；semantic similarity只产候选；
- `unresolved-evidence-gaps`：missing notes/events、partial search、permission unknown、deleted/redacted和history gap。

索引只保存最小span和revision ref。code/log extract先做secret/PII扫描与rights decision；issue作者、assignee、reaction actor和email不进入默认向量索引。

禁止推断：

- closed/duplicate/answered等于用户问题已解决；
- upvote/downvote/reaction/comment count等于需求强度或独立用户数；
- label `bug`/`priority`/`customer`在跨project具有统一含义；
- author association、role或contribution等于客户、购买者或公司雇员；
- search未命中等于没有需求；
- 相似issue自动为同一问题，或同用户名自动为同一自然人。

## 10. Observability 与 Drift

每条route除通用operation/connector/route维度外，还观测：

- host variant、instance version、tier、feature flags、REST/OpenAPI/GraphQL/MCP schema hash；
- data-use decision、policy-gate result/reason/expiresAt、project roster和selection/query hash；
- item/note/discussion/resource-event各自seen/selected/indexed/quarantined/tombstoned数量；
- ID/IID collision、unknown native type/state/reason、system-vs-authored unknown和exact-relation rejection；
- offset/keyset/search page gap、missing pagination headers、overlap duplicates、late edits和coverage distribution；
- permission/confidential/internal/404 unknown、redaction/delete propagation和restricted-field quarantine；
- rate-limit name/limit/remaining/reset、429/Retry-After和application-limit unknown；
- webhook signature variant、timestamp age、delivery duplicate、template hash、ack latency、disable state和pull reconciliation gap；
- MCP/Skill/glab tool/schema drift与negative-write conformance age；
- projection definition/version、staleness、rebuild reason和source-revision lag。

告警按capability局部degrade：GraphQL WorkItem drift不应自动停REST issue detail；webhook失效转pull reconcile；data-use policy失败则所有受影响route在网络前suspend。

## 11. 晋级缺口

从`researched`到`modeled`：

- 接受concept/capability/schema与`SoftwareWorkItem*` mapping；
- 发布GitLab.com和每个Self-Managed/Dedicated variant的data-use decision；
- 固定REST/OpenAPI/GraphQL schema snapshot与official evidence hash。

从`modeled`到`verified`：

- 通过static-contract与fixture-conformance；
- 选择一个最小adapter候选并固定digest/SBOM；
- 经用户授权完成Self-Managed或专用sandbox live；
- 每项capability分别发布maturity、scope、expiresAt和negative-write report。

本Pack不授权这些后续动作。
