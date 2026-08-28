# Austin 3-1-1 Public Data Platform Pack 设计

状态：`researched / concept+route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`austin-311-public-data/v0-design`

## 1. 官方概念与人口

[Austin 3-1-1 Open Data Portal Overview](https://www.austintexas.gov/3-1-1/open-data-portal)直接链接官方Socrata dataset `Austin-311-Public-Data/xwdj-i9he`。官方说明数据从2014-01-03开始；后来新增的request type只从其公开起点出现；dataset每天更新多次，包含new request和current request updates。

每个city department批准可上传的service request types；除受Texas Public Information Act保护的信息外，public service requests才可见。因此dataset既不是全部contact，也不是稳定不变的service-type roster。历史上Code Compliance type重命名为`Austin Code – Request Code Officer`，taxonomy rename不能制造新需求或丢失lineage。

## 2. Schema与证据边界

官方列出的字段包括description、location、status、method received、created/closed/status/updated dates、service request type/code/department/number、status description以及street、zip、latitude/longitude和map point。

- request number是record identity，不是person或incident identity；
- status和status description只形成source-declared state/disposition；
- created/updated/closed current fields不证明完整状态事件历史；
- department-approved type和protected-record exclusion必须进入coverage；
- official page说明不分享specific name、phone或email，但exact address/coordinates仍默认不进入本系统普通projection；
- description即使公开也可能包含敏感上下文，默认drop，只有另审的approved normalized category span可入证据。

## 3. Route、rights与验证

route fixture固定官方dataset ID、SODA read schema、2014起点、frequent refresh、mutable current state、service-type roster和location privacy；未调用query/export或row payload。官方页面指向generic Socrata developer resources不等于所有SODA method、配额或长期用途已获批准；rights/retention/index用途未完成exact terms review，durable保持0。

fixtures覆盖new type的later coverage start、taxonomy rename、protected type missing、current state overwrites prior observation、closed但现场未解决、same incident多request、exact location/free-text drop、department assignment变化、stale/incorrect dataset ID拒绝及report/contact/write zero effects。
