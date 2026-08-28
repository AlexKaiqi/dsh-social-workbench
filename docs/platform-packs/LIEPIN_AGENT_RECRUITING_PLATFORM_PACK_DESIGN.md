# 猎聘 Agent 招聘 Platform Pack 设计样本

状态：`researched/official-agent-surface/deferred`；未登录、未创建或读取授权 Token、未调用 CLI/API/MCP、未安装或执行第三方项目、未搜索/查看/保存真实职位、未读取或修改简历、未投递、未联系招聘者  
核验日期：2026-08-26  
目标：固定猎聘 B-H-C 招聘生态、用户 Agent 入口和招聘服务事实；证明“官方 Agent/MCP 可授权”仍需按 legal principal、purpose、tool、数据类别、副作用和保留方式逐 capability 决策。

## 1. Pack 摘要

```text
pack ref             liepin-agent-recruiting/v0-design
platform             liepin
surface              candidate-agent-and-bhc-products
state                researched/official-agent-surface/deferred
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
credential bindings  none
external effects     none
```

猎聘具有三类不同价值：

1. 职位内容表达组织职责、技能、地区、经验与广告薪酬，可形成组织投入和痛点假设；
2. B-H-C 三边产品表达企业、猎头和候选人的中介关系，以及推荐、面试、入职服务等过程事实；
3. 官方已经提供“把猎聘接入你的 Agent”的用户授权页面和 CLI 安装链接，为 future user-directed Connector 提供真实候选面。

但当前证据只支持“候选人本人授权的即时 Agent 工作流可能存在”。它不支持以下扩张：

- 把游客职位列表或网页内部请求作为公共 API；
- 用一个用户 Token 系统性枚举或持续监控职位市场；
- 把搜索结果、职位全文、简历、申请或沟通长期写入数仓或索引；
- 把官方智慧招聘系统对 CIL/MCP 的产品描述当成公共企业 API contract；
- 把求职投递或招聘职位发布当成低风险需求 Probe；
- 用社区 MCP/浏览器自动化补齐官方未声明的能力。

因此当前 Pack 有明确 access candidate，但仍为 `callable routes = 0`。只有版本化 contract、用途/数据权利、静态 schema、合成 fixture 和受控 live 验证依次通过，单个 capability 才能升级。

## 2. 官方证据与事实层级

### 2.1 稳定平台身份与产品结构

- [关于猎聘](https://ir.liepin.com/knowledge)将猎聘定位为中高端人才招聘平台；
- [猎聘产品与服务](https://ir.liepin.com/product/)描述企业（Business）、猎头（Headhunter）和候选人（Candidate）的 B-H-C 生态，以及面向不同主体的招聘、推荐、面试和入职服务；
- [猎聘智慧招聘系统](https://ir.liepin.com/system/)描述 CIL、外部系统/工具/AI 模型、MCP、AI Agent 实时调用、职位动态同步、人才画像和行业/薪酬数据能力。

这些页面适合固定 concepts 和 platform-claimed capabilities，但不能独立创建 Connector route。产品陈述缺少 endpoint、schema、auth scope、tenant、sandbox、数据用途、保留/删除和执行回执等机器契约。

### 2.2 官方用户 Agent 表面

[猎聘 MCP 授权配置页](https://www.liepin.com/mcp/server)在 2026-08-26 只读核验时显示：

- 页面标题和正文明确是猎聘 CLI / “把猎聘接入你的 Agent”；
- “GitHub 安装地址”直接链接 [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil)；
- 获取凭证必须登录；本研究没有登录或点击凭证入口；
- Token 有效期为 90 天，重新生成后旧 Token 立即失效；
- 搜索、查看、简历更新和投递共享每分钟 60 次限制；
- CLI 能力列为 setup、auth、resume（查询/更新本人简历）和 job（搜索/投递）；
- Agent 补全简历声称只填缺失字段、不覆盖已有内容，并逐次询问用户；
- HR 回复仍通过 App 推送或短信，实时沟通返回 App；Agent 查询进度是后续计划；
- Token 所代表的操作可在 App 中看到，重置 Token 可停止授权。

这是一条官方 access-method evidence，不是所有猎聘产品能力的统一 API contract。当前页面没有给出稳定 tool schema、版本协商、字段许可、结果保留、删除传播、错误分类、幂等键、write receipt 或 sandbox。

### 2.3 当前协议与个人信息边界

- [猎聘用户服务协议](https://wow.liepin.com/t1008237/index.html?agreementType=A0001)当前标注 2024-07-25 更新、2024-08-01 生效；招聘用户须实名/活体认证、关联单位并以职务行为使用平台。
- 协议限制异常账号/资源使用和规避规则，禁止通过程序/非正常浏览、spider/crawler/模拟用户、绕过技术措施、盗链、抓取、读取、模拟下载、深度链接、复制、转移或存储平台数据。
- 平台数据应按产品/服务声明的目的和方法使用；不得利用平台信息从事未经授权的广告或营销。
- [个人信息保护政策](https://wow.liepin.com/t1008237/index.html?agreementType=A0002)当前标注 2026-08-17 更新、2026-08-21 生效；游客模式只提供有限职位列表浏览，简历和手机号属于求职交流必要个人信息，扩展功能依赖明确同意。

官方 CLI/MCP 是正常产品路径，可以覆盖页面明确授权的用户操作；它不豁免本系统对 exact purpose、data use、retention、index、AI derivative、deletion 和 external effect 的独立审查。

## 3. 稳定 Concept Model

### 3.1 主体与授权

| Concept | 稳定含义 | 必须避免的混同 |
| --- | --- | --- |
| `PlatformAccount` | 猎聘账号及其当前产品角色 | 不等于现实身份、候选人/招聘者授权或企业归属 |
| `Candidate` | 使用求职、简历和投递能力的个人 | 不等于匿名网页访客；其简历/联系方式均为个人数据 |
| `Employer` | 提供职位与招聘需求的组织主体 | 展示公司名不自动证明 legal entity 或当前 headcount |
| `RecruitingUser` | 代表单位执行招聘职务的已认证用户 | 账号存在不等于对所有职位/候选人持续有权 |
| `Headhunter` | 以猎头身份提供人才推荐/招聘服务的个人 | 不等于雇主内部 recruiter 或普通 candidate |
| `HeadhunterEnterprise` | 管理猎头个人及服务关系的组织 | 不等于职位雇主或平台本身 |
| `RecruitingAuthorization` | 某主体、单位、职务、范围和时间下的招聘授权事实 | 不可由账号、职位页或历史操作推断 |
| `AgentAuthorization` | 用户向官方 Agent surface 签发/撤销的访问授权 | Token 是 secret，不是用户身份，也不是数据处理同意的万能替代 |

`JobActorAttribution`只保存 scope-local opaque ref、角色、依据和证据；不能把跨账号同名、公司展示名或猎头关系自动实体解析成同一现实主体。

### 3.2 职位对象

| Concept | 含义 |
| --- | --- |
| `Requisition` | 组织内部可能存在的招聘请求；公开职位通常不能证明它 |
| `Opening` | 一个或多个待填充岗位名额；posting 数量不是 headcount |
| `JobPosting` | 平台上发布的职位表达，可变且可重发/下线 |
| `JobDescription` / `Requirement` | 雇主或招聘主体对职责与要求的主张，不是已验证痛点真相 |
| `CompensationTerm` | 广告最低/最高/固定/奖金/提成等角色；不是 offer 或 payroll outcome |
| `PostingPlacement` | 在 exact board/query/filter/sort/context/time 下观察到的位置、推荐或推广状态 |
| `JobPostingState` | provider state 与 reviewed lifecycle；可见、search-visible、接收申请、opening exists、filled 分开 |

职位从搜索消失不能自动标记 `filled`；同标题重发不能自动合并；“招聘多人”也不能把一个 posting 解释成精确 headcount。

### 3.3 招聘与服务过程

| Concept | 含义 | 不可推断 |
| --- | --- | --- |
| `Application` | 候选人向特定职位提交申请 | 不等于招聘者已查看、联系或录用 |
| `Conversation` | 平台内的一段招聘沟通 | 打招呼不等于 application，回复不等于 interview |
| `ResumeShare` | 简历被特定主体按特定目的共享/查看 | 不等于永久保存、跨目的分析或 AI 训练许可 |
| `CandidateRecommendation` | 猎头/服务方把候选人推荐给职位或组织 | accepted 不等于 interview/offer/hire |
| `InterviewInvitation` | 面试邀约事实 | 不等于候选人接受或实际参加 |
| `Interview` | 已有证据的面试过程 | 不等于 offer |
| `InterviewService` | 平台/猎头提供的面试促成服务 | 服务完成不等于候选人入职 |
| `Offer` | 雇佣要约 | 不等于接受、到岗或持续任职 |
| `Hire` | 有独立证据的录用/入职事实 | 不可由职位关闭、聊天或 offer 自动推断 |
| `PlacementService` | 猎头/平台围绕成功推荐或入职的服务关系 | 不等于雇佣关系本身 |
| `HireGuarantee` | 入职后保证期/服务承诺的状态 | 保证期结束不等于在职状态或业务成果 |

`RecruitingEngagementStateBinding`保存 provider states、taxonomy revision 和 coarse phase；`Final` 与 `Successful`分开，使“流程结束但未成功”可表达。简历、聊天、面试内容和身份明细不进入普通 metadata。

## 4. Capability Catalog 与 adoption decision

| Capability | 官方 surface / population | Effect | Adoption | 当前边界 |
| --- | --- | --- | --- | --- |
| `discovery.search.jobs.user-authorized/v1` | 登录候选人本人通过官方 Agent/CLI 搜索 | read | `eligible-for-modeling/deferred` | 只允许用户指向的即时查询；尚无稳定 schema、用途/保留合同、fixture 或 live receipt |
| `content.read.job.user-authorized/v1` | 搜索后查看职位；官方页将“查看”计入限流 | read | `eligible-for-modeling/deferred` | 不得扩张为 public crawler、全量市场或长期全文库 |
| `resume.read.own/v1` | 用户查询本人简历 | sensitive read | `out-of-demand/deferred` | 独立个人工作流；不进入需求发现默认数据面 |
| `resume.update.own/v1` | 用户补全本人简历 | sensitive write | `out-of-demand/high-impact` | exact diff preview、逐次确认、receipt/reconcile；当前不采用 |
| `application.submit.own/v1` | 用户本人投递职位 | external write | `rejected-as-demand-probe` | 创建真实候选记录并影响招聘者；不是研究 Probe，当前不采用 |
| `application.status.read.own/v1` | 官方页称后续计划由 Agent 查进度 | read | `not-yet-capability` | roadmap 不能注册 tool，也不能由 App/SMS 通知推断 API |
| `recruiting.communicate.own/v1` | 当前要求回到 App 实时沟通 | external write | `not-agent-capability` | 不用 browser/cookie/internal request 补齐 |
| `job.publish.owned/v1` | 招聘者产品可能具有人类 UI | external write | `deferred/no-published-agent-contract` | 不从 candidate CLI、CIL营销页或社区工具推断 recruiter API |
| `candidate.search.recruiter/v1` | 招聘者/猎头产品可能具有人类 UI | sensitive read | `rejected/no-published-contract` | 候选人/简历数据不属于公共需求研究最小范围 |
| `candidate.recommend.headhunter/v1` | B-H-C 服务流程 | sensitive write | `deferred/no-published-contract` | 只建稳定概念，不注册 route |
| `job.sync.enterprise-cil/v1` | 智慧招聘系统宣称职位动态同步 | read/write unknown | `product-claim/deferred` | 缺 exact principal、endpoint、scope、schema、contract、sandbox |
| `research.materialize.liepin-job-market/v1` | 数仓、全文/向量索引、RAG/training | durable processing | `policy-blocked` | 没有批量监控、长期保存、AI/derivative和删除传播依据 |

官方 Agent 表面和 Platform Pack capability 不是一一等同：官方命令可能同时涉及多个系统 effect，Pack 必须拆成可以单独授权、验证、观测和撤销的最小能力。

## 5. Access Profiles

### 5.1 `visitor-job-list`

- principal：未登录访客；
- surface：官方网页/App 的有限职位列表；
- purpose：真人浏览；
- decision：`human-product-only`；
- forbidden fallback：DOM 抓取、内部接口、截图 OCR、browser automation、Cookie/session 复用。

游客模式证明有限可见性，不证明机器访问或保存权利。

### 5.2 `candidate-official-agent`

- principal：已登录并主动授权的候选人本人；
- credential：用户在官方页面生成的短期 secret，CredentialRef 只停留在 Host；
- candidate capabilities：job search/read、own resume read/update、own application submit；
- rate evidence：搜索/查看/简历更新/投递共享 60 calls/min；
- revocation evidence：重新生成使旧 Token 立即失效；
- decision：profile definition candidate，当前不绑定、不调用。

未来即使启用，也必须按 tool 拆 scope：用户允许 search 不等于允许 resume 或 application。若官方 Token 实际是全能力授权，系统必须在本地 policy gate 缩小可调用 tool，并明确提示 upstream credential scope 较宽，不能谎称平台侧最小权限。

### 5.3 `candidate-app-handoff`

- HR 回复和实时沟通返回猎聘 App；
- 系统最多生成 handoff 指引，不能监听页面通知、短信、App storage 或消息；
- App 操作结果没有 machine receipt 时只能是 `unreconciled/user-attested`，不得推断成功。

### 5.4 `recruiter-and-headhunter-products`

- 招聘者、企业和猎头面具有不同认证、组织授权、个人信息与业务目的；
- 当前没有从官方 Agent 配置页得到 recruiter job publish、candidate search、resume read、message 或 recommendation tool contract；
- 社区仓库展示的可自动化功能不能补充官方 capability；
- decision：`concept-only/no-route`。

### 5.5 `enterprise-cil-or-partner`

- 智慧招聘系统页面只证明 product claim；
- future contract 必须绑定 exact legal principal、tenant、environment、allowed purpose、endpoint、schema、scope、data classes、AI/index rights、retention/deletion、rate、effect、receipt 和 support owner；
- 某企业获得合同不自动形成公共 Connector，也不能共享 credential 或数据权利给其他租户。

## 6. Platform Skills 设计

Skill 是受约束的研究/验证流程，不是脚本别名，也不自动获得网络或凭证。

### `liepin-pack-research/v1`

- purpose：`research/curate`；
- 固定官方产品、MCP 配置页、协议/隐私版本、GitHub 直接链接、Token/rate/capability 描述和 drift triggers；
- 输出 KnowledgeProposal、evidence spans、valid window、unresolved questions；
- 禁止登录、生成 Token、同意协议、安装/运行 CLI、访问内部接口或读取真实数据。

### `liepin-access-resolution/v1`

- purpose：`verify/policy`；
- 输入 legal principal、account role、credential scope、capability、purpose、population、data classes、retention、index/AI、effect 和 deletion；
- 在 CredentialBinding/PortBinding 前执行；
- 官方页面、GitHub 链接、代码许可证、MCP Registry publication 和 community success report 必须分栏；
- 缺 exact permission/schema/fixture 时 fail closed。

### `liepin-user-job-discovery/v1`

- purpose：future `user-directed-research`；
- 只接受用户明确给出的 query/filter、单次结果预算和短保留期限；
- 输出 provider-native result envelope、query-scoped coverage、observedAt 和 source refs；
- 禁止自动扩展关键词、遍历城市/行业、后台定时抓取、排名候选人、跨用户合并或 durable materialization；
- 当前仅为抽象设计，不可调用。

### `liepin-own-resume-review/v1`

- purpose：future `personal-workflow`，不属于需求发现默认路径；
- read 与 update 分开；update 必须显示 exact field diff、平台 effect、敏感数据路径与撤销边界，并逐次确认；
- 不把简历发送到通用模型、数仓、搜索索引或 eval；
- 当前不可调用。

### `liepin-own-application/v1`

- purpose：future `personal-job-application`；
- 必须由用户选定 exact posting，展示目标主体、简历版本、提交内容、不可逆后果和 App 后续承接；
- 每次提交都需要 fresh confirmation、idempotency strategy 和 receipt/reconciliation；
- 禁止批量投递、自动评分后无人确认投递或把投递当需求 Probe；
- 当前明确不采用。

### `liepin-contract-fixture-conformance/v1`

- purpose：`verify/diagnose`；
- 仅对合成 tool schema/fixture 验证 actor、posting、engagement、coverage、policy-before-binding、secret redaction、write confirmation和receipt；
- 不访问猎聘，不包含真实 Token、职位、简历、用户或招聘者数据。

## 7. 数据、snapshot、数仓与索引

### 7.1 可以进入版本化知识 snapshot

- 平台身份、B-H-C roles、产品概念、capability definition；
- 官方文档 URL、版本/更新时间、content hash、valid window；
- Agent access method、Token生命周期、rate说明、命令列表；
- fixed OSS revision、license evidence、ownership evidence 和 adoption decision；
- schema/taxonomy/policy proposal 及审核记录。

这些是相对稳定的知识，适合 Git/Dolt 类可追溯 snapshot。更新采用 append proposal + reviewed supersession；政策删除不应被“append-only”阻止。

### 7.2 不因被观察就进入长期数仓

- 真实职位搜索结果、职位全文和排名；
- 简历、联系方式、候选人身份和求职偏好；
- 申请、聊天、面试、offer、hire 和推荐内容；
- 招聘者个人身份、在线状态和行为；
- Token、Cookie、二维码、storage state、请求 headers 和 App 通知。

若未来 exact route 获批，Observation 进入分析数据库还需独立写明 purpose、population、coverage、representation、retention、deletion和rights。snapshot只保存定义/manifest，不默认复制 raw payload。

### 7.3 索引是新的处理面

全文、倒排、向量、embedding、dynamic materialized view、RAG、训练集和跨平台实体解析都属于新的派生处理。只有 source read permission 不足以创建索引。每个 IndexDefinition 必须固定：

- source population 与字段白名单；
- purpose、query audience 和允许的 derivative；
- content/personal data license basis；
- retention、refresh、delete propagation 和 tombstone receipt；
- model/provider boundary 与 prompt/log exclusion；
- definition revision、build input watermark、coverage 和 stale state。

当前 `research.materialize.liepin-job-market/v1 = policy-blocked`，所以不存在猎聘动态物化视图或向量索引候选。

## 8. 开源与官方 artifact 审计

以下 revision 于 2026-08-26 只读固定。没有 clone、install、build、import、execute、login 或 credential generation：

| Artifact / revision | Ownership / License | 证据与风险 | Adoption |
| --- | --- | --- | --- |
| [猎聘 MCP 配置页](https://www.liepin.com/mcp/server) | 猎聘官方域名 | 官方 Agent access、GitHub安装链接、Token生命周期、rate和命令能力 | `canonical-access-evidence`；动态页需hash/expiry/drift monitor |
| [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil/tree/858a62bd839d490e8745b7503961e4676a54b9d7) `858a62bd…` | 官方页面直接链接；common paths 未见 LICENSE | README/metadata描述本地CLI、resume/job命令、JSON校验和`x-user-token`本地配置；缺软件许可、发布签名与本地执行验证 | `official-distribution-candidate`；不能复制、vendoring、安装或执行 |
| [xllinbupt/MCP2skill](https://github.com/xllinbupt/MCP2skill/tree/3d8f1dec0f58b67b3b2a88a1b1fb7c302cb5029e) `3d8f1dec…` | community；MIT | manifest 声称 community `io.github.xllinbupt` publisher、remote transport和`x-user-token`；不是猎聘身份的信任根 | `manifest-reference-only` |
| [dizhouid-lgtm/liepin-ai-loop-recruiting](https://github.com/dizhouid-lgtm/liepin-ai-loop-recruiting/tree/a12d13c66595cbbbedfbe35bd6d035a39b209ce8) `a12d13c6…` | community；MIT | 浏览器登录、招聘者批量候选人/简历筛选和自动化闭环 | `rejected-sensitive-automation` |
| [jolie-z/Auto-JobHunter](https://github.com/jolie-z/Auto-JobHunter/tree/4f9dec38978035a87d34cab5b15914dc8688e6f0) `4f9dec389…` | community；personal/educational-only | Cookie、抓取、LLM评价、自动投递；许可不是开源依赖许可 | `risk-reference-only` |
| [jiyangnan/AgentMesh-JobAgent](https://github.com/jiyangnan/AgentMesh-JobAgent/tree/4c5b63a284e98d70d6ff2f9c1d77ba2c30d06463) `4c5b63a2…` | community；Apache-2.0 | 多平台搜索/投递、云端字段传输和真实 delivery effect | `rejected-route-reference` |

软件许可证只约束代码使用；平台数据、账号、接口和真人副作用仍由平台 contract、用户授权、个人信息规则和本系统 policy 控制。MCP Registry 中出现一个 server 也只证明某 publisher 发布了 manifest，不证明平台官方身份或数据权利。

## 9. Verification Plan

### 9.1 evidence-review

- 保存 IR 产品页、MCP 配置页、用户协议和个人信息政策的 URL、标题、更新时间、hash、observedAt 和 expiry；
- 固定官方页面到 GitHub repo 的直接 href，不能仅凭 GitHub org 名称推断 ownership；
- 对 Token 90日、regeneration revocation、60/min共享 bucket、能力列表、App handoff和roadmap分别保存 exact evidence span；
- negative discovery 保存 official domain set、query、结果、observedAt 和 expiry，不把“未发现”写成“永不存在”；
- OSS 固定 revision/license/ownership/capability/risk，禁止把代码许可当平台授权。

当前只有 evidence-review 设计，没有 accepted snapshot、schema hash、fixture digest 或 VerificationReport。

### 9.2 static-contract

- platform、candidate account、recruiting organization、headhunter enterprise 和 agent authorization identity 分开；
- official user Agent、visitor web、recruiter product、enterprise CIL 和 community MCP 分成不同 surface/profile；
- search/read、resume read/update、application submit、communication和recruiter capabilities逐个建模；
- Token只出现为 CredentialRef；schema、logs、snapshot、fixtures和diagnostics都拒绝 secret；
- job/opening/posting/headcount、recommendation/interview/offer/hire/guarantee不等价；
- no route can bind before purpose/data/effect policy and capability-specific evidence pass；
- `callable routes = 0` 时不能暴露模型 tool 或 fallback browser route。

### 9.3 fixture-conformance

| Synthetic fixture | 必须证明 |
| --- | --- |
| one user query + one result page | coverage=`query-scoped/partial-or-provider-declared`，不生成 market-complete |
| result with rank/recommendation/promotion | 只写 placement/context/time，不写 posting intrinsic property |
| one posting says “招聘多人” | posting count 与 opening/headcount unknown 分开 |
| posting disappears | 只记录 visibility/removal observation，不自动 `filled` |
| candidate recommendation accepted | engagement accepted，不生成 interview/offer/hire |
| interview service completed | service completed，不生成 hire |
| offer accepted | 不生成 start date/payroll/retention outcome |
| token in input/error/trace | intake前redact/reject；zero snapshot/log/metric residue |
| resume returned by wrong capability | policy blocker；zero warehouse/index/prompt/eval residue |
| search route requests broad city×industry crawl | budget/purpose gate拒绝，不创建后台任务 |
| resume update | exact diff + fresh confirm + write receipt要求；无确认 zero write |
| application submit | exact target/content + fresh confirm；重试不能重复投递 |
| HR reply | 生成 App handoff，不注册 message polling或browser fallback |
| community MCP manifest | 只生成 artifact evidence，不创建 CredentialBinding/PortBinding |
| official product claim without schema | `deferred/missing-contract`，不生成 capability route |
| deletion/revocation | 删除传播到payload/projection/index/cache并记录receipt；Token仅标记revoked/expired，不保存值 |

### 9.4 sandbox-live

只有满足以下条件才可由用户另行授权一次受控验证：

1. 官方 exact contract/tool schema、数据用途和测试方式已固定；
2. 用户本人选择 legal principal、purpose 和 capability；
3. Credential API 只保存 secret ref，且不存在工具/日志/浏览器 payload泄漏；
4. 先使用无副作用 search/read 或平台明确的 sandbox；
5. request budget、rate bucket、query scope、retention 和 deletion 已批准；
6. 产生 request/response schema hash、coverage、redaction 和 VerificationReport。

当前未满足，禁止生成 Token或 live 调用。resume update、application submit、communication、candidate/recruiter data均不进入首个 sandbox-live。

### 9.5 operational-canary

只在 read capability 已通过 sandbox-live、rights review 和删除演练后考虑：

- 单用户、单查询、低频、人工观察；
- 无后台枚举、无跨用户合并、无durable index；
- 测试 expiry/revocation、rate-limit、schema/error drift、partial coverage和删除传播；
- canary失败自动撤销 route，不退回网页抓取或community automation。

## 10. 可观测性设计

### 10.1 每次 decision/run 必备维度

```text
pack_ref / definition_revision
platform_ref / surface_ref / access_profile_ref
legal_principal_ref / tenant_ref / environment_ref
capability_ref / purpose_ref / effect_class
credential_ref / credential_expiry_bucket / revocation_state
tool_schema_ref / tool_schema_hash / artifact_revision
query_definition_ref / filter_revision_ref / result_budget
request_count / provider_rate_bucket / throttled_count
coverage_kind / returned_count / truncation_reason
representation_kind / data_class_set / redaction_policy_ref
retention_ref / deletion_ref / index_decision_ref
confirmation_ref / idempotency_ref / receipt_ref / reconciliation_state
policy_decision_ref / verification_report_ref
observed_at / valid_window / evidence_refs
```

不得记录 Token、Cookie、headers、二维码、简历正文、联系方式、聊天、精确候选人身份或未脱敏职位 payload。高基数 provider IDs 只进入受控 audit reference，不作为普通 metric label。

### 10.2 状态与告警

- `credential.expiring`：只报告 expiry bucket，不报告 secret；
- `credential.revoked-or-invalid`：停止 route，要求用户在官方界面处理；
- `rate.limit.approaching`：按官方共享 bucket 统计，不让各 tool 各自认为拥有 60/min；
- `schema.drift`：tool/response hash变化，fail closed并生成 KnowledgeProposal；
- `capability.drift`：官方页面能力/roadmap变化不自动注册工具；
- `policy.drift`：协议/隐私更新触发 Pack review；
- `coverage.partial-or-unknown`：禁止对外宣称全市场；
- `effect.unreconciled`：任何 future write 无 receipt时阻止重试；
- `deletion.incomplete`：任一 projection/index/cache 未删除即告警；
- `secret.exposure.detected`：立即隔离日志、撤销 credential并启动incident流程。

### 10.3 SLO 不是抓取成功率

当前 zero-route Pack 的可观测目标是知识/决策质量：

- 官方证据在 expiry 前复核；
- 每个 capability 都有 explicit adoption 和 missing evidence；
- 所有 fixed artifact 都有 revision/license/ownership decision；
- fixture 证明 zero-secret、zero-write、no-market-completeness；
- drift 不会自动升级为 route。

未来 read route 的 SLO 也应以授权请求成功、覆盖诚实、删除传播和schema稳定性为中心，而不是最大抓取量。

## 11. Release Gates

### `researched/official-agent-surface/deferred`（当前）

- official access evidence：有；
- exact versioned tool contract：不足；
- data-use/retention/index rights：不足；
- fixed implementation artifact：有，但官方 repo common paths 未见 LICENSE；
- static schema/fixture：无；
- credential binding/live verification：无；
- callable route：0。

### 升级 `contract-modeled`

至少需要：

- 官方 versioned tool/transport/auth/scope/schema/error/rate contract；
- 对 search result、职位内容、缓存、AI/derivative、retention/deletion 的明确依据；
- artifact provenance、license或官方可执行分发条款；
- 只读 capability 的合成 fixtures、secret redaction、coverage和policy gates通过。

### 升级 `sandbox-verified`

需要用户另行明确授权并完成：

- CredentialRef + exact principal/profile；
- 无副作用、单查询、低预算 live；
- request/response schema、rate、coverage、redaction、retention和delete验证；
- VerificationReport与可撤销 route。

### write capability 独立门

resume update、application submit 或 future communication/job publish不能继承 read maturity。每个 write 都需真实业务目的、fresh confirmation、preview、idempotency、receipt、reconciliation、恢复和人工 handoff。招聘需求研究本身不构成 write 授权。

## 12. 当前决策与后续

当前决策：

- 发布本设计为 knowledge proposal；
- 保留 `candidate-official-agent` profile 和 read capability definitions，但不创建实现、CredentialBinding、PortBinding、模型 tool 或 scheduled job；
- 个人简历和投递能力在需求发现系统中默认关闭；
- 不将猎聘加入 Public ATS Channel；
- 不安装/执行官方或社区 CLI，不访问 community manifest 声称的 endpoint；
- 不建立网页/内部 API/browser fallback。

重新发现触发器：官方 schema/开发者条款/sandbox/fixture/receipt发布；官方 MCP 页面、GitHub href、Token 生命周期、rate或能力变化；协议/隐私更新；企业 CIL 提供 exact contract；或用户提供适用于其 legal principal 和用途的正式合作证据。

相关设计：

- [中国招聘平台 Agent 接入候选分流](CHINA_RECRUITING_AGENT_SURFACES_TRIAGE_2026-08-26.md)
- [BOSS 直聘招聘需求 Platform Pack](BOSS_ZHIPIN_RECRUITING_PLATFORM_PACK_DESIGN.md)
- [Public ATS Channel Pack](PUBLIC_ATS_CHANNEL_PACK_DESIGN.md)
- [招聘平台长期调研](../DEMAND_PLATFORM_SURVEY.md)
- [平台发现长期架构](../PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md)
