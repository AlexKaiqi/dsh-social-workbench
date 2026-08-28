# 公共请愿、支持计数与官方回应平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`
核验日期：2026-08-26

## 1. 为什么是独立领域

公共请愿提供一条少见的完整需求链：`petitioner-authored action → moderation/publication → accepted support snapshot → member-specific threshold → government/committee/chamber action → closure`。它比预算和专利更接近明确的“希望机构做什么”，又比社交讨论多一层正式程序与官方回执。

但请愿不是民调、选举、市场研究或法律救济替代物。发布只证明正式请求进入公开流程；支持数只证明平台在当时规则下接受的支持动作；审议、回应、辩论、采纳、实施和效果必须分开。

## 2. 首批成员与成熟度

| Member | 官方表面 | 信号增量 | 当前成熟度 |
| --- | --- | --- | --- |
| UK Government and Parliament Petitions | HTML + JSON/CSV representation +官方流程页 | 明确10,000回应、100,000考虑辩论的threshold-to-action链 | concept + route fixture |
| Scottish Parliament Petitions | HTML register + committee process + privacy notice | 所有published petitions由委员会考虑，不以签名门槛替代审议 | concept + selected-record/manual |
| Senedd Petitions | 双语HTML + JSON representation + committee process | 250 review、10,000考虑请求Senedd辩论，且不是保证 | concept + route fixture |
| European Parliament Petitions | portal + Rules of Procedure + PETI public documents | admissibility、Commission/committee跟进、hearing/visit/report/resolution | concept + selected-record/manual |

requested=4、concept-fixture=4、route-fixture=2、selected-record/manual=2、callable=0、durable-approved=0。route fixture只表示存在可由静态官方源码/页面约束的合成route contract，不表示部署revision相同、已授权采集或可长期保存。

本轮读取官方说明、隐私页、议事规则、固定官方源码和GitHub公开元数据。为确认公开representation envelope，曾各一次请求UK与Senedd的公开open-list JSON；没有保留或使用petition row内容，也没有继续读取列表或详情。未创建、支持、签名、验证、联系、订阅或执行第三方项目。

## 3. 共同事实边界

- published petition最多形成`EvidencePublishedPetitionRequest`，不证明内容真实、平台背书、代表性、法律义务或需求规模；
- accepted signature/support snapshot最多形成`EvidencePlatformAcceptedPetitionSupport`，不是unique verified people、eligible population、representative opinion或独立需求；
- count可因验证、fraud/invalid、withdrawal、deletion和paper/online reconciliation变化甚至下降；必须保留observation time与count policy；
- threshold reached只证明达到成员当时规则中的数值条件；“considered for debate”不等于scheduled/debated，debated不等于approved/adopted/implemented；
- official response、committee action、referral、hearing、debate、report/resolution和closure分别形成`EvidenceOfficialPetitionResponse`，不互相代替；
- rejected/hidden/stopped不等于没有需求或内容错误；只证明在特定process revision下的处置及reason；
- email verification或“一人一签”规则不是本系统独立核验身份；一个signature action也不是一名独立用户或一票；
- constituency/country/region aggregate与总数常是同一组签名的不同projection，不可重复计数；低cell或精细位置默认drop；
- creator与signer的姓名、邮箱、邮编、地址、电话、IP、citizenship和special-category/political profile默认不进入普通projection；
- bilingual/multilingual summary是official rendition/common-origin，不是新petition或独立证据；
- Parliament dissolution/election closure不证明问题已解决；外部petition sites也不在官方平台分母内。

## 4. Agent Skill、MCP与开源审计

| Artifact | revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [alphagov/e-petitions](https://github.com/alphagov/e-petitions/tree/5db95bc747c2f7216c5316d1ee65c0cae05568bc) | `5db95bc…` / MIT, Crown Copyright GDS | UK官方service的state、JSON/CSV representation、signature invalidation与read/write route separation | official source evidence；不安装/执行，不等于任何成员部署相同revision或数据rights |

未发现可验证的议会官方Agent Skill或MCP；该结论是`discovery-incomplete`，不是不存在证明。搜索结果中的金融、专利或社区launch“petition”与议会公共请愿不是同一概念，拒绝复用。没有把通用浏览器、HTML scraper或未知MCP列为Connector fallback。

规划Skill：

- `public-petition-source-contract-research/v1`：只读官方docs、规则、隐私与固定官方source，输出Pack/drift proposal；
- `public-petition-conformance/v1`：只运行synthetic fixtures；
- 未来`approved-public-petition-read/v1`：必须绑定exact member/state/window/topics/fields/purpose/retention/deletion；当前返回`no-authorized-public-petition-binding`。

## 5. Probe结论

本Channel没有Probe。创建、寻找初始supporters、sponsor、sign、email verify、撤签、分享campaign、提交委员会evidence、联系petitioner/committee、订阅更新或改变petition状态都是政治参与或官方程序副作用。即使内容真实，也不能作为无人值守的需求测试。真实参与只能进入另一个由本人发起、逐动作说明与确认的manual civic workflow。
