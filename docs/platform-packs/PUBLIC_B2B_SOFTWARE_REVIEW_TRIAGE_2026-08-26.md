# Public B2B Software Review & Switching Evidence 候选分流

状态：`researched / design-only`  
核验日期：2026-08-26

## 1. 信号价值与第一性边界

G2、Capterra与TrustRadius比通用论坛更接近采用后反馈：review常把use case、likes/pros、dislikes/cons、problems solved、recommendation、选择理由和switched-from产品结构化。它们适合发现使用阶段痛点、价格/能力阻力与迁移触发器，但不能把rating、verified/vetted badge或平台AI summary当成事实真值。

本轮最重要的结论是：**公开网页、付费数据产品、vendor-owned export、licensed quote syndication、buyer intent和竞品market intelligence是不同access populations。** 三个平台都不能因review公开可见就进入自动采集；机器访问与长期分析必须由具体subscription、entitlement、API scope、内容许可和用途合同共同授权。

共同抽象补充：

- `ProductFeedbackCollectionBinding`独立记录provider verified/vetted assertion、verification method、incentive tri-state、collection/solicitation、moderation/authorship policy与受治理experience context；
- `ProductFeedbackContentRole`区分title、use case/deployment scope、pros/likes、cons/dislikes、problems solved、selection/switching reason与recommendation context；
- `ProductFeedbackRelationKind`只在exact provider field存在时表达compared-with、selected-over、switched-from、switched-to；文本提及只能产生review candidate；
- provider verification不证明陈述真实，incentivized不等于positive，未显示incentive也不证明没有；
- reviewer name、work email、LinkedIn、job title、company、country和细粒度firmographics默认drop/restrict，不能用“B2B”作为身份采集理由；
- AI/provider summary、category rank、Grid/score、market presence、intent score与raw review分别建authority和representation，不交叉补全。

## 2. 候选成熟度

| 候选 | 官方机器面 | 权利/用途结论 | 当前决定 |
| --- | --- | --- | --- |
| G2 | subscription API；官方remote MCP，OAuth scopes含`products.reviews.read` | 公开站点自动collect/cache/index/store与AI使用明确要求事先书面同意；API/MCP数据依subscription与entitlement | `contract-eligible / fixture-candidate / no binding`；只能走获批API/MCP read scope |
| Capterra / Digital Markets | Reviews Insights、own-product Download Tool、licensed competitive comparison；未发现通用public review API | 自动采集、存储、AI分析明确禁止；own-product download仅内部使用，竞品review引用/计算受严格许可 | `contract/manual-export candidate / public blocked` |
| TrustRadius | vendor API：product scores、licensed TrustQuotes、traffic/intent/visitor insights；API key/paid package | 网站Terms禁止AI/robot/scraper访问；API内容与population按vendor entitlement，TrustQuotes是licensed excerpts而非全站review feed | `owned/licensed API candidate / public blocked` |

requested=3；public-web callable=0。G2 fixed API/MCP schema与TrustRadius vendor API可进入合成fixture候选，但在取得实际商业合同、scope与data-use evidence前都没有Connector binding。Capterra目前只保留合同/人工export研究。

## 3. 官方证据

### G2

- [G2 API](https://documentation.g2.com/docs/g2-api)提供product、category与review data，定位为custom workflows/advanced use cases。
- [G2 MCP Server](https://documentation.g2.com/docs/g2-mcp-server)是官方remote MCP，使用OAuth 2.0；review read scope为`products.reviews.read`。它还暴露buyer intent和可create/update/delete Research Boards的write tools，因此“官方、read-only集成示例”不能替代exact tool/scope effect gate。
- MCP/API访问需要G2 account、subscription与对应entitlements；文档当前声明global 100 requests/sec，超限block 60秒，仍需以合同与运行证据为准。
- [Terms of Use](https://legal.g2.com/terms-of-use)于2026-07-09更新，未经事先书面同意禁止自动collect/scrape/cache/index/store/archive review、rating、taxonomy、derived data，也禁止将站点内容用于ML/生成式AI训练、测试、评估或改进。
- review可带verified/validated、incentivized/source、likes/dislikes/problems solved与switching字段；这些都是provider assertions/context，不是事实认证。

### Capterra / Gartner Digital Markets

- [General User Terms](https://www.capterra.com/legal/terms-of-use/)于2026-05-04更新，覆盖Capterra、Software Advice、GetApp及关联域；同样明确禁止未经书面许可的自动extract/cache/index/store与AI/ML使用。
- [Content Compliance Policy](https://www.capterra.com/legal/content-policy/)允许客户内部使用Reviews Insights；Download Tool只允许下载自己产品的reviews并在组织内部使用。对其他provider的review引用、竞品批评、自行计算与外部分发有额外限制。
- [Community Guidelines](https://www.capterra.com/legal/community-guidelines/)区分verified reviewer、vendor response、non-incentivized与vendor-referred incentive；激励必须与rating无关并披露。
- “Reason for choosing”“Switched from”“Used the software for”和aspect ratings具有高价值，但只有合同/export exact field才进入projection，网页显示不构成采集授权。

### TrustRadius

- [Terms of Use](https://www.trustradius.com/static/terms-of-use)允许personal/internal business display，但明确禁止使用AI、robot、spider、scraper等自动方式访问站点或创建review；页面当前仍标注2020-12-04更新，需短expiry监控。
- [官方API portal](https://apidocs.trustradius.com/docs/public-api/YXBpOjUxMzgzNjA-trust-radius-api)发布vendor API；[Content Licensing](https://solutions.trustradius.com/products/content-licensing/)提供TrustQuotes library/widget/API，用于获许可review excerpts的syndication。
- product score、traffic、downstream intent、visitor insights与TrustQuotes是不同datasets。TrustQuotes excerpt、provider Community Insight或HG Insights installation summary不能冒充full authored review或独立用户证据。
- vetted、LinkedIn verification、incentivized、use case、pros/cons和likelihood-to-recommend进入collection/representation metadata；身份与firmographics保持restricted。

## 4. Skills、MCP与开源候选审计

| 候选 | 固定revision / license | 价值 | 决定 |
| --- | --- | --- | --- |
| G2 official remote MCP | hosted service，无公开源码revision | 官方OAuth、review/product/category/buyer-intent schema；混有Research Board writes | `official-contract-candidate`；不连接，未来只允许固定read toolset/scope |
| [API Evangelist TrustRadius profile](https://github.com/api-evangelist/trustradius/tree/3493f42b3d08089d0f24b3a127536e3219ed620e) | `3493f42…`；未发现repo license | 固定官方OpenAPI副本、辨别真实11 GET与fabricated scaffold；明确其MCP/Skills为第三方生成且无deployment | `static-reference-only`；需回链官方spec，不能当官方Skill/MCP |
| [omkarcloud/capterra-scraper](https://github.com/omkarcloud/capterra-scraper/tree/331966f76d59f686748c0f54453f2c552f0a1160) | `331966f…`；未发现repo license | 字段候选与分页失败模式 | `rejected-route-reference`；与现行禁止自动提取条款冲突 |
| [Scavio MCP](https://github.com/scavio-ai/scavio-mcp/tree/1659b5de7a14beb40875805a67a523daa9866503) | `1659b5d…` / MIT | G2/Capterra schema与multi-source MCP tool shape | `rejected-broad-scraping-route`；第三方API key/191 tools不提供平台许可 |
| [FactDen G2 scraper](https://github.com/factden/g2-reviews-scraper/tree/df57f052aa1a9c0826f482d0aa36bcee62953d25) | `df57f05…` / MIT | pros/cons/problems/switching字段样本 | `rejected-route-and-dataset`；声明scale/RAG与现行G2 Terms冲突，不读取其真实样本数据 |

未安装、执行或连接任何候选，也未读取仓库中真实review样本。开源许可只说明代码复用条件，不提供平台数据授权、content license、AI用途或长期保留权。

## 5. 下一步验证

1. 为G2固定API/MCP review schema，单独列出read tools与Research Board writes，做scope/effect负向fixture。
2. 为Capterra区分public web、own-product download、Reviews Insights和licensed competitor comparison；没有合同artifact时public population保持blocked。
3. 为TrustRadius区分product score、TrustQuotes、traffic、intent与visitor insights；只把licensed excerpt当excerpt representation。
4. fixtures验证verification/incentive unknown、structured switching exact relation、vendor reply、provider summary非author、firmographic drop与deletion/permission drift。
5. 任何真实API/MCP/OAuth/API key、vendor portal/export、subscription采购、review solicitation或vendor response都需用户另行授权；本Channel不创建、激励、回复或操纵review。
