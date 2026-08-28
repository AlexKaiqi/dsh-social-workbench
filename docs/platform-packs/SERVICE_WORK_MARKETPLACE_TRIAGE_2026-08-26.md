# 服务采购 / 自由职业市场候选分流

状态：`researched` 候选分流；未创建账号、未授权应用、未调用 API/MCP、未采集或发布  
核验日期：2026-08-26  
目标：寻找能提供“真实工作范围、预算、响应和付费结果”的平台，同时判断其数据能否合法进入长期需求知识体系。

## 1. 从目标重新定义场域

自由职业平台不是普通招聘站，也不是商品市场。真正有价值的事实链是：

```text
client problem / deliverable request
  -> published work request
  -> invitation / proposal / interview
  -> offer / contract
  -> milestone or logged time
  -> payment / refund / dispute / feedback
```

稳定的共同概念应是 `ServiceRequest*` 与 `ServiceEngagement*`。公开工作描述与预算首先是客户主张；proposal 是服务方响应；contract/payment 才逐步接近真实采购结果。它们不能压成一个 `job`，也不能与企业 ATS 的 employment job、政府 procurement notice 或卖家 marketplace listing 混用。

主动 Probe 只有在用户确实有工作要委托、愿意选择并支付合格服务方时才真实。发布“看看有没有人投”的 ghost job 会浪费服务方时间或平台 credits/Connects，不是低风险实验。

## 2. 候选比较

| Candidate | 独特信号 | 官方接入 | 数据用途结论 | Probe 结论 | 决策 |
| --- | --- | --- | --- | --- | --- |
| Upwork | client job post、固定价/时薪、proposal/offer/contract/milestone/payment；当前官方 MCP 把 Agent 动作显式化 | GraphQL/REST API、OAuth2；2026-08-10 发布官方 remote MCP；官方 ChatGPT/Claude 集成 | API & MCP Terms v2.3 仅允许具体、用户指向任务；禁止 bulk/systematic monitoring、向量索引/RAG/衍生数据集等，缓存与MCP输出有严格保留/删除门 | 仅真实数字化、定制、付费工作；ghost/free/spam job禁止；write先draft-confirm，绑定/资金动作在Upwork网页完成 | 第一 Platform Pack；durable demand warehouse `policy-blocked`，ephemeral user-directed task 单独建模 |
| Freelancer.com | project/contest brief、bid、award、milestone、payment，适合验证类似但不同的对象链 | 公共 Developer API、OAuth2、官方 Python SDK `0.1.x`与sandbox | User Agreement禁止未经明确书面许可的自动访问（明确包含API）；API Terms只允许performance cache、要求至少每24小时刷新，并原则上禁止保存Data/其表达 | 必须是真实 project/contest；投标、award/accept、milestone/payment分别为高影响动作 | 第二 Platform Pack已形成；书面许可与storage例外前不形成 durable route |
| Fiverr | 以seller Gig/Package/Extra/Custom Offer为中心，buyer公开问题信号较弱 | 未发现面向本用途的公开开发者 API/SDK/MCP 证据 | Terms禁止bot、crawler、manual/systematic retrieval与数据库/目录构建 | 只有真实购买/Custom Offer；不适合作为公开需求发布Probe | `rejected-auto`；只保留未来官方partner或用户自有export重新发现触发器 |

## 3. Upwork 优先的原因

Upwork 不是最容易落地的候选，但它能最大程度检验正确抽象：

1. 官方 MCP 已把search、job post、proposal、offer、contract、milestone、message和payment相关动作暴露给 Agent。
2. 同一官方 Terms 又明确禁止系统性枚举、持续监控、AI训练/RAG、衍生数据集和独立Agent排名/决策。
3. 因而系统必须支持“官方、可调用、但对需求数仓不可采用”，以及“即时用户任务可采用、长期保存不可采用”的同平台多用途决定。
4. 官方 MCP 当前授权完整scope集合，和Connector最小权限原则存在真实张力，不能因为是官方工具就直接绑定。

完整结论见 [Upwork Service Work Platform Pack](./UPWORK_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)。

## 4. 后续顺序

1. 用无网络fixtures验证`ServiceRequest*`/`ServiceEngagement*`、contest entry/award/handover、ephemeral retention、policy-before-binding与zero-write。
2. Upwork与Freelancer.com独立Platform Pack已经完成；共同Channel发布为`researched`且明确`callable/durable members = 0`。
3. 后续只在成员精确许可允许时逐capability升级；blocked成员必须报告missing/restricted，不得由另一平台或非官方fallback代替。
4. Fiverr仅在官方API/partner/export或书面授权出现时重新进入候选池。

成员与组合设计：

- [Upwork Service Work Platform Pack](./UPWORK_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- [Freelancer.com Service Work Platform Pack](./FREELANCER_COM_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- [Service Work Demand & Truthful Procurement Probe Channel Pack](./SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md)

## 5. 主要官方证据

- Upwork：[API & MCP Terms v2.3](https://upwork.pactsafe.io/)、[官方 MCP](https://www.upwork.com/ai/mcp)、[API key申请](https://support.upwork.com/hc/en-us/articles/115015857647-How-to-request-an-API-key-from-Upwork)、[禁止的工作](https://support.upwork.com/hc/en-us/articles/1500007578942-What-kind-of-jobs-aren-t-allowed-on-Upwork)
- Freelancer.com：[Developer API](https://developers.freelancer.com/)、[API Terms](https://www.freelancer.com/about/apiterms)、[User Agreement](https://www.freelancer.com/about/terms)
- Fiverr：[Terms of Service](https://www.fiverr.com/legal-portal/legal-terms/terms-of-service)、[Community Standards](https://help.fiverr.com/hc/en-us/articles/37554441398929-Our-Community-Standards)
