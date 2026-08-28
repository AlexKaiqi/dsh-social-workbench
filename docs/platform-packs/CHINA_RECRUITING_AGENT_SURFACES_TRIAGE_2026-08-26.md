# 中国招聘平台 Agent 接入候选分流

状态：`researched` 候选分流；未登录、未获取授权凭证、未调用 API/MCP、未采集职位/简历/聊天、未发布或投递  
核验日期：2026-08-26  
目标：比较 BOSS 直聘、猎聘和智联招聘的真实官方机器接入面，选择下一份 Platform Pack；避免把网页可见、官方 AI 宣传、社区 MCP 或可运行自动化误写成可采用 Connector。

## 1. 选择结论

本轮选择猎聘。原因不是“猎聘更容易爬”，而是猎聘已经公开了一个由官方页面直接链接的用户侧 Agent/CLI 安装与授权入口，能检验一条更重要的架构原则：

> 官方 Agent/MCP 存在，只能证明某个主体、凭证、工具和即时用途可能获得正式访问；它不自动授予公共市场采集、批量监控、长期数仓、向量索引、AI 再利用或招聘者侧自动化能力。

三平台当前分流如下：

| 平台 | 独特需求信号 | 当前官方机器接入证据 | 当前 adoption | 下一步 |
| --- | --- | --- | --- | --- |
| BOSS 直聘 | 直接沟通型岗位、招聘主体、职责与广告薪酬 | 未发现面向本用途的公开 API/ATS/export/sandbox；现行规则限制未经许可的第三方工具、自动化和非正常数据获取 | `manual-only`，平台 route=0 | 仅保留用户主动提供的本地最小 evidence intake；完整 Pack 已完成 |
| 猎聘 | 中高端职位、企业—猎头—候选人三边关系、推荐/面试/入职服务 | 官方 MCP 配置页直接链接 `liepin-tech-2026/liepin-cil`；用户 Token 支持本人职位搜索/查看、简历查询/补全与投递 | `official-agent-surface/deferred`，当前 callable route=0 | 完成独立 Pack；先固定身份、用途、工具、数据与副作用边界，不生成 Token |
| 智联招聘 | 综合职位、雇主与候选人流程 | 未发现面向本用途的公开 developer contract；现行法律声明明确限制 robot/spider/crawler、截图、数据挖掘/监控及未经书面同意的 AI 训练 | `manual-only/deferred` | 保留 drift monitor；出现官方 API/export/partner contract 后重新研究 |

猎聘不会加入 [Public ATS Channel](PUBLIC_ATS_CHANNEL_PACK_DESIGN.md)。Greenhouse/Lever 的 Channel 是由雇主 roster 限定的公开 GET surface；猎聘当前官方入口是候选人本人授权的 Agent 工作流，两者 population、legal principal、purpose、credential、retention 和 effect 都不同。

## 2. 猎聘为什么值得先建模

### 2.1 稳定产品概念不同

猎聘官方投资者关系页面把产品描述为 B-H-C 生态：企业（Business）、猎头（Headhunter）和候选人（Candidate）是不同角色。猎头个人、猎头企业、招聘企业和候选人不能压成一个 `user`；职位搜索、候选人推荐、面试服务、入职服务和保证期结果也不能压成一个 `application`。

这要求通用招聘抽象至少能表达：

- `JobPosting*`：requisition、opening、posting、placement、状态和广告薪酬；
- `JobActorRole`：employer、recruiter、staffing agency、headhunter、headhunter enterprise、candidate；
- `RecruitingEngagement*`：application、candidate recommendation、interview invitation、interview service、offer、hire、placement service 与 hire guarantee；
- engagement 的 provider state 和粗粒度 phase 独立存在，不能用“已接受推荐”推断“已入职”。

### 2.2 官方 CIL/MCP 是产品证据，不是完整接入合同

[猎聘智慧招聘系统](https://ir.liepin.com/system/)当前公开描述 CIL（Common Interface Layer）、外部系统/工具/AI 模型、MCP、AI Agent 实时调用、职位动态同步、人才画像结构化输出和行业/薪酬数据。该页面证明猎聘拥有或推广这些产品能力，但没有公开 endpoint、认证模型、tool schema、scope、sandbox、数据使用、保留、删除或第三方开发者条款。

[猎聘 MCP 授权配置页](https://www.liepin.com/mcp/server)则提供更窄而可核验的用户侧表面：

- 官方页面直接链接 [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil) 作为 GitHub 安装地址；
- 登录用户可生成 90 天有效的授权 Token，重新生成会立即使旧 Token 失效；
- 页面列出的 CLI 能力为 setup、auth、本人 resume 查询/更新、job 搜索/投递；
- 搜索、查看、简历更新和投递共享每分钟 60 次调用限制；
- HR 回复仍通过 App 推送/短信承接，实时沟通返回 App；后续 Agent 进度查询仍属计划能力；
- Token 代表用户在平台上的操作授权，相关操作记录可在 App 查看。

因此架构必须把以下四件事分开：

1. 官方页面对 GitHub artifact 的分发链接；
2. artifact 的代码来源、固定 revision 和软件许可证；
3. 用户 Token 对具体 tool 的平台授权；
4. 本系统对数据处理、长期保存、索引、AI 派生和外部副作用的独立 adoption decision。

前三项存在也不能跳过第四项。当前研究没有登录或获取 Token，也没有得到静态 tool schema、测试 fixture、数据使用合同或 live receipt，所以仍然是 `callable routes = 0`。

## 3. 当前协议边界

### 猎聘

- [猎聘用户服务协议](https://wow.liepin.com/t1008237/index.html?agreementType=A0001)当前页面标注 2024-07-25 更新、2024-08-01 生效；招聘用户须实名/活体认证、关联招聘单位，并仅以职务行为使用平台。
- 协议禁止虚假身份/内容、规避规则、异常使用账号资源，以及通过程序或非正常浏览、spider/crawler/模拟用户、规避技术措施、盗链、抓取、读取、模拟下载、深度链接、复制、转移或存储平台数据。
- 平台数据必须按产品/服务声明的目的与方式使用；不得利用平台信息进行未经授权的广告或营销。
- [个人信息保护政策](https://wow.liepin.com/t1008237/index.html?agreementType=A0002)当前页面标注 2026-08-17 更新、2026-08-21 生效；游客模式只允许有限职位列表浏览，简历和手机号是求职交流的必要个人信息，扩展功能依赖明确同意。

官方 MCP 是“正常、明确的产品路径”，但只覆盖其页面声明的用户 Agent 操作。它不能反向授权网页抓取、内部接口、公共市场复制、候选人数据分析或招聘者自动化。

### BOSS 直聘

Current [用户协议](https://about.zhipin.com/agreement?id=registerprotocol_33)（`20260617v2`）和[招聘行为管理规范](https://about.zhipin.com/agreement?id=postrules_11)（`20240828v1`）限制未经许可的第三方 ATS/工具/插件、自动登录、职位浏览/发布、简历收发、候选人信息收集和 spider/crawler 等非正常获取。详细结论见 [BOSS 直聘招聘需求 Platform Pack](BOSS_ZHIPIN_RECRUITING_PLATFORM_PACK_DESIGN.md)。

### 智联招聘

- [智联招聘法律声明](https://rd6.zhaopin.com/aboutus/legal/notices)当前明确禁止以 robot、spider、crawler、截图或其他技术方式监控、复制、传播、展示、下载网站内容，禁止未经许可的数据挖掘、收集和未经事先书面同意将网站内容用于 AI 训练。
- [智联招聘隐私政策](https://rd6.zhaopin.com/aboutus/legal/privacy)当前页面标注 2026-07-23 更新、2026-07-30 生效，区分游客、求职者和招聘者流程，并涉及简历、招聘认证和沟通等个人信息。

页面可见性和社区自动化不能满足书面同意。未发现官方开发者 contract 是有日期、可过期的负证据，而不是永久不存在声明。

## 4. 开源候选与固定 revision

以下 revision 于 2026-08-26 通过只读远端核验固定；只读取公开 README/manifest/common license path，未 clone、安装、构建、登录或执行：

| Artifact / revision | 来源 / License | 可学习内容 | 决策 |
| --- | --- | --- | --- |
| [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil/tree/858a62bd839d490e8745b7503961e4676a54b9d7) `858a62bd…` | 猎聘官方 MCP 页直接链接；common paths 未见 LICENSE | 官方 CLI 命令形状、用户 Token 配置、JSON/schema 校验意图 | `official-distribution-candidate`；无许可证/无执行验证，不能 vendoring 或运行 |
| [xllinbupt/MCP2skill](https://github.com/xllinbupt/MCP2skill/tree/3d8f1dec0f58b67b3b2a88a1b1fb7c302cb5029e) `3d8f1dec…` | community；MIT | MCP Registry manifest、`streamable-http`、`x-user-token` secret 形状和社区包装风险 | `manifest-reference`；`io.github.xllinbupt` 不是猎聘 publisher identity |
| [dizhouid-lgtm/liepin-ai-loop-recruiting](https://github.com/dizhouid-lgtm/liepin-ai-loop-recruiting/tree/a12d13c66595cbbbedfbe35bd6d035a39b209ce8) `a12d13c6…` | community；MIT | 招聘者批量候选人/简历筛选与浏览器登录的高风险 surface | `rejected-sensitive-automation` |
| [jolie-z/Auto-JobHunter](https://github.com/jolie-z/Auto-JobHunter/tree/4f9dec38978035a87d34cab5b15914dc8688e6f0) `4f9dec389…` | community；personal/educational-only，不是 OSI 开源许可 | Cookie、抓取、LLM 评估和自动投递的失败/副作用面 | `risk-reference-only`；不可作为开源依赖 |
| [jiyangnan/AgentMesh-JobAgent](https://github.com/jiyangnan/AgentMesh-JobAgent/tree/4c5b63a284e98d70d6ff2f9c1d77ba2c30d06463) `4c5b63a2…` | community；Apache-2.0 | 多平台 search/apply、云端字段发送、真人投递的 effect 边界 | `rejected-route-reference`；代码许可不提供平台授权 |

固定 revision 只稳定代码审计对象，不稳定外部 endpoint、服务条款、Token 规则或平台权限。官方链接也不自动解决仓库缺少许可证的问题。

## 5. Probe 与数据决定

- 不允许用虚假职位做招聘需求 Probe；没有真实岗位、主体、授权、预算和履约意图时不能发布。
- 求职者投递不是本系统用于发现市场需求的 Probe。它会向真实招聘者创建候选记录并消耗真人时间，属于个人求职高影响动作。
- 用户本人职位搜索未来可被建模为 query-scoped、short-lived、user-directed workflow；在 data-use/retention 证据不足时，不得扩张为市场监控或长期索引。
- 本人简历查询/补全属于个人数据工作流，不进入招聘需求 Pack 的默认数据面；每次变更都必须预览和确认。
- 候选人、简历、联系方式、聊天、面试内容、精准薪酬和投递记录不进入通用数仓、向量索引、prompt、eval 或训练集。

完整设计见 [猎聘 Agent 招聘 Platform Pack](LIEPIN_AGENT_RECRUITING_PLATFORM_PACK_DESIGN.md)。

## 6. 重新发现触发器

- 猎聘发布版本化 OpenAPI/MCP tool schema、认证 scope、开发者/数据使用条款、sandbox、fixture 或 receipt contract；
- 猎聘明确公共职位研究、聚合、缓存、长期保存、索引、AI/RAG 和删除传播权利；
- 智联发布官方 developer portal、用户自有 export 或有明确书面授权的 partner contract；
- BOSS 发布适用于目标主体和用途的官方 API/export/ATS contract；
- 任一平台的协议、隐私政策、官方 GitHub 链接、Token 有效期、rate limit、能力列表或产品身份发生漂移。

重新发现只能产生 KnowledgeProposal；不能自动创建 credential、PortBinding、网络 route 或 write capability。
