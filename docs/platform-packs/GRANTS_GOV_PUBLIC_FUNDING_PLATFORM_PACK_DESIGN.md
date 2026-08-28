# Grants.gov Public Funding Opportunity Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / staging-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`grants-gov-public-funding/v0-design`

## 1. 平台产品与population

本Pack只覆盖公开联邦资助机会，不覆盖申请草稿/提交、申请人workspace、grantor管理、award执行或SAM实体数据。两个官方API产品必须独立：

| Surface | Access/schema | 当前含义 |
| --- | --- | --- |
| Grants.gov `search2` / `fetchOpportunity` | 无认证；production与staging | legacy/current public opportunity search/detail |
| Simpler.Grants.gov API | Login.gov创建API key；快速演进 | full catalog search/detail；独立schema/revision |

[API Guide](https://www.grants.gov/api/api-guide)说明`search2`和`fetchOpportunity`无需认证并提供staging；search可按keyword、opportunity number、agency、status、eligibility、ALN、funding category等筛选。[Simpler developer page](https://simpler.grants.gov/developers)说明当前只读，默认60 requests/min、10,000/day，闲置key 30天禁用，写操作尚不支持。

## 2. 概念与抽象映射

| Native concept | `PublicFunding*` | 约束 |
| --- | --- | --- |
| opportunity | opportunity record | numeric ID与opportunity number均保留；名称不去重 |
| forecasted/posted/closed/archived | lifecycle | provider state，不按deadline猜测覆盖写 |
| Assistance Listing / ALN | classification | 不是programme、topic或award ID |
| eligibility/funding instrument/category | eligibility/classification | code taxonomy revision固定 |
| ceiling/floor/estimated total/expected awards | amount/aggregate roles | 不是award、paid或market size |
| synopsis/expected outcome | issuer-authored span | 是机构目标，不是用户原话或结果 |
| attachment/contact | external/restricted artifact | 默认不下载attachment、不保存联系人身份 |

amendment、forecast→posted与status变化形成revision/history；当前detail不证明完整历史。只有exact provider link才可连接未来award/project。

## 3. 权利、MCP 与开源证据

[API Terms](https://www.grants.gov/api/terms-conditions)明确允许search/display/analyze/retrieve，并要求展示“uses the Grants.gov API but is not endorsed or certified”声明、不得虚假表示内容且须遵守限制。每个binding固定Terms digest、attribution和purpose；不能把政府数据一般原则扩张到attachment中的第三方材料。

固定官方[ simpler-grants-gov `5e8acfd…`](https://github.com/HHS/simpler-grants-gov/tree/5e8acfda43b4ad57bc4668f436fcacaa98cc92c1)与[CommonGrants `b874691…`](https://github.com/HHS/simpler-grants-protocol/tree/b874691558cf1991019d3ea04bd84b3f112aea1b)均CC0。CommonGrants是mapping/spec候选，不允许覆盖Grants.gov native fields或把applications/awards尚未开放的能力伪装可用。

[GSA MCP catalog](https://github.com/GSA-TTS/mcp-server-hub-catalog/blob/0bc00dfb74c86ca597bcc60d4d9d9633467e309c/docs/servers/grants_gov.md)列出search/fetch两个read tools，并明确为POC、非production；其指向的`HHS/mcp-server-grants-gov`在核验时404，故只保存catalog/tool-schema evidence，禁止安装、连接或镜像推断源码。

## 4. Skills、fixture、观测与晋级

`grants-gov-contract-research/v1`只读官方docs/terms/fixed source；`grants-gov-fixture/v1`用synthetic opportunity测试；未来`approved-read/v1`只允许exact legacy或Simpler binding，不能silent fallback或混合schema。

fixture覆盖：forecast/post/close/archive、无close date、多due dates、eligibility/instrument、ceiling/floor/total/expected-count、amendment、分页/排序、legacy-vs-Simpler identity、contact/attachment drop、attribution、MCP source 404和zero application/write。

Telemetry按`API product × schema/terms revision × query/filter/sort × agency/status/window`记录requested/returned/retained/dropped、pagination/history、amount-role completeness、identity conflict、attribution、attachment/contact quarantine、schema/MCP-source drift、rate与zero writes。晋级为official evidence → fixture → 用户批准staging canary → production read canary；staging不证明production coverage或durable materialization。
