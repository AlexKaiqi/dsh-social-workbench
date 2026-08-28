# Toronto 311 Customer-Initiated Service Requests Platform Pack 设计

状态：`researched / concept+route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`toronto-311-customer-initiated/v0-design`

## 1. 官方人口、分区与状态

[311 Service Requests – Customer Initiated](https://open.toronto.ca/dataset/311-service-requests-customer-initiated/)通过official CKAN metadata说明数据来自telephone、fax、email、online self-serve、mobile API和Twitter，只覆盖Solid Waste Management、Transportation Services、Toronto Water、Municipal Licensing & Standards及Urban Forestry等参与divisions。

资源按年度ZIP分区，当前metadata列出2010至2026及readme XLSX，refresh rate为monthly。年度file、当前metadata revision和未来追加year是partition policy，不得当成独立population或重复证据。

| Native concept | 抽象 | 约束 |
| --- | --- | --- |
| creation date/time | request schedule | 进入division work system的时间 |
| original request type | classification | 保留original，即使backend后来改变 |
| division/section-unit | assignment | published division对应original type |
| Initiated/In Progress/Canceled/Closed | native state/lifecycle | Closed只作source-declared resolved |
| FSA/intersection/ward | coarse location | 只显示geospatial validated records；coverage不完整 |

官方把Closed定义为division已调查并采取necessary action to resolve；本系统仍保存`source-declared-action-taken-or-resolved`，不升级为现场已解决、及时、满意或不复发。

## 2. Location、rights与route

公开location被处理为postal-code前三位FSA或street intersection，并只显示通过City geospatial validation的request。普通projection进一步只保存opaque ward/postal-prefix ref，不复制intersection；无法验证位置的request缺失不能解释为没有问题。

[Open Government Licence – Toronto](https://www.toronto.ca/city-government/data-research-maps/open-data/open-data-licence/)允许合法目的的复制、修改、发布和适配，但明确排除Personal Information并无担保。rights binding固定license revision、attribution与personal-information exclusion，不能把OGL推成个人信息、第三方权利或无期限保留的许可。

route fixture固定CKAN package metadata、yearly ZIP resource manifest、monthly refresh、original-type semantics和OGL；本轮未下载任何ZIP/XLSX或row。fixtures覆盖annual partition去重、original type/division与later change、participating-division denominator、unvalidated-location missing、FSA/intersection coarsening、Cancelled/Closed不同、source channel≠unique user、Personal Information drop和zero report/contact/write。
