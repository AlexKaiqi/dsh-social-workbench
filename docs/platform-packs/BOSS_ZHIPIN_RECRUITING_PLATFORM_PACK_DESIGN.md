# BOSS 直聘招聘需求 Platform Pack 设计样本

状态：`researched/manual-only` 设计候选；未登录、未创建招聘账号、未认证企业、未读取或导出职位/简历/聊天/候选人、未安装或执行第三方项目、未发布职位、未打招呼或发送消息  
核验日期：2026-08-26  
目标：固定 BOSS 直聘的岗位、招聘主体、招聘授权、职位发布、搜索展示、沟通、简历交换和面试等稳定概念；同时证明“人能在产品里看到/操作”不等于存在合法、公开、机器可接入的 Connector 能力。

## 1. Pack 摘要

```text
pack ref             boss-zhipin-recruiting-demand/v0-design
platform             boss-zhipin
surface              consumer-and-recruiter-products
state                researched/manual-only
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

BOSS 直聘对中国组织投入和工作痛点研究很有价值：职位说明会显式表达职责、技能、工具链、地区、经验和广告薪酬。但当前官方证据没有给出面向本用途的 public developer API、公开职位数据导出、企业自有职位 API、ATS connector contract 或 sandbox。现行《BOSS直聘用户协议》与《招聘行为管理规范》反而明确要求用户通过平台自身使用服务，并限制未经许可的第三方工具、插件、自动登录、职位浏览/发布、简历收发、候选人信息收集和非正常方式读取/复制/转存数据。

所以本 Pack 的正确产物不是一个 scraper，而是三个可审计结论：

1. 用 `JobPosting*` 和 `RecruitingEngagement*` 保存稳定概念及其不等价关系；
2. 把公开网页、招聘者产品、BOSS HI、平台对合作方的职位分发、个人信息导出和机器 API 分成不同 access surface；
3. 当前只保留用户主动提供的最小 `manual-evidence-package` 作为本地输入候选，且不声明平台 Connector、自动 search、持续采集或发布 Probe。

## 2. 当前官方规则基线

官方协议中心当前返回以下版本；版本号和更新时间来自 2026-08-26 对官方协议列表的只读核验：

| Agreement ID | 名称 | 版本 / 更新时间 | 本 Pack 使用方式 |
| --- | --- | --- | --- |
| `registerprotocol_33` | [BOSS直聘用户协议](https://about.zhipin.com/agreement?id=registerprotocol_33) | `20260617v2` / `20260617` | 当前平台、账号、招聘授权、第三方工具和数据获取边界 |
| `personalinfopro_89` | [BOSS直聘隐私政策](https://about.zhipin.com/agreement?id=personalinfopro_89) | `20260511v1` / `20260511` | 匿名浏览、个人信息、访问/删除/撤回/导出和注销边界 |
| `postrules_11` | [招聘行为管理规范](https://about.zhipin.com/agreement?id=postrules_11) | `20240828v1` / `20240828` | 真实招聘、职位质量、异常索取信息、ATS/插件与自动化禁区 |

`https://www.zhipin.com/web/common/protocol/protocol-2019-09-30.html` 只保留为历史 URL，不再作为 current policy truth。动态协议页将未带版本的 agreement key 解析到当前版本，因此 evidence snapshot 必须同时固定 agreement ID、version、content hash、observedAt 与 valid window，不能只保存一个会漂移的 URL。

当前规则支持的关键结论：

- 招聘用户包括用人单位和人力资源服务机构的招聘者；必须持续提供真实单位、职务、企业邮箱、招聘授权及许可证等适用材料。
- 发布职位、与求职者沟通、获取/使用/转发简历必须处于真实、持续有效的单位授权内；虚假身份、公司、职位或非招聘目的使用简历属于严重违规。
- 平台可审核企业地址和招聘授权，并要求环境/线下审核及证明材料。
- 不得未经许可使用第三方软件、插件、外挂或平台登录、浏览/发布职位、接收/发送简历；不得以 spider、crawler、模拟用户或规避技术措施等非正常方式读取、复制或转存信息。
- 《招聘行为管理规范》进一步列举北森、大易、Moka、图谱、云招、e成等招聘系统/ATS，禁止未经许可连接 BOSS 以登录、发布/浏览职位、收简历、匹配、推送消息或自动沟通。存在 ATS 产品不等于存在开放 ATS 集成权。
- 禁止虚假、不准确、过期、误导或不符合真实需求的职位；禁止高频异常索取简历/联系方式、骚扰或在被拒后反复沟通。
- BOSS 可将用户发布的职位共享到其关联平台或第三方合作平台；这是平台控制的 outbound syndication，不是供第三方调用的职位 API。
- 用户协议明确允许在关联产品 BOSS HI 中使用部分招聘沟通能力；[BOSS HI](https://hi.zhipin.com/) 是官方产品面，不是已发布的开放 API，且其自身协议同样限制未经许可的第三方接入。
- 隐私政策所述“个人信息浏览与导出”面向数据主体自己的个人信息权利，不是企业职位、候选人、简历、聊天或市场数据的 bulk export。

这些规则是产品与数据治理证据，不是法律意见；任何正式业务接入仍需平台书面合同、用户组织授权和专项法律/隐私审查。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `boss.account/v1` | platform principal | account-scoped opaque ref | 求职者或招聘者使用平台的账号；不得作为跨平台真实身份 |
| `boss.recruiting-user/v1` | restricted actor | account + certification revision | 获得招聘侧功能的自然人，不自动等于法定雇主或长期有效招聘授权 |
| `boss.employer/v1` | organization | platform organization ref + verification revision | 职位所属或招聘授权所指组织；展示名称不能单独证明法律主体 |
| `boss.staffing-agency/v1` | organization role | organization + license/authorization revision | 代表其他单位招聘的人力资源服务机构；实际用工主体必须保留 |
| `boss.recruiting-authorization/v1` | authority evidence | recruiter + employer + valid window + evidence revision | 招聘者代表某单位发布、沟通和使用简历的有效授权；必须可过期/撤销 |
| `boss.requisition/v1` | internal intent | provider-owned opaque ref if exposed | 企业内部招聘需求或审批，不等于公开职位；当前未发现官方读取面 |
| `boss.opening/v1` | hiring capacity | provider-owned opaque ref if exposed | 一个实际空缺/名额；一个 posting 可能覆盖零个、一个或多个 opening |
| `boss.job-posting/v1` | published recruiting record | job ID + observed revision | 对求职者公开的职位表达；title/JD/薪酬/地区/经验等是雇主声明 |
| `boss.job-description/v1` | authored content | job + content revision | 职责、要求、技能、福利和组织描述；不能从文本自动推断已批准预算 |
| `boss.advertised-compensation/v1` | commercial claim | job + compensation revision | 展示薪资区间/单位/周期和奖金等；不是 offer、实发薪资或总人力预算 |
| `boss.job-location/v1` | location claim | job + location revision | 城市、区域和工作地点；remote/hybrid/onsite 与合法工作地分离 |
| `boss.job-placement/v1` | time-bound observation | board/query/filter/sort/context + observedAt | 搜索、推荐或推广位置；排名不是岗位固有属性 |
| `boss.recruiter-conversation/v1` | restricted engagement | conversation + participant scope + revision | 直接开聊过程；聊天不等于投递、申请或面试 |
| `boss.resume-share/v1` | restricted personal-data event | conversation/application + artifact revision | 求职者向招聘方提供简历；高度敏感且不属于需求发现最小数据 |
| `boss.contact-exchange/v1` | restricted personal-data event | conversation + event revision | 电话/微信等联系方式交换；不等于同意平台外营销或长期保存 |
| `boss.interview-invitation/v1` | recruiting effect | posting/conversation + invitation revision | 邀请或预约面试；不证明求职者接受或实际到场 |
| `boss.interview/v1` | recruiting outcome step | scoped event + revision | 已进行的面试事实；不证明 offer 或录用 |
| `boss.offer-or-hire/v1` | restricted outcome | organization/opening + scoped revision | offer、接受与入职是不同状态；公开职位面不能推断 |

主要关系：

```text
real employer need
  -> requisition / approved intent
  -> one or more openings
  -> authorized recruiter
  -> job posting revision
  -> board/search/recommendation placement observation
  -> candidate-recruiter conversation
  -> optional resume/contact exchange
  -> optional interview invitation
  -> optional attended interview
  -> optional offer / acceptance / hire
```

必须拒绝的推断：

- posting 存在不等于 opening 仍存在、headcount 为一、预算已批准或持续招聘；
- posting 消失不等于职位已招满，也可能是关闭、过期、审核、重发、权限或搜索排序变化；
- 招聘者在线、回复或发起沟通不等于职位有效；
- 开聊不等于申请，交换简历不等于进入流程，邀请不等于完成面试，面试不等于 offer，offer 不等于 hire；
- 广告薪酬不等于 offer 或实际支出；重复职位不自动表示新增需求。

上述概念映射到 `design/go/demandintel/ingress.go` 的 `JobPosting*`、`JobActorAttribution`、`JobCompensationTermBinding`、`JobPostingPlacementMetadata` 与 `RecruitingEngagement*`。候选人身份、简历、联系方式、聊天和面试内容不进入这些普通 metadata。

## 4. Capability 与 adoption decision

| Capability | 官方面 / Population | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `taxonomy.read.job-market/v1` | 产品 UI 中城市/岗位/经验等筛选 | `no-machine-contract` | 可研究概念；没有官方 taxonomy API/schema evidence |
| `discovery.search.public-jobs/v1` | 匿名/登录用户在官方产品内搜索 | `rejected-for-connector` | 人可用产品不等于第三方 API；不得以网页、Cookie、内部 wapi 或 browser automation 补位 |
| `content.read.public-job-posting/v1` | 人工打开职位页 | `rejected-for-connector` | 没有公开机器 contract；公开可见不授予自动读取/持久聚合权 |
| `content.import.user-selected-job/v1` | 用户主动提供的最小 evidence package | `manual-local-candidate` | 不是 BOSS Connector；用户选择并声明合法目的，默认只保存必要字段/引用与 provenance，不索取 Cookie |
| `content.export.own-personal-information/v1` | 数据主体自己的个人信息浏览/导出 | `out-of-purpose` | 不扩张为企业职位、候选人、简历、聊天或市场数据 export |
| `content.read.owned-job-postings/v1` | 招聘者自有职位管理 UI | `deferred/no-published-contract` | 若未来有官方企业 export/API，须按组织、授权、用途和字段重新建 profile |
| `recruiting.read.candidates-or-resumes/v1` | 招聘者产品 | `rejected` | 个人信息、非需求发现最小范围，且第三方插件收集/保存被规则明确限制 |
| `recruiting.read.conversations/v1` | BOSS/BOSS HI 产品 | `rejected` | 30日历史或产品可见性不授予外部存储、下载、传播或 AI 分析权 |
| `recruiting.communicate/v1` | 开聊、交换联系方式、邀约 | `rejected` | 无官方 API；自动/批量沟通会影响真人、触发骚扰和真实性风险 |
| `job.publish/v1` | 认证招聘者在产品内发布真实职位 | `no-probe/deferred-business-operation` | 禁止测试/虚假职位；即使未来有正式接入，也须真实招聘、持续授权、人工批准和平台合同 |
| `job.syndicate.partner/v1` | BOSS 向关联/合作平台分发职位 | `platform-managed/unknown-contract` | 仅证明平台可能分发，不证明用户或本系统可调用/回读/控制 |
| `research.materialize.boss-job-market/v1` | 长期数仓、全文/向量索引、RAG/training | `policy-blocked` | 当前没有数据使用、再利用、AI、保留/删除和平台书面许可依据 |

当前 `callable routes = 0`。`manual-local-candidate` 只描述系统如何接受用户提供的证据，不对 BOSS 发请求，也不构成“已支持 BOSS”。

## 5. Access Methods

### 5.1 官方用户产品

- BOSS 网页、App 与桌面端向真人提供职位浏览、搜索、推荐、沟通和招聘管理；
- 隐私政策表明部分基础浏览/搜索可在未登录状态发生，但匿名可见性不是 API、自动化或数据再利用许可；
- 任何用户侧输入只可由用户自己在官方界面完成。本系统不控制页面、不注入脚本、不复用会话、不截获内部请求。

### 5.2 BOSS HI

- BOSS HI 是 BOSS 直聘旗下企业沟通协作产品，用户协议允许与 BOSS 账号关联后的部分招聘沟通；
- 当前没有发现面向本用途的官方 BOSS HI developer API、ATS connector、export schema 或 sandbox；
- BOSS HI 用户协议同样要求通过其软件使用服务，并限制未经许可的第三方工具、插件、自动登录和数据获取。它不能作为 BOSS 网页自动化的替代通道。

### 5.3 平台合作分发

- 用户协议允许 BOSS 把职位分享到关联平台和第三方合作平台；
- 这是平台作为 controller 的内部/合同分发能力。没有公开 partner contract、字段、回执、删除传播或调用授权时，不创建 access method；
- 若未来用户提供正式合作合同，只为该 legal principal 创建独立 partner profile，不把它推广为 public capability。

### 5.4 用户个人信息权利

- 访问、更正、删除、撤回、注销和个人信息导出属于数据主体权利；
- 它不授权招聘企业导出求职者数据，也不提供岗位市场数据；
- 即使用户主动提供自己的导出包，也只能在该用户明确目的、范围、保留期和撤回规则下处理，且不进入本职位需求 Pack 的默认数据面。

### 5.5 Manual evidence package

这是唯一保留的未来输入候选，且不是平台 route：

- 用户在官方产品中自行选择一个职位，并主动复制最小事实或上传其有权使用的材料；
- intake 固定来源 URL、用户选择时间、可见 surface、字段选择、purpose、rights assertion、representation kind=`manual-extract` 和 coverage=`selected-only`；
- 默认字段仅限职位标题、雇主展示名、职责/要求的必要摘录、广告薪酬角色、地区、观察时间和来源引用；个人姓名、头像、在线状态、联系方式、聊天、简历和候选人全部拒绝；
- 不把一条用户选择样本称为 search result、全量职位、持续监控或平台 Connector；
- 精确正文若无保存依据，仅保留短 evidence span/derived facets，原始材料按最短保留并支持删除。

## 6. Platform Skills

### `boss-pack-research/v1`

- purpose：`research/curate`；
- 固定协议目录、current agreement IDs/versions/hashes、产品面、官方合作/导出/API负证据、概念和能力变更；
- 输出 KnowledgeProposal、expiry、drift triggers 与 unresolved questions；
- 禁止登录、扫码、创建账号、同意协议、控制浏览器、调用内部 wapi、安装或运行社区项目。

### `boss-manual-job-evidence/v1`

- purpose：`manual-intake`；
- 输入必须是用户主动选择并提供的最小职位 evidence package，以及 purpose、rights/retention assertion；
- 输出 `JobPostingRecordMetadata`、`JobPostingSpanMetadata`、manual-extract provenance 和 selected-only coverage；
- 拒绝 Cookie、二维码、storage state、账号密码、候选人/简历/聊天/联系方式、批量页面和后台 export 猜测；
- 只做本地预览和 proposal，写入 canonical/evidence/index 前仍需 policy gate。

### `boss-job-demand-interpretation/v1`

- purpose：`analyze`；
- 从已批准的最小职位事实提取职责、技能、工具、地区、广告薪酬和组织投入假设；
- 每个痛点/需求结论引用 exact span 与 posting revision，明确 employer-authored、观察时间和 selected-only coverage；
- 禁止把 posting count 当 headcount、把薪资当采购预算、把消失当 filled、把招聘者行为当候选人转化。

### `boss-access-review/v1`

- purpose：`verify/policy`；
- 输入 future official contract/export/API evidence、legal principal、organization authorization、purpose、data classes、AI/index/derivative、retention/deletion和effect；
- 必须在 credential/network/PortBinding 前判定；“页面可见”“开源项目可用”“ATS 已安装”“BOSS 可对外分发”都不能满足 access evidence；
- 没有平台书面许可、exact scope 或候选人合法处理基础时 fail closed。

### `boss-contract-fixture-conformance/v1`

- purpose：`verify/diagnose`；
- 仅使用合成 fixture 验证 job/opening/posting、状态、薪酬角色、placement、manual coverage、PII rejection 和 no-write policy；
- 不访问 BOSS、不复放真实页面/网络响应、不保存真实用户数据。

本 Pack 不定义发布或沟通 Probe Skill。真实招聘不是“需求测试素材”；没有实际岗位、招聘主体、有效授权、招聘资源和履约意图时，发布职位属于明确禁止面。

## 7. 数据、索引与推断边界

- 稳定平台知识、协议版本、concept/capability definition 和 OSS fixed revision 可进入版本化 snapshot；真实职位内容不是同类知识。
- 用户提供的 manual observation 如果通过 rights review，可进入分析数据库；snapshot/Dolt只保存其 schema、policy、evidence manifest和可追溯定义，不默认复制原始职位全文。
- lexical/semantic/vector index 是新的处理与保留面，不能因 Observation 可写就自动生成；必须携带 purpose、data-use、retention、deletion和derived-use decision。
- 招聘者姓名、头像、在线状态、联系方式和候选人相关数据不进入通用索引、prompt、metric、evaluation 或训练集。
- 当用户删除 manual source 或撤回权限时，删除必须传播到 evidence blob、projection、warehouse、全文/向量索引、cache 与派生引用，并生成 receipt；append-only history 不能阻断删除。
- 只允许表达“该用户在该时间选择的职位中出现了某职责/技能信号”，不能表达“BOSS 全市场需求”“某公司一定有新增 headcount”或“该岗位仍在招聘”。

## 8. 官方与开源证据审计

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；许可证只读核验 common license file。没有 clone、安装、构建、登录或执行：

| Artifact / revision | Ownership / License | 可学习内容 | 决策 |
| --- | --- | --- | --- |
| [BOSS直聘协议中心](https://about.zhipin.com/agreement?id=registerprotocol_33) | BOSS 官方 | current agreement IDs、规则、版本与数据/自动化边界 | `canonical-policy-evidence`；动态内容需 hash、expiry 和 drift monitor |
| [BOSS HI](https://hi.zhipin.com/) | BOSS 直聘旗下官方产品 | 企业协作和关联产品事实 | `official-product-evidence`；不是 developer API |
| [zhengziha/boss-zhipin](https://github.com/zhengziha/boss-zhipin/tree/c2818328cb53773fbf2e5a2e7004123380a01a7d) `c2818328…` | community；common paths 未见 LICENSE | Playwright、Cookie、内部 wapi、字段与反自动化失败模式 | `risk-reference`；不复用、不执行 |
| [mucsbr/mcp-bosszp](https://github.com/mucsbr/mcp-bosszp/tree/df9ba573829ded5cdd05abcfe5f055fb89e0befa) `df9ba573…` | community；MIT | MCP tool shape、二维码登录、Cookie/state、search/greeting副作用 | `rejected-route-reference`；代码许可不提供平台授权 |
| [Snseam/boss-zhipin-mcp](https://github.com/Snseam/boss-zhipin-mcp/tree/06a1a7d804aa80131a066bddc1879ac4bc72f841) `06a1a7d8…` | community；common paths 未见 LICENSE | 招聘者端 CDP、候选人搜索、简历 OCR/数据库、消息发送风险 | `rejected-sensitive-automation` |
| [longsizhuo/BossZhiPin_Job_Search](https://github.com/longsizhuo/BossZhiPin_Job_Search/tree/d797cdeede941cae502c09555206fa051c17fbbe) `d797cdee…` | community；MIT | 求职者侧浏览器自动化和人工确认 UX；README 自身提示可能违反条款 | `risk-reference`；不作为 Connector/Skill |
| [speedyapply/JobSpy](https://github.com/speedyapply/JobSpy/tree/fda080a373e8226f3fd60635323f5da9af9892b1) `fda080a3…` | community；MIT | 跨招聘站字段、封锁/限流和 partial failure schema | `schema-reference-only`；不是 BOSS 官方授权证据 |

未发现 BOSS 官方 GitHub SDK、OpenAPI、MCP Server、Agent Skill、ATS developer documentation 或面向职位研究的 public API。该结论是有日期的 discovery evidence，不是永久不存在声明；drift monitor 需持续复核官方协议、帮助、合作入口和域名。

## 9. Verification Plan

### evidence-review

- 固定协议列表、三个 agreement ID/version/date/content hash、BOSS HI 官方归属和产品描述；
- 逐条保存第三方工具、ATS/插件、爬虫、职位真实性、招聘授权、简历/沟通和平台分发边界的 evidence spans；
- 负证据查询保存 query、official domain set、observedAt、结果和 expiry，不把“未发现”写成“永不存在”；
- community artifact 固定 revision/license/capability/risk，代码许可与平台授权分栏。

当前只有 evidence-review 设计，没有 accepted snapshot、evidence hash 或 VerificationReport。

### static-contract

- `boss-zhipin` 与 BOSS HI、合作平台、ATS 和 public ATS provider 不合并 identity；
- requisition/opening/posting/placement 与 application/chat/resume/interview/offer/hire 分离；
- manual extract 必须带 user selection、purpose、rights assertion、selected-only coverage 和 observedAt；
- BOSS profile 的 network route、credential requirement、Cookie/session input 和 external effect 均为零；
- public job read/search、candidate/resume/chat read 和 job/message write不能由 community artifact 自动注册；
- JobPosting metadata 不含候选人 PII、聊天文本、简历 bytes 或工资实际支付值。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| one user-selected posting | representation=`manual-extract`、coverage=`selected-only`，不生成 search/page cursor |
| copied job with recruiter name/online status | 普通 projection 剥离个人字段，原输入按policy拒绝或受限 |
| one posting with “招聘多人” | posting-count 与 opening/headcount unknown 分开 |
| salary range + bonus text | advertised min/max/bonus角色分开，不生成offer/payroll |
| posting disappears next observation | lifecycle unknown/removed observation，不自动标 filled |
| same title reposted with new ID | 保留两个native refs，只生成有证据的 repost/possible-duplicate relation |
| BOSS outbound partner copy | `syndicated-from` relation candidate，不共享canonical ID或推断开放 API |
| chat then resume then invite | 三个独立 restricted engagement；不推断 application/interview held |
| Cookie/QR/storage-state input | intake前拒绝，zero log/snapshot residue |
| candidate/resume/chat payload | policy blocker；zero warehouse/index/prompt/eval residue |
| community MCP manifest | 只生成risk evidence，不产生Connector/PortBinding/tool registration |
| fake job probe request | 在任何平台调用前拒绝并生成policy audit |
| deletion request | manual source及projection/index/cache清除并生成receipt |

### sandbox-live / operational-canary

当前没有可运行 sandbox-live：没有官方机器 access method、sandbox、schema 或授权合同。网页访问、二维码登录、内部 wapi 和社区浏览器自动化不能充当 sandbox。若未来出现官方企业 export/API/partner contract，必须创建新的 account profile 和 Pack revision，从 evidence review、静态 contract、合成 fixture、平台 sandbox 逐级晋升；不会继承本 Pack 的“官方产品存在”作为 live verification。

本轮唯一可运行验证是本地合成 fixture；不访问平台，不产生账号或真人影响。

## 10. Observability Contract

允许的低基数通用字段：

```text
pack_ref
surface_ref
agreement_key
agreement_revision
capability_ref
access_decision
representation_kind
coverage_class
rights_decision
personal_data_class
policy_outcome
fixture_outcome
deletion_outcome
```

受限 audit/trace 可保存：evidence snapshot/hash、manual package opaque ref、user selection/rights assertion ref、posting opaque ref、definition revision、field rejection reasons、retention/deletion receipt 和 future contract ref。

禁止进入普通 log/metric label：账号、Cookie、BST/token、二维码、storage state、手机号、微信、招聘者/候选人姓名、头像、简历、聊天正文、职位全文、精确地址、薪资值、内部 endpoint、原始响应或截图。

关键 alert：

- agreement key解析到新 ID/version、规则内容或 BOSS HI/partner/API evidence drift；
- community项目或用户输入试图注册Cookie/browser/wapi/MCP route；
- `manual-extract`被错误标记为API/search/full coverage；
- posting count被解释为opening/headcount，聊天/邀请被提升为application/interview/hire；
- 个人信息进入snapshot、warehouse、index、prompt、log或eval；
- fake/test job、自动沟通、候选人批量处理或第三方ATS连接请求未在network前拒绝；
- 删除后evidence/projection/index/cache仍有残留。

## 11. 发布决定与晋级条件

当前 Pack 保持 `researched/manual-only`：

- 可发布为版本化稳定知识的，是 BOSS 概念、能力负边界、协议版本、开源风险证据和本地合成 contract；
- 不发布 BOSS Connector、浏览器辅助 route、Cookie/wapi adapter、候选人/简历/聊天能力或招聘 Probe；
- `manual-evidence-package` 仍只是 intake contract 候选，必须在 accepted snapshot、rights policy、retention/deletion contract 和 fixture report 后才能成为本地可用能力；
- BOSS 不加入 Public ATS Channel：Greenhouse/Lever成员具有官方公开 GET contract，BOSS 没有同等 access/verification maturity；
- 若未来出现官方 developer/partner/enterprise export，必须证明 exact legal principal、组织授权、官方 schema、用途、个人信息角色、AI/index许可、保留/删除、quota、sandbox、错误语义与运维支持，才可建立独立 profile。

下一次 drift review 触发器：任一 current agreement ID/version变化、官方发布开发者/ATS/企业 export 文档、BOSS HI开放接口、平台合作 API、或个人信息导出范围发生变化。
