# Crossref Scholarly Metadata Platform Pack 设计

状态：`researched / concept+metadata-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`crossref-scholarly-metadata/v0-design`

## 1. 产品、概念与价值

本Pack只描述Crossref REST和公开metadata产品。官方[REST文档](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)将其定义为成员及其他trusted sources deposit的scholarly metadata，可包含DOI、type、title、abstract、funding、license、relation、reference、update和resource link。它适合发现研究主题、版本/更正关系以及可能含限制信息的候选工作；不负责证明deposit正确、论文经过同行评审、研究结论有效或link内容可下载/复用。

| Native concept | `PublicResearchLiterature*` | 约束 |
| --- | --- | --- |
| DOI work record | work/version/provider record identity | DOI精确匹配可作identity evidence；title/author/year只作candidate |
| `type` / container / member | record kind/source/registration authority | member deposit authority与article author/publisher claim分开 |
| `abstract` | abstract representation/content | 只有字段存在且rights/purpose获准才可抽span |
| `relation` / `update-to` | version/correction/retraction relation | relation direction和notice DOI保留；不改写旧work |
| deposited/indexed/issued dates | schedule with native meaning | deposit/index日期不替代publication date |
| `link` / license | external representation/access evidence | URL不等于entitlement或TDM许可 |
| reference/citation counts | provider coverage | deposited coverage不等于全部引用或影响力 |

[versioning guidance](https://www.crossref.org/documentation/principles-practices/best-practices/versioning/)区分draft/preprint/pending/AOP/AAM/VoR/updated，并建议重要correction/retraction用独立DOI notice表达。Pack据此保留work、version、expression、notice和relation，不用单一`latest`覆盖历史。

## 2. 能力、route 与rights

concept capability为works/journals/members/funders/licenses/types的list/search/read/filter/query/facet/sample和annual/bulk metadata import fixture。当前route fixture只保存HTTP method、resource template、query dialect、cursor/rows、response/schema、rate header、cache和error contract，不发送请求。

[access文档](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/)显示public无需signup，polite要求识别client，Plus使用key；rate/concurrency以当前响应header为准，429需退避。credential未来只允许ref，不进入URL、日志或fixture。公开metadata可广泛复用，但Crossref明确提醒某些abstract可能受版权保护；metadata、abstract和外链full text分别记录license/purpose/retention。

`works`结果可与OpenAlex、PubMed、Europe PMC或arXiv同源。dedupe只接受DOI或有证据的external relation；同一Crossref record通过filter/facet/sample/annual file出现不算独立观察。Retraction Watch CSV、public annual file和Plus snapshot是独立产品/coverage，不由REST fixture自动授权。

## 3. Fixture、开源与晋级

[CrossRef/rest-api-doc@00b1cc2](https://github.com/CrossRef/rest-api-doc/tree/00b1cc2c90e62d49c82f5381710590a6d9ca53ff)为CC-BY-4.0、但已deprecated，只作历史contract witness；当前官方网页docs优先。synthetic fixture覆盖preprint→VoR、correction/retraction notice、abstract absent/present-but-restricted、link-without-rights、same DOI multi-query、deposit date drift、cursor/rate error和zero writes。

Telemetry按`resource × query definition × record type × DOI/work/version × schema/license revision`记录returned/retained/dropped、abstract/relations/license completeness、identity conflict、same-origin、rate/rights block和zero effects。用户批准metadata-only canary后也只可晋级该route；abstract span、bulk file和durable index分别复核。submit/deposit/update/correct metadata和任何publisher workflow均拒绝。
