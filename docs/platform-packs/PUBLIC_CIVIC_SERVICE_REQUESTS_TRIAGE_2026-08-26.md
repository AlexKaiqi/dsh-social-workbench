# 公共 311 / 市政服务请求平台分流（2026-08-26）

状态：`researched / architecture-only / no-dataset-row-read`  
核验日期：2026-08-26

## 1. 为什么是独立领域

公共311/市政服务请求提供居民、企业、访客或政府部门主动报告的具体运营问题，以及分类、分派、状态和处置。它填补了现有Channel的首线服务链缺口：监管投诉是监管claim；申诉专员裁决是争议处理；公共运行状态是provider-wide incident；公共审计是有范围的assurance。它们都不能替代`request → classification → assignment → status update → source-declared disposition`。

第一性原理比较中，该领域优先于公共预算和专利：它更直接表达日常未满足服务需要，存在机器可读官方路径，而且可以在不保存个人身份和精确地点的前提下分析重复问题。代价是必须处理报告重复、发布人口、动态taxonomy、current-state覆盖和位置隐私。

## 2. 首批成员与成熟度

| Member | 官方表面 | 信号增量 | 当前成熟度 |
| --- | --- | --- | --- |
| NYC 311 | Socrata 2020–present + 2010–2019 archive | 大规模agency-directed request、status、agency与地理字段 | concept + route fixture |
| SF311 | Socrata cases + official explainer + Open311说明 | duplicate/incident歧义、agency-internal source、privacy处理 | concept + route fixture |
| Austin 3-1-1 | official portal + Socrata `xwdj-i9he` | department-approved service types、frequent current-state updates | concept + route fixture |
| 311 Toronto | CKAN yearly ZIP + metadata + OGL | participating-division population、coarse location、native status | concept + route fixture |

requested=4、concept-fixture=4、route-fixture=4、callable=0、durable-approved=0。本轮只读取官方网页、官方/政府catalogue metadata和固定源码；未请求任何service-request row、ZIP/CSV/JSON dataset payload或真实状态lookup。

## 3. 共同事实边界

- 一条published service request只证明记录存在，不证明一个独立person、独立incident、已验证缺陷、有效complaint或仍然存在的问题；
- 多条request可能来自同一人/同一incident，也可能是问题解决后再次发生；没有exact duplicate relation时只能保留candidate；
- requester、contact-centre representative和agency-internal request具有不同origin，不能都解释为resident demand；
- native `closed`、`resolved`或`action taken`只形成source-declared disposition，不证明现场解决、SLA达成、满意、持续有效或不再复发；
- current-state row、status event与历史snapshot分开；`updated_at`不证明每次状态变更历史完整；
- service type、participating agency、protected/excluded record和temporal partition决定分母；公开dataset不等于全部311 calls/contacts；
- exact address、unit/premise、coordinates、media、contact-linked location和unreviewed free text默认丢弃；普通分析最多保存opaque coarse ward/neighbourhood/postal-prefix ref；
- annual file、Socrata row、Open311 record、exact-ID API lookup和provider projection可同源，不能重复计数。

## 4. Open311、Agent Skill、MCP与开源审计

[Open311 GeoReport v2](http://wiki.open311.org/GeoReport_v2/)定义GET services/definition/requests/request，也定义POST request及临时token；GET requests默认最近90日，单次最多前1000条。采用该标准不授予POST，也不证明城市实现全部方法、JSON、历史或分页。

| 固定artifact | revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [BetaNYC/nyc-311-mcp](https://github.com/BetaNYC/nyc-311-mcp/tree/a2236a333e131ebadafa59174e0869f3c0724406) | `a2236a3…` / MIT | exact-ID lookup工具、public-read与partner-create产品隔离 | community MCP；不是官方Connector，不是dataset discovery/bulk contract，不安装执行 |
| [City-of-Bloomington/uReport](https://github.com/City-of-Bloomington/uReport/tree/34d29bcef79a5e018c2a4c8875ba011701d250c6) | `34d29bc…` / AGPL-3.0 | municipal CRM + GeoReport v2 server对象/失败模式 | server/write-capable参考；不是成员route |
| [codeforamerica/georeport-server](https://github.com/codeforamerica/georeport-server/tree/73cc033807addef2b793f9f592590d8072013933) | `73cc033…` / Apache-2.0 | 旧GeoReport v2 server/service-definition fixture | community historical reference；不得推断current compliance |
| [City-of-Helsinki/open311-service-definitions](https://github.com/City-of-Helsinki/open311-service-definitions/tree/e83b014c6681261b4c73b16f4c8e56e01f07c51b) | `e83b014…` / NOASSERTION | multilingual service-taxonomy drift样本 | 静态定义参考；无许可与route adoption |
| [socrata/soda-js](https://github.com/socrata/soda-js/tree/d6d528c919b6586abe211fdc8924af439677c830) | `d6d528c…` / package声明MIT | SODA client/schema/error参考 | vendor library参考；不安装，不决定城市数据rights |

未发现可验证的平台官方Agent Skill/MCP；该发现标记`discovery-incomplete`。BetaNYC MCP属于community并要求NYC API subscription key，只支持calendar/status和exact-ID lookup，不可因工具名含`list`就升级为公共dataset枚举或长期数仓能力。

规划Skill为`public-civic-service-source-contract-research/v1`和仅synthetic的`public-civic-service-conformance/v1`。未来`approved-public-civic-service-read/v1`必须绑定exact member/dataset or lookup、time window、service roster、coarse geography、fields、budget、purpose、retention与deletion；当前无binding。

## 5. Probe结论

本Channel没有Probe。虚假报修、重复报修、噪声/垃圾报告或为了测试响应而创建request会占用公共资源并可能影响紧急程度、现场人员和真实居民。真实本人市政问题只能进入另一个明确授权的manual civic workflow；POST Open311、app report、电话/短信、contact和subscription在本研究Channel全部拒绝并记录zero effects。
