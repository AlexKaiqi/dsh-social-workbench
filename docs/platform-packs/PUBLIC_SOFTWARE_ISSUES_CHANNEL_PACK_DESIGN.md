# Public Software Issues / Maintenance Friction Channel Pack 设计

状态：`researched` 设计候选；组合未发布、未接入  
核验日期：2026-08-26  
成员：[GitHub Platform Pack](GITHUB_PLATFORM_PACK_DESIGN.md)、[GitLab Software Work Items Platform Pack](GITLAB_PLATFORM_PACK_DESIGN.md)

## 1. Channel 目标与边界

这个 Channel 用公开或组织明确授权的软件协作记录发现：

- 可复现的产品/API/工具失败；
- 版本升级或环境组合造成的回归；
- 用户为绕开限制采取的脚本、配置、迁移和人工流程；
- 相同问题跨版本、项目或生态重复出现；
- maintainer请求的复现、替代方案、关闭理由与未解决缺口。

它不把issue tracker变成销售线索库，也不建立开发者画像。单个issue、discussion、comment、reaction或close动作不是购买意愿、独立需求量、市场规模或“已解决”的证明。

```text
channel ref          public-software-issues/v0-design
members              github.com / GitLab variants
overall maturity     researched only
github route         no callable route; evidence-review only
gitlab.com bulk      policy-blocked
self-managed GitLab  authorized-only + pinned agreement/version
probe/write          none
```

## 2. 为什么需要 Channel Pack

GitHub与GitLab都能表达issue、comment和项目状态，但原生模型并不等价：

- GitHub REST Issues会混入Pull Request，Discussions使用GraphQL且有category/answer语义；
- GitLab REST Issue与GraphQL WorkItem并存，Note/Discussion/System Note/Resource Event分层，类型与feature availability随版本、tier变化；
- 两个平台的label、milestone、state reason、author association、reaction和search coverage均为本地定义；
- 平台条款不同。GitHub的可用性不能替GitLab解除API Terms中的bulk restriction；GitLab的实例管理员授权也不能替GitHub repo owner授权私有数据。

Platform Pack负责平台事实与route maturity；Channel Pack只组合固定成员revision、research question、project roster、selection policy、projection policy和evidence rules。它不创建“跨平台万能Connector”。

## 3. 稳定抽象

### 3.1 Definition、Record、Span 三层

`SoftwareWorkItemDefinitionMetadata`固定host variant、namespace/project/repository、native type/state/label/milestone/iteration/relation schema，以及selection、identity、data-use、retention和deletion policy。任何taxonomy、visibility、GitLab version/GitHub API version或data-use变化创建新revision。

`SoftwareWorkItemRecordMetadata`把每个observed revision分成：

- primary item：GitHub Issue/Discussion，GitLab Issue/WorkItem；
- authored comment；
- threaded reply；
- system note；
- state/label/milestone/iteration/relation event；
- reaction summary；
- provider-defined record。

它同时保留item ref/revision和child record ref/revision、native type/state、reviewed lifecycle、actor kind、exact relations、history与comment/discussion/event/reaction coverage。

`EvidenceSpan.SoftwareWorkItem`继续固定item/record/content revision和title/body/comment/reply/accepted-answer/system/state/relation/code-log/attachment/provider-derived role。只有最小、reviewed span进入索引；完整payload、actor profile、assignee、reaction actor、附件、code/log和secret留在受治理存储。

### 3.2 成员映射

| Channel 概念 | GitHub | GitLab | 不可丢失的边界 |
| --- | --- | --- | --- |
| host variant | github.com；GHES另建variant | GitLab.com rolling；Self-Managed/Dedicated固定version | maturity、条款、schema不继承 |
| primary issue | Issue，排除`pull_request` | REST Issue / GraphQL WorkItem | representation和native type保留 |
| forum/Q&A | Discussion + category + answer | Work Item type或project discussion/note model，按实际surface | 不强造跨平台answered语义 |
| authored response | Issue Comment / Discussion Comment | Note / DiscussionNote | author与system/bot分开 |
| system history | Issue Event / timeline item | system note + resource events | structured event优先；重复不重复计数 |
| lifecycle | state + state reason；discussion lock/answer另轴 | opened/closed/custom status；lock/answer另轴 | closed不等于solved |
| relations | transfer、duplicate/linked PR/release等exact native relation | issue links、move/clone/convert、MR/commit/release link | fuzzy similarity只产candidate |
| taxonomy | repository label/category/milestone | project/group label/type/milestone/iteration | 名称不构成跨平台同义词 |
| engagement | reactions/comments | up/downvotes/emoji/notes | 不是independent recurrence |
| search | REST Search，1,000 result cap/incomplete indicator | authenticated Search，offset/search-type/tier | coverage逐member保留 |
| push | GitHub App webhook + signature/delivery | project/group webhook；legacy secret或19.1+HMAC | push只wakeup，pull reconcile |

## 4. Channel Definition

每个revision至少包含：

```text
ChannelDefinition
├─ member Platform Pack revisions
├─ research question + decision/use purpose
├─ host/project/repository roster
├─ inclusion/exclusion and fork/archive policy
├─ query plans + search/list/detail strategy
├─ version/product/error vocabulary
├─ definition/taxonomy snapshots
├─ identity and exact-relation policy
├─ rights/data-use/retention/deletion policy
├─ coverage and counter-evidence requirements
└─ projection/index definitions + validation watermark
```

roster优先于全站search。GitLab.com的广域/系统性bulk plan在resolution前直接blocked；Channel不得自动把计划拆成很多小query。GitHub search也必须保存query、repository/owner/language/time boundary、result cap和`incomplete_results`，不能借“API返回成功”声称总体完整。

## 5. Evidence 与推断边界

本Channel不新增`EvidencePublicIssue`或`EvidenceDeveloperDemand`。SoftwareWorkItem只标记来源representation；reviewed span仍按实际语义进入既有complaint、workaround、urgency、switching、product request等evidence type。

严格规则：

- authored issue body/comment可成为“来源这样陈述”的证据，不自动证明陈述为真；
- system note、bot、provider-derived summary、label/state和reaction默认只作context/navigation；
- code/log extract只有在secret/PII扫描、rights decision和精确locator后才可作为复现证据；
- `EvidenceRepeatedRequest`只有在identity/origin、explicit duplicate/move关系、cross-post/quoted内容和coverage审查后产生；
- native duplicate关系说明维护者的分类，不自动说明两个用户独立遇到同一问题；
- closed/completed/not-planned/duplicate/answered只记录provider状态或声明；是否部署、有效和满意需release、usage、follow-up或其他独立证据；
- author association、contributor role、公司域名或profile文本不用于推断雇主、客户、预算权或跨平台身份；
- 相同用户名、头像、正文、时间或URL片段不能自动跨平台合并。

## 6. Collection 与一致性

每个成员独立执行：

1. policy/rights gate；
2. CapabilityResolution；
3. roster/query-bound list或search；
4. exact item detail；
5. comments/discussions/events/relations按独立coverage读取；
6. append observed revisions；
7. push仅作wakeup，随后pull reconcile；
8. 生成member coverage与missing-member report；
9. Channel projection只组合可追溯span。

不同endpoint的cursor/checkpoint不能共用。mutable title/body/comment保留observed snapshot；provider不暴露完整历史时标`latest-exposed-only`或`partial`。删除、redaction、permission loss、transfer/move必须分开，404先进入unknown-authority。

跨平台只接受：

- provider明确backlink/cross-reference；
- source正文中的exact canonical URL并通过人工/reviewed mapping确认；
- 用户维护的auditable relation ledger。

否则仅形成semantic candidate view，不写canonical identity/relation。

## 7. 动态物化与索引

推荐按query和schema version构建可失效的动态物化视图：

| View | 输入 | 输出与边界 |
| --- | --- | --- |
| `problem-statement` | reviewed title/body/comment spans | problem/context/expected outcome；保留source revision |
| `reproduction-environment` | version/platform/error/code-log spans | structured candidate；unknown不得补齐 |
| `regression-window` | explicit version/release/commit relation | candidate range；时间相邻不构成因果 |
| `workaround-cost` | reviewed workaround spans | steps/tools/manual effort；不自动换算预算 |
| `maintainer-response` | authored maintainer span + system history | acknowledge/request-info/close/reopen；不命名resolved |
| `duplicate-lineage` | exact native/manual relation | directed graph；semantic similarity旁路展示 |
| `unresolved-gap` | state + follow-up + coverage | missing evidence和复核队列，不是“未解决”事实 |
| `cross-channel-corroboration` | issue spans + support/search/usage/review evidence | source-independent evidence bundle；identity不自动合并 |

view definition、model/rule version、input watermark、rights filter和rebuild reason进入lineage。source revision、rights、retention或taxonomy变化时只失效受影响分区；平台删除/限制传播到span、vector/lexical index、cache和派生view。

## 8. Probe 边界

Issue tracker是真实协作空间，不是无人值守广告渠道。以下全部排除：

- create/update/close/reopen/delete issue或work item；
- comment/reply/mention/reaction/vote、accept answer、resolve discussion；
- label/assign/milestone/link/move/clone/convert；
- create/configure/test/retry webhook；
- 通过MCP、glab Skill、quick action、browser或fallback route执行等价写入。

未来若用户明确要在自有sandbox测试发布，需要独立`ProbeDefinition`、truthfulness review、preview、逐revision approval、idempotency、receipt/reconcile和cleanup。社区/第三方project发布还需项目规则和maintainer许可；“内容相关”不等于可自动发布。

## 9. Verification Matrix

### 9.1 Member static/fixture

| Scenario | GitHub | GitLab | Channel assertion |
| --- | --- | --- | --- |
| item identity | node ID + repo/number | instance/project ID + IID/global ID | 不碰撞、不跨host猜同一对象 |
| mixed change object | Issue endpoint含PR | MR/work item link | code change不计primary demand item |
| authored/system | comments vs events | note/system/discussion/resource event | content role互斥 |
| state | reason/lock/answer分层 | native/custom state/lock/answer分层 | closed不等于solved |
| pagination/search | cap、incomplete、REST/GraphQL cursor | offset/keyset/GraphQL、missing totals | member coverage不互相填补 |
| auth/delete | 404/410/transfer | private/confidential/404/move | unknown authority不冒充tombstone |
| webhook | signature/delivery duplicate | legacy/19.1 signature/template/duplicate | 先持久化、验签、dedupe、pull reconcile |
| write denial | issue/comment/discussion | issue/note/work item/MCP/glab | fallback等价写也拒绝 |

### 9.2 Channel conformance

- 一个成员blocked时输出missing-member report，不把另一个成员结果外推成全Channel coverage；
- GitLab.com bulk deny在网络前发生，且不能由query sharding、MCP、CLI或Airbyte绕过；
- 同一个cross-post只在exact relation成立时去重；否则保留两条source evidence并标possible overlap；
- explicit duplicate、semantic duplicate和independent recurrence是三个不同字段/视图；
- label/state/reaction/count不可跨member直接相加；
- source deletion/rights change可定位并清除所有派生span/index/view；
- dynamic view rebuild具有input watermark、definition version和可重复结果hash；
- no external write和no credential-in-log由negative fixtures证明。

### 9.3 Sandbox 与 canary

先分别完成成员sandbox，才可做组合验证。GitHub使用用户自有sandbox repository；GitLab优先用户控制的Self-Managed或专用test project并完成协议审查。测试只使用合成内容和bot identities，不触达真实社区成员。

operational canary逐成员监测API/schema、terms、rate、permission、webhook、artifact/Skill/MCP drift；任一成员过期只局部suspend。Channel release必须显示有效成员、blocked成员、coverage和最后验证时间。

## 10. 发布门

从`researched`到`modeled`：

- GitHub与GitLab成员Pack均接受稳定concept/capability mapping；
- `SoftwareWorkItem*` definition/record/span contract与schema被接受；
- Channel definition、selection、rights、coverage、evidence和index policy有固定revision；
- GitLab.com policy-block保持显式，Self-Managed不偷继承。

从`modeled`到`verified`：

- 两个平台各自static + fixture报告通过；
- 至少一个允许的数据路径完成经授权sandbox；
- mixed-maturity、blocked-member、exact-overlap、delete propagation和negative-write组合fixture通过；
- capability、member与Channel均有独立maturity/expiresAt。

本Channel Pack不授权实现Connector、安装Skill/MCP、读取真实项目或发布任何平台内容。
