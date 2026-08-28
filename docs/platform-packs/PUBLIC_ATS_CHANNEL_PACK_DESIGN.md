# Public ATS Channel Pack 设计

状态：`researched` 组合设计；成员 Platform Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`public-ats-job-demand/v0-design`

## 1. 为什么需要 Channel Pack

Greenhouse 与 Lever 都提供企业公开职位，但它们不是同一个平台：namespace、原生对象、字段、地区、API、条款和漂移节奏都不同。把两者伪装成一个 `ats` Platform Pack 会破坏证据和授权边界；让每个研究任务自行拼接又会重复 roster、projection、coverage 和去重规则。

因此引入两级发布单位：

```text
Platform Pack                         Channel Pack
平台原生知识与可验证能力               跨平台研究策略与派生投影

greenhouse-public-job-demand/vN ─┐
                                  ├─> public-ats-job-demand/vN
lever-public-job-demand/vN ──────┘       ├─ roster contract
                                         ├─ job-demand projection
                                         ├─ coverage/dedupe policy
                                         └─ channel skills + verification
```

Channel Pack 不复制成员 concept/schema、不合并 credential、不声明平台 support，也不允许低成熟度成员借用高成熟度成员的 verification。它只固定一组成员 Pack、共同 capability、projection mapping、source roster 契约和组合验证报告。

## 2. 成员 Pack

| Member | Platform | 公开访问面 | 当前状态 |
| --- | --- | --- | --- |
| [Greenhouse Job Board Pack](GREENHOUSE_JOB_BOARD_PLATFORM_PACK_DESIGN.md) | `greenhouse-recruiting` | board-scoped Job Board API GET | `researched` design |
| [Lever Postings Pack](LEVER_POSTINGS_PLATFORM_PACK_DESIGN.md) | `lever-hire` | site/region-scoped Postings API v0 GET | `researched` design |

成员共同映射的 capability proposal：

- `taxonomy.read.job-board/v1`
- `discovery.list.published-jobs/v1`
- `content.read.job-posting/v1`
- `change.observe.published-jobs/v1`

Greenhouse 的 departments/offices 与 Lever 的 team/department/location 不强制成为相同平台概念；只在 channel projection 中映射到有 provenance 的 facet。

共同 projection 以 `JobPosting*` 抽象表达 posting/opening、content role、state、employment/workplace、compensation role、placement 与 relation，但成员原生对象仍是事实源。BOSS 直聘不在 roster：它虽有相同招聘概念，却没有本 Channel 所要求的官方公开机器 read contract；概念兼容不能替代 access、rights 或 verification maturity。猎聘也不在 roster：其官方用户 Agent/CLI 是候选人本人授权的即时工作流，不是雇主 roster 限定的公开 GET surface，不能用 Token 存在替代公共 population、长期用途和覆盖契约。

## 3. Channel Roster

公开 API 仍需要明确 board token 或 site name。Channel Pack 本身是可复用模板，不内置“全世界所有公司”；每次研究固定一个版本化 `ChannelRosterRevision`：

| 字段 | 作用 |
| --- | --- |
| organization ref/name | 用户研究范围中的企业主体；允许暂时无全局 ID |
| platform pack ref | 指向具体、固定版本成员 Pack |
| platform surface ref | Greenhouse board 或 Lever region/site 原生引用 |
| canonical career URL | 证明企业与该 board/site 的关联 |
| enrollment evidence | 企业 career page、官方链接或用户确认 |
| enabled/valid window | 公司迁移 ATS 后保留历史，不原地改写 |

禁止根据公司名称批量猜 slug 并把第一个返回 200 的 endpoint 自动加入 roster。200、空数组或相似 slug 都不能证明企业归属。迁移或多个 board 必须生成 roster proposal，经证据审查后形成新 revision。

## 4. 派生 `job-demand` Projection

成员 Observation 保留平台原生 payload；Channel Pack 只派生以下最小公共视图：

| 字段 | 来源与规则 |
| --- | --- |
| source platform/pack/snapshot | 必填，不可从结果中删除 |
| organization roster entry | 来自显式 roster，不根据 slug/名称自动合并 |
| native posting ref | provider-specific ID；跨平台永不共享 canonical ID |
| title | 原生 title/text，保留语言与 raw span |
| description spans | 从原始 HTML/plain 派生，保留 source revision |
| observed/updated time | `observedAt` 必填；provider updated time 单独保存 |
| location facets | 原生 location/office/allLocations，经版本化 mapper 输出 |
| organization facets | department/team 等保留 provider key/value |
| employment/workplace facets | commitment/workplace 等映射，unknown 不补默认值 |
| compensation | currency、interval、min/max 或 text；缺失为 unknown |
| source/apply URL | 用于追溯；apply URL 不代表申请能力 |
| lifecycle observation | appeared/changed/disappeared/unknown；不是 filled/closed 事实 |

### 4.1 去重与关联

- source canonical key 始终是 `platform + board/site + native posting ID`；
- 同一 title/location 不能直接跨平台合并；公司可能迁移、重复发布或使用多个 ATS；
- 跨平台“可能为同一岗位”只能生成带 evidence、score 和 mapper version 的 relation candidate，不改写原始身份；
- 一个 posting 不等于一个 opening/headcount；数量统计必须标为 `posting-count`；
- description hash 可用于同源 revision 检测，不能单独证明跨源同一性。

## 5. Coverage Policy

Public ATS 的覆盖度至少有三层，不能只保存一个 `complete=true`：

```text
response/page coverage
    ↓
board/site population coverage
    ↓
roster/channel coverage
```

- Greenhouse：当 jobs list 合法、`len(jobs)==meta.total` 且无错误时，可对“该 board 当次公开 posts”标记 complete；
- Lever：只有按 `skip/limit` 读取到终点且过程中无错误/并发漂移迹象时，可对“该 site/filter 当次公开 posts”标记 best-effort complete；
- roster：只有全部 enabled entries 都有本窗口成功 run，Channel Run 才是 roster-complete；
- 即使 roster-complete，也只代表用户选定企业集合，不代表行业、地区或招聘市场；
- internal/confidential/unlisted roles、非成员 ATS、企业自建 careers page 和未登记公司始终是显式 exclusions。

因此 `CoverageAssessment` 必须保存 population、scope refs、inclusion 和 exclusion，而不仅是 provider indicator。

## 6. Channel Skills

### `public-ats-roster-curation/v1`

- purpose：`research/curate`；
- 输入：组织列表、career URLs、成员 Pack evidence 和当前 roster revision；
- 输出：新增/迁移/停用 roster proposal；
- 禁止：批量枚举 slug、调用未知 endpoint、自动接受 200/空结果、改写历史 enrollment。

### `public-ats-job-demand-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel Pack、成员 Platform Pack snapshots、roster revision、research question 和时间窗；
- allowlist：成员 Pack 的公开 list/read capability；
- 输出：原生 Observations、每个 surface CoverageAssessment、channel projection 和 missing-source report；
- 禁止：candidate/application/recruiter 数据、职位申请、全文“全网搜索”声称和无证据跨平台身份合并。

### `public-ats-channel-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；分别运行成员 conformance，再运行 cross-provider projection/coverage/dedupe 场景；
- 成员失败只局部 degrade；不能用另一个成员的成功覆盖。

没有 Channel Probe Skill。公开 ATS 是需求观察面，不是主动发布测试面；真实岗位发布属于雇主招聘系统和独立业务授权。

## 7. 开源生态快照

以下只作只读研究，revision 均在 2026-08-26 通过 `git ls-remote` 固定，未安装或执行：

| Artifact | Revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [grnhse/greenhouse-api-docs](https://github.com/grnhse/greenhouse-api-docs/tree/bce460167e939315b10a8f0b3f65b2eb34aa9a99) | `bce460167e939315b10a8f0b3f65b2eb34aa9a99` | Greenhouse 官方 contract/source drift | official evidence；Apache-2.0 |
| [lever/postings-api](https://github.com/lever/postings-api/tree/f61aac5831a193bc66e1183c3ad102739dfd9f56) | `f61aac5831a193bc66e1183c3ad102739dfd9f56` | Lever 官方 v0 docs/examples | official evidence；未见 LICENSE，不复用代码 |
| [noble-ronin/ats-job-apis](https://github.com/noble-ronin/ats-job-apis/tree/18942b18a452e92d5ecb09e7b527c29fee8b74a3) | `18942b18a452e92d5ecb09e7b527c29fee8b74a3` | 多 ATS endpoint discovery | 无许可证，`discovery-only`；所有 claim 回到官方来源 |
| [bonus414/job-scanner](https://github.com/bonus414/job-scanner/tree/292e530e843b13524c28e4ca5bdeb2d44ba58ca2) | `292e530e843b13524c28e4ca5bdeb2d44ba58ca2` | roster + provider mapping + polling/dedupe | MIT、单 commit、未审计；`reference-only` |

## 8. Verification Plan

### evidence-review

- 两个平台 identity、public/authenticated surface、fields、pagination/filter、terms 和 official repository 分开；
- common capability 只取交集，不虚构全文 search；
- roster enrollment、projection 与 coverage 规则有明确证据边界；
- community directory 不成为信任根。

### static-contract

- Channel Pack member 必须引用固定 PlatformPackRef 和 capability；
- ChannelVerificationPlan 必须固定 ChannelPackRef、ChannelRosterRef 和成员 VerificationReport；不能用单平台 VerificationReport 冒充组合报告；
- member projection mapping 输入必须是成员 native concept/schema；
- roster entry 必须有 platform surface ref、canonical URL 和 evidence；
- channel projection 必须保留 source platform/pack/snapshot/revision；
- application/candidate schema 不得出现在 allowed capabilities；
- coverage 必须包含 population boundary；跨平台 merge 只能是 derived relation candidate。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| Greenhouse + Lever equivalent roles | 映射到公共 facets，但保留两个 native IDs/provenance |
| same title/location, different company | 不合并 |
| same company migrated provider | 产生 roster revision 与 relation candidate，不改写历史 source |
| Greenhouse prospect post | 不作为明确 opening/headcount |
| Lever remote + country/location | workplace 与 eligibility 不混用 |
| missing salary/department | unknown，不从另一 provider schema填充 |
| one member timeout | channel partial；其他成员结果仍可用 |
| all roster entries complete | 仅标 roster-complete，并保留 market exclusions |
| unexpected provider field | native extension + mapper reverify，不污染 common schema |
| candidate/application payload | policy blocker |

### sandbox-live / operational-canary

需用户另行批准有限 roster 后，才可分别运行成员 read-only sandbox，再验证 channel coverage/projection；不访问 applicant/candidate，不提交申请。成员各自通过 sandbox 后，才设计低频、错峰 canary。`ChannelVerificationReport` 引用而不替代成员报告，并单独证明 roster/projection/dedupe/coverage/degradation。Channel canary监测成员 report expiry、roster source health、projection schema、mapping drift 和 partial rate；它不能替代成员 API/schema canary。

## 9. 生命周期与晋级门

```text
member Platform Pack verified independently
             ↓
Channel Pack modeled -> fixture-verified -> sandbox-verified -> operational
             ↑                              │
roster revision + projection mapping        └─ member degrade -> channel partial/degraded
```

Channel Pack 不能高于其被使用 capability 的最低成员 maturity。新增 ATS（如 Ashby）必须先有独立 Platform Pack，再以新 Channel Pack revision加入；不能只加一个 endpoint/parser。招聘聚合/产品平台（如 BOSS）还必须先证明官方 access method，而不能因能映射 `JobPosting*` 就加入。当前三个设计均停在 `researched`，不授权 adapter、connector 或 live request。
