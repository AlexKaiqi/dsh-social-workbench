# Lever Postings Platform Pack 设计样本

状态：`researched` 设计候选；未发布、未调用 API、未运行 live probe  
核验日期：2026-08-26  
Pack ref：`lever-public-job-demand/v0-design`

## 1. 定位与边界

本 Pack 只覆盖 Lever Postings API v0 的公开 job site surface，不覆盖需要认证的 Lever API v1、opportunity/candidate/requisition、internal/confidential postings 或客户后台。

Lever 官方 repository 将 Postings API 定义为构建公开 job site 的接口：可以按 site 分页列出、按有限 category 查询和读取单个 published posting，但明确不支持 open jobs 的全文搜索；global 与 EU 使用不同 base URL：[Lever Postings API](https://github.com/lever/postings-api)。这不是全平台职位搜索，也不允许从 site slug 推导一个企业的全部招聘活动。

```text
platform             lever-hire
surface              public Postings API v0
state                researched
knowledge snapshot   proposal only
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `lever.posting-site/v1` | entity | region + site name | company public posting namespace；site name 不是企业通用 ID |
| `lever.posting/v1` | entity | region + site + posting ID | published job posting；公开 v0 与 authenticated v1 的 posting 状态面不同 |
| `lever.posting-category/v1` | value/enumeration | posting + category key | location、commitment、team、department、level 等 account-defined values |
| `lever.workplace-type/v1` | enumeration | provider enum | `unspecified/on-site/remote/hybrid`；不替代 location eligibility |
| `lever.salary-range/v1` | value | posting + currency/interval | optional min/max；缺失不是“无薪资” |
| `lever.posting-content-list/v1` | value/entity | posting + list position/name | requirements、benefits 等结构化 HTML list |
| `lever.application-form/v1` | entity/schema | posting + configured fields | 客户可定制，涉及 applicant PII；本 Pack 默认不读取/提交 |

主要关系：

```text
posting-site ── publishes ──> posting
posting ── categorized-by ──> posting-category
posting ── has ──> workplace-type / salary-range / content-list
posting ── links-to ──> hostedUrl / applyUrl
```

### 2.1 原生差异必须保留

- Postings API v0 与 authenticated Lever API v1 是用途不同的接口，v0 不是 v1 的旧版私有 API替代品。
- `site` 是公开 namespace，不是 legal organization ID；global 和 EU 同名 site 也必须保留 region/base URL。
- category 值由客户配置，大小写和语义不能跨 site 直接标准化。
- workplace type、location、allLocations 和 country 是不同信息；remote 不等于全球可工作。
- salaryRange 缺失、null 或自由文本 salaryDescription 必须区分。
- hostedUrl、applyUrl 是链接，不是招聘流程状态或录用证据。

公共设计映射使用 `design/go/demandintel/ingress.go` 中的 `JobPostingDefinitionMetadata`、`JobPostingRecordMetadata`、`JobPostingSpanMetadata`、`JobPostingPlacementMetadata` 和 `JobCompensationTermBinding`。Lever 的 region/site、posting、category、workplace、salary 与 content-list 原生引用始终保留；公共类型不是删除 site-local 语义的统一 Job DTO。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.read.job-board/v1` | site locator → site context | public | `eligible` | 以 region + site 建立 source boundary |
| `discovery.list.published-jobs/v1` | posting site + filters → posting refs | public | `eligible` | location/team/department/commitment/level 等有限 filter，不是全文 search |
| `content.read.job-posting/v1` | posting ref → posting revision | public | `eligible` | JSON mode，保留 raw HTML/plain variants provenance |
| `change.observe.published-jobs/v1` | repeated site snapshots → appeared/changed/disappeared observations | derived pull | `eligible` | polling 推导，不是官方 change event |
| `application.submit.job/v1` | applicant data → application receipt | authorized write | `rejected` | 需要 API key、candidate PII 与 429 处理；不属于需求研究 |
| `content.read.confidential-posting/v1` | customer key → posting | authenticated | `rejected` for this Pack | public research没有合法授权基础 |
| `content.read.candidate/v1` | customer account → candidate | authenticated | `rejected` | 明确超出需求发现最小范围 |

## 4. Access Methods

### 4.1 `lever-postings-public-v0/v1`

- mode：`official-api`
- official：`true`
- authentication：public GET surface 不要求 customer API key；
- regions：global `api.lever.co` 与 EU `api.eu.lever.co`；
- namespace：显式 site name；
- endpoints：list postings、single posting 的 JSON 子集；
- filters：location、commitment、team、department、level；`skip/limit` 分页；
- exclusions：API 不提供全文搜索，不能自动扫描/猜测所有 site；
- effect：`none/local-write`；
- coverage boundary：一个已登记 region/site、给定 filter 与观察窗口的 published postings；不是 internal/unlisted/confidential posting 或招聘市场。

Postings API repository还说明浏览器跨域请求只支持客户配置的 domain/subdomain。该 CORS 事实是 browser delivery constraint，不是允许任意 server-side 聚合的授权声明；正式使用仍需用途、频率、rights 和 retention review。

### 4.2 明确排除的 API 面

- application POST 需要客户 API key，表单字段可按 account 定制，且官方要求正确处理 application rate limit/429；本系统不创建 route。
- authenticated Lever API v1 使用 Basic Auth、拥有 postings/candidates/opportunities 等私有数据和 confidential permission；它必须作为自有客户/partner 的独立 Pack/profile，不能继承 public v0 的授权。
- public v0 未提供 posting create/update；真实招聘发布也不是需求研究 Probe。

## 5. Platform Skills

### `lever-pack-research/v1`

- purpose：`research/curate`；
- 核验官方 repository、Developer updates、region、v0/v1 边界、terms 和字段 drift；
- 只生成 KnowledgeProposal，不调用 API、不安装 examples/clients。

### `lever-public-job-demand/v1`

- purpose：`acquire`；
- 输入：固定 snapshot、获批 site roster、研究问题、filter 与窗口；
- allowlist：public v0 list/read；
- 输出：posting Observation、site/filter-scoped CoverageAssessment 与 source revision；
- 禁止：全文 search 声称、枚举任意 site、读取 application form、使用客户 key 或申请职位。

### `lever-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；sandbox 只允许明确的 global/EU site allowlist；
- 验证分页、category/workplace/salary optionality、HTML/plain provenance、site migration 和 disappearance uncertainty。

本 Pack 不定义 Probe Skill。求职申请会产生真实候选人记录和招聘团队负担，不能作为市场需求测试。

## 6. 数据治理与需求解释

- 只保存公开 posting 事实；不采 applicant、candidate、opportunity、requisition、hiring manager 或 confidential fields。
- description 中出现个人联系方式时默认从普通 projection 剥离；原始 evidence 按 rights/retention 受限。
- site 必须来自企业 career page、用户 roster 或可追溯证据，不通过公司名排列组合扫描。
- role title、team、salary 和 workplace type 是雇主声明，不证明岗位仍有预算、实际 headcount 或招聘成功率。
- 一个 posting 可覆盖多个 opening，也可能是 evergreen；不能将 posting count 直接解释为 headcount。
- Lever Terms of Service主要约束客户订阅与 Customer Data，公开 Postings API 的可访问性不是 blanket redistribution license；本 Pack 默认做有限研究、引用与聚合，不镜像再发布：[Lever Legal Center](https://www.lever.co/legal)、[Terms of Service](https://www.lever.co/legal/terms-of-service)。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 核验；没有 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [lever/postings-api](https://github.com/lever/postings-api/tree/f61aac5831a193bc66e1183c3ad102739dfd9f56) `f61aac5831a193bc66e1183c3ad102739dfd9f56` | Lever 官方、verified org；repository 未见 LICENSE | v0 contract、examples、global/EU、filters、application boundary | `official-evidence`；license 为 `NOASSERTION`，示例代码不作为依赖复用 |
| [noble-ronin/ats-job-apis](https://github.com/noble-ronin/ats-job-apis/tree/18942b18a452e92d5ecb09e7b527c29fee8b74a3) `18942b18a452e92d5ecb09e7b527c29fee8b74a3` | community；未见许可证 | ATS endpoint 发现目录 | `discovery-only` |
| [bonus414/job-scanner](https://github.com/bonus414/job-scanner/tree/292e530e843b13524c28e4ca5bdeb2d44ba58ca2) `292e530e843b13524c28e4ca5bdeb2d44ba58ca2` | community；MIT；单 commit | provider mapping、roster、polling/dedupe 研究 | `reference-only`；未审计实现，不运行 |

## 8. Verification Plan

### evidence-review

- v0 public Postings API 与 v1 authenticated API 边界有官方证据；
- site/region、filters、pagination、JSON fields、application write 和 CORS 限制可追溯；
- 官方 repository ownership 与 `NOASSERTION` license 状态明确；
- “全文搜索”“全公司招聘”“posting 等于 headcount”等 claim 被拒绝。

当前只有设计态 evidence review，没有 evidence hash、accepted snapshot 或 VerificationReport。

### static-contract

- PlatformID 固定 `lever-hire`，access method 明确 public v0；
- region + site + posting ID 共同进入外部身份边界；
- capability 是 `list.published-jobs`，不是 `search.jobs`；
- public route 不接受 Lever v1 key、candidate 或 confidential schema；
- application.submit adoption 为 rejected；
- coverage 明确 site/filter population；HTML/plain field 不互相覆盖。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| multiple `skip/limit` pages | cursor/checkpoint、重放去重与最终 page 判断 |
| global/EU same site name | source identity 不碰撞 |
| category filters/case | 保存请求和 provider value，不假装跨 site 标准 taxonomy |
| remote + allLocations | workplace 与 legal location eligibility 分开 |
| salary absent/range/text | unknown、structured range、free text 三态分开 |
| HTML/plain variants | raw evidence 与安全 projection 有 lineage |
| one-run disappearance | unknown/disappeared observation，不直接标记 filled |
| 404/empty/invalid site | source invalid、empty board、temporary failure 区分 |
| application POST fixture | static/policy gate 拒绝 candidate PII 与 write route |

### sandbox-live / operational-canary

需用户另行授权后，才可对有限 global/EU site allowlist 运行 read-only sandbox；验证真实分页、filter、404、schema optionality 和 coverage boundary，不调用 application POST。sandbox 通过后才设计低频 canary，监测官方 repo/docs、Developer updates、base URL、schema、site availability、错误率和 coverage drift。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted snapshot、evidence hash、normative schemas、rights/retention 和 site roster 契约；从 `modeled` 到 `verified` 需要 fixture report，并经用户授权完成有限 public site sandbox。当前不授权这些动作。
