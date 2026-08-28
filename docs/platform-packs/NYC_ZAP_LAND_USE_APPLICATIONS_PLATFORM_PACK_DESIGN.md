# NYC ZAP Land Use Applications Platform Pack 设计

状态：`concept-fixture + exact Socrata dataset fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`nyc-zap-land-use-applications/v0-design`

## 1. 稳定概念与官方证据

NYC Open Data的[Zoning Application Portal (ZAP) - Project Data](https://data.cityofnewyork.us/w/hgx4-8ukb/25te-f2tw)固定dataset ID `hgx4-8ukb`。官方资料说明public dataset由ZAP数据派生，并包含从旧LUCATS迁移的历史项目；字段随milestone更新。public dataset、内部CRM和历史迁移origin必须分开。

[官方ULURP流程](https://www.nyc.gov/site/brooklyncb9/resources/uniform-land-use-review-procedure-ulurp.page)把DCP filing/certification、Community Board hearing/recommendation、Borough President/Borough Board recommendation、City Planning Commission hearing/approve/modify/disapprove、City Council与Mayor review分成不同authority stage。Community Board/Borough President为advisory，不得把recommendation、waiver或no action映射为competent approval；时限必须绑定process revision，不能把旧流程图中的天数视为永远有效。

固定的官方历史源码[db-zap-opendata](https://github.com/NYCPlanning/db-zap-opendata/tree/5ad207dc21c41d33af1e858f46f7d255837c7636)已归档，明确从CRM筛选`General Public`项目并连接BBL。它同时包含需要client secret的私有CRM client，不能作为公共Connector；pinned revision也未发现license file。当前[data-engineering](https://github.com/NYCPlanning/data-engineering/tree/03cb07f413017bf023a01705dc6127372edad1c1)为MIT官方工程参考，但不替代dataset metadata/schema revision。

## 2. 概念映射

| Native | `PublicPlanningApplication*` |
| --- | --- |
| project / action / ULURP number | application/project + requested action identities |
| public visibility | public access gate；internal CRM fields不可fallback |
| project/public status | attributed native lifecycle；completed不自动等于approved |
| milestone / date | event + exact process stage/revision |
| Community Board / Borough President | advisory authority + recommendation posture |
| CPC / Council / Mayor | distinct competent/review authority and decision records |
| BBL companion | exact parcel relation；restricted location projection |
| migrated LUCATS record | origin/history marker；不假设与native ZAP同coverage |

## 3. 期望只读能力

`definition.read`、`dataset.metadata/schema.read`、`selected-public-project.metadata.read`、`action/milestone.read`、`authority-recommendation.metadata.read`与`decision.metadata.read`为fixture capability。未来Socrata canary必须固定portal、dataset ID、schema revision、public population、SoQL field allowlist、pagination/order、BBL exclusion/coarsening、history、rights、purpose、retention和deletion；禁止通用MCP跨portal discovery、任意SoQL或private CRM fallback。

## 4. Synthetic fixtures、可观测性与zero effects

Synthetic覆盖public subset≠all CRM、LUCATS migration origin、project status/public status conflict、one project→multiple actions/BBLs、Community Board approve≠CPC decision、waived/no action≠approval、CPC modify后Council review、Mayor stage missing、completed date≠physical build、BBL/exact parcel drop及dataset/schema drift。

Telemetry逐`dataset ID × schema/process revision × origin × authority/stage × public filter × action/project/decision coverage × location policy`报告returned/retained/dropped、status conflict、missing stage、migrated history、quarantine、fallback rejection与zero writes。本轮没有调用Socrata data row、ZAP项目详情、BBL row或CRM。application filing、public testimony/comment、document upload、appeal/contact/subscribe和所有admin/write恒拒绝。
