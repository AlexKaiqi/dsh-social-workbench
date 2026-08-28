# OpenAlex Scholarly Graph Platform Pack 设计

状态：`researched / concept+metadata-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`openalex-scholarly-graph/v0-design`

## 1. 产品、概念与价值

本Pack描述OpenAlex当前[API](https://help.openalex.org/api/)、[data model](https://help.openalex.org/data/)及只读access产品。其价值是把works、authors、sources、institutions、topics等组织成provider-normalized graph，并给出DOI/PMID/PMCID等external IDs、citation relation、topics和availability，适合跨来源候选发现。OpenAlex native ID、entity merge/redirect、topic、keyword、citation count和search relevance都是provider判断，不能冒充source identity、作者结论、科学有效性或用户需求。

本系统默认丢弃author姓名、affiliation和person graph；只保留work-level authorship authority ref或必要的去身份化coverage。外部source text视为不可信输入，不能进入prompt/tool instruction或绕过content policy。

| Surface | 契约 | 边界 |
| --- | --- | --- |
| API core corpus | list/filter/search/sort/group/page/select/fetch | `corpus=all` expansion是另一population；query/sort revision固定 |
| snapshot | manifest、JSONL/Parquet、deleted IDs、quarterly/current revision | snapshot含expansion且与API default不同；未下载 |
| content/full text | PDF、GROBID TEI、provider content access | 与metadata分开计费/entitlement/rights；GROBID可解析错误 |
| provider merge | OpenAlex ID redirect/merged entity | 保存merge evidence和旧ref；不静默重写历史 |

## 2. 能力、access 与rights

concept capability为work list/search/read、aggregation、citation/relation expansion、snapshot import和content availability discovery。当前只建metadata route fixture；[access文档](https://help.openalex.org/access/)中的无key/basic、key budget和hard limit进入route policy，但不产生key或请求。API key未来只能用Credential ref。

官方说明OpenAlex data为CC0；这只覆盖provider data contract，不能自动覆盖由publisher/repository提供的abstract、PDF或TEI内容。[full-text文档](https://help.openalex.org/access/fulltext/)的“service not documents”语义、单篇location/license、content version、entitlement和parser provenance必须逐record保存。`is_oa`、`has_fulltext`或URL只表明provider状态，不是本系统的reuse批准。

OpenAlex Work可投影Crossref、PubMed、Europe PMC、arXiv等同一work。exact external ID建立common-origin relation；没有exact ID时只生成candidate，不按title fuzzy merge。citation count缺失或变化不能直接物化为impact，core/expansion也不能比较为同一分母。

## 3. Skill/MCP、Fixture 与晋级

[ourresearch/openalex-help@5ad8070](https://github.com/ourresearch/openalex-help/tree/5ad807039582c5c05c7ace600588e51906414ebb)是官方help source witness，根license未发现，不vendoring。[cyanheads/openalex-mcp-server@46f8782](https://github.com/cyanheads/openalex-mcp-server/tree/46f8782376126e26d4c4c332c712e4bab6c3ac5f)是Apache-2.0社区MCP，仅用于能力词汇调研；不安装、运行或信任hosted endpoint。官方Agents guidance也不是MCP/Skill contract，且其paste-key建议被本系统secret policy拒绝。

synthetic fixture覆盖core/expansion差异、DOI/PMID common-origin、merge redirect、deleted ID、topic/provider annotation、citation update、abstract index without licence、OA flag without approved purpose、TEI parse provenance、cursor/budget block和zero curation/write。Telemetry按`corpus × route/snapshot revision × work/version × representation × licence`记录coverage、merge/deletion、identity conflict、topic/citation drift、content entitlement和zero effects。

metadata-only canary需用户批准；snapshot、full-text content、durable graph和author identity分别另审。OpenAlex corrections/curation、hosted MCP、credential-in-chat及任何write拒绝。
