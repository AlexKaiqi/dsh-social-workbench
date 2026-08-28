# arXiv Preprint Platform Pack 设计

状态：`researched / concept+metadata-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`arxiv-preprint/v0-design`

## 1. 产品、概念与价值

本Pack描述arXiv [query API](https://info.arxiv.org/help/api/index.html)与[OAI-PMH](https://info.arxiv.org/help/oa/index.html) metadata surface。arXiv适合发现较早公开的研究问题、方法边界、失败条件、版本修订和未来工作；e-print/preprint不自动表示同行评审、journal acceptance、结论有效或用户需求。

| Native concept | `PublicResearchLiterature*` | 约束 |
| --- | --- | --- |
| arXiv ID + `vN` | work/version identity | exact version固定；latest不能覆盖历史span |
| Atom entry | API search/repository representation | search placement/query revision保留，不代表排名质量 |
| OAI item/header/metadata | repository record/update history | OAI默认latest metadata；`arXivRaw`可含version history |
| OAI datestamp | metadata modification schedule | 不是original submission/replacement date |
| category/cross-list | repository classification | 是arXiv taxonomy，不是scientific finding |
| journal ref/DOI | external relation candidate/evidence | 后补字段不自动证明两个expression完全等同 |
| withdrawal/replacement | native lifecycle/version relation | withdrawal≠journal retraction或全工作无效 |

## 2. route、版本与rights

concept capability为Atom search/read、OAI identify/list sets/list records/get record和metadata/full-text availability discovery。query fixture固定search fields、boolean syntax、sort、start/max_results、Atom schema和pagination；OAI fixture固定metadataPrefix、set、from/until、resumption token、nightly lag、endpoint/schema/taxonomy revision。官方页面记录2025年OAI HTTPS host迁移，因此route不能硬编码成永恒地址。

OAI metadata可在[API terms](https://info.arxiv.org/help/api/tou.html)和acknowledgment要求下复用；abstract/source/full-text仍按submission license和用途分别核验。full-text S3或其他官方分发是独立content route，当前不下载。commercial project需额外复核terms/brand/affiliation；API availability不是endorsement。

arXiv metadata可同时被Crossref、OpenAlex、Europe PMC收录。exact arXiv ID/version、DOI relation才建立common-origin/alternate representation；title/author fuzzy match只作candidate。不同`vN`可能改变限制段落，evidence必须绑定具体version/content hash。

## 3. 开源、Fixture 与晋级

[arXiv/oaipmh@27ad99e](https://github.com/arXiv/oaipmh/tree/27ad99e3e37ab7919869bd3d4cd24449dea78135)与[arXiv/arxiv-docs@7dd9f1d](https://github.com/arXiv/arxiv-docs/tree/7dd9f1db40d92d4debf72632aee36538fd3dc527)均为MIT官方source witness；只做静态契约研究，不运行service。

synthetic fixture覆盖v1→v2 replacement、withdrawal、journal DOI later-added、OAI latest/arXivRaw history、datestamp semantics、category/cross-list、Atom/OAI common-origin、resumption token、endpoint/schema/taxonomy drift、restricted content和zero submit/write。Telemetry按`API/OAI × query/set × arXiv ID/version × metadataPrefix/schema × content licence`记录coverage、version/history completeness、identity/relation conflict、route drift、rights/rate block和zero effects。

metadata-only canary需用户批准；full-text version/span、bulk/S3和durable corpus分别另审。submit/new version/withdraw/endorse/account/write全部拒绝。
