# Public Funding Priorities & Funded R&D 候选分诊（2026-08-26）

状态：`researched`；requested=4，fixture-eligible=4，callable=0，durable-approved=0  
目标 Channel：`public-funding-priorities/v0-design`

## 1. 覆盖缺口与第一性原理结论

现有系统能看到客户抱怨、搜索、职位、采购和交易，但缺少“公共机构明确愿意资助哪些问题”和“哪些研发活动已经获得资金配置”的信号。它不是采购：grant/assistance通常按公共目标、资格与项目方案配置资源，不是买方向供应商购买约定交付物。

共同最小事实是：issuer/programme、call/opportunity/topic、eligibility/instrument、schedule、amount role、award/project identity、recipient/result authority、representation、coverage、rights与revision。资助机会只证明机构优先级；award只证明资金决定；recipient abstract/result summary不证明科学有效、项目成功、采用或市场需求。

## 2. 候选与当前判定

| 候选 | 信号增量 | 官方表面 | 当前判定 |
| --- | --- | --- | --- |
| Grants.gov / Simpler.Grants.gov | 跨美国联邦机构的forecasted/open/closed机会、资格、资助范围与金额边界 | [Grants.gov API](https://www.grants.gov/api)、[Simpler developers](https://simpler.grants.gov/developers) | synthetic fixture eligible；legacy staging与未来只读canary候选；未建立binding |
| NIH RePORTER / ExPORTER | NIH及其他联邦机构已资助科研项目、年度支持、组织、金额、公共健康相关性与输出关系 | [RePORTER API v2](https://api.reporter.nih.gov/?urls.primaryName=V2.0) | synthetic fixture eligible；public production canary候选；PI/PO身份默认drop；无sandbox |
| EU Funding & Tenders / CORDIS | EU grant call/topic与Horizon funded project/result，带programme、topic、participant与开放数据 | [F&T APIs](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis)、[CORDIS services](https://cordis.europa.eu/about/services) | synthetic fixture eligible；public API/open-data canary候选；grant/tender和EU/beneficiary content rights分离 |
| SBIR.gov / STTR | 小企业技术问题topic、Phase I/II机会、award与企业研发投入 | [Data resources](https://www.sbir.gov/data-resources)、[Solicitation API](https://www.sbir.gov/api/solicitation) | synthetic fixture eligible；API currently maintenance/degraded；bulk license/更新合同待固定 |

`fixture-eligible`只表示可用手写合成数据验证schema和推断边界。当前没有真实API、下载、MCP、API key、账号或materialization授权。

## 3. Skills、MCP 与固定开源候选

| Artifact | 固定revision / license | 结论 |
| --- | --- | --- |
| [HHS/simpler-grants-gov](https://github.com/HHS/simpler-grants-gov/tree/5e8acfda43b4ad57bc4668f436fcacaa98cc92c1) | `5e8acfd…` / CC0 | 官方实现/OpenAPI/schema drift evidence；不安装或运行 |
| [HHS/simpler-grants-protocol](https://github.com/HHS/simpler-grants-protocol/tree/b874691558cf1991019d3ea04bd84b3f112aea1b) | `b874691…` / CC0 | CommonGrants跨生态协议候选；只作projection/mapping参考，不替代native ontology |
| [GSA-TTS/mcp-server-hub-catalog](https://github.com/GSA-TTS/mcp-server-hub-catalog/tree/0bc00dfb74c86ca597bcc60d4d9d9633467e309c) | `0bc00df…` / root license未发现 | 官方GSA pilot目录，含Grants.gov与NIH RePORTER；明确非production |
| `HHS/mcp-server-grants-gov` | catalog所指source在核验时404 | source/registry drift；MCP不可晋级或执行 |
| [GSA-TTS/mcp-server-nih-reporter](https://github.com/GSA-TTS/mcp-server-nih-reporter/tree/bf8d8cb49a047b244859f01a8d5c708a19198fee) | `bf8d8cb…` / root license未发现 | 官方POC，含sampling/full-summary/ranking/dashboard与resource skills；只作tool/fixture证据 |
| [pipeworx-io/mcp-eu-funding-tenders](https://github.com/pipeworx-io/mcp-eu-funding-tenders/tree/bff2e2c6ec89daa6257cea35519d7c8ea332cac7) | `bff2e2c…` / MIT | community MCP；含derived stale-deadline/filter逻辑，不能作为官方schema或生产route |
| [tavitatavi/cordis-mcp-server](https://github.com/tavitatavi/cordis-mcp-server/tree/3254e4c1b70e43d3dde44bc89207d4abc3c4ba9c) | `3254e4c…` / root license未发现 | community DuckDB/SQL/LLM eval样本；不安装、执行或提供model key |

未发现EU或SBIR官方领域Agent Skill/MCP。GSA pilot MCP的“政府组织维护”不等于data source发布者保证、production readiness或Connector conformance。

## 4. 选择与下一门槛

四个成员都进入同一Channel，但每个surface独立晋级。下一步先用synthetic fixtures验证native identity、lifecycle、money roles、classification authority、PI/contact drop、search/bulk overlap与zero apply/write；再分别审查exact schema/terms/license。只有用户另行授权后，Grants.gov staging、NIH public production read、EU public/open-data read可设计最小canary；SBIR先等待maintenance解除或固定bulk更新/许可合同。
