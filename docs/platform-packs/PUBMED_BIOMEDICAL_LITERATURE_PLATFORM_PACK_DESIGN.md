# PubMed Biomedical Literature Platform Pack 设计

状态：`researched / concept+metadata-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`pubmed-biomedical-literature/v0-design`

## 1. 产品、概念与价值

本Pack只描述PubMed citation/abstract index和NCBI Entrez读取契约。官方[E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25499/)提供ESearch、EFetch、ESummary、ELink等Entrez入口；[PubMed download](https://pubmed.ncbi.nlm.nih.gov/download/)提供年度XML baseline及有顺序的daily new/revised/deleted updates。它适合发现生物医学工作、native citation status、MeSH分类、DOI/PMID/PMCID relation和可能含限制的abstract；PubMed记录不是PMC全文、同行评审证明或研究结论验证。

| Native concept | `PublicResearchLiterature*` | 约束 |
| --- | --- | --- |
| PMID / citation | provider record/work identity | PMID是PubMed record；DOI/PMCID关系保留，不等于同一representation |
| citation status | native state/index process | Publisher/In-Data-Review/In-Process/MEDLINE等不等于publication truth |
| publication type | record taxonomy | review/trial/correction等按NLM revision解释，不推断study quality |
| abstract | abstract representation | author/publisher可能持有版权；不存在不等于研究无限制 |
| MeSH/major topic | classification authority | NLM indexing，不是author finding或用户需求 |
| retraction/correction links | exact notice relation | notice、target、direction和revision分开保存 |
| baseline/update deletion | history/update coverage | 年度baseline替换旧baseline，再有序应用daily updates |

作者、ORCID、affiliation默认不采集，不形成person/lead graph。MEDLINE indexing authority与article authorship/publisher authority分别保存。

## 2. route、频率与rights

concept capability为citation search/read/link、metadata/abstract fetch和baseline/update import fixture。route fixture固定database、utility、query/history token、retmode/rettype、DTD/schema、pagination、tool/email、rate/backoff和native error；不调用NCBI。官方文档要求提供`tool`与`email`，无API key默认不超过3 requests/s，key一般支持更高默认速率；未来credential只作Host-side ref。

[NCBI policies](https://www.ncbi.nlm.nih.gov/home/about/policies/)说明美国政府材料在适用处可能public domain，但NLM不主张abstract版权并不代表abstract无版权。citation metadata、abstract和PMC article分别记录rights。若未来需要PMC全文，只能使用[PMC developer resources](https://pmc.ncbi.nlm.nih.gov/tools/developers/)列明的Cloud/OAI/FTP/E-utilities/BioC surface，并逐篇检查OA/reuse license；这不属于当前PubMed route自动降级或fallback。

PubMed、Europe PMC、OpenAlex和Crossref常含同一PMID/DOI来源。exact ID只建立common-origin/alternate representation relation；ESearch、baseline和Europe PMC再次返回不增加独立证据数。

## 3. 开源、Fixture 与晋级

[ncbi/docker@a8bc179](https://github.com/ncbi/docker/tree/a8bc179e2f78876e7b4d683ab0619a38f17e23b1)包含官方EDirect Docker packaging且有public-domain notice，只作静态source witness；不拉取image、不安装或执行EDirect。

synthetic fixture覆盖PMID↔DOI↔PMCID、citation/PMC representation隔离、MEDLINE status、MeSH provider authority、retraction/correction relation、abstract copyrighted/absent、baseline replacement、ordered update/delete、DTD drift、ESearch history/rate error、PII drop和zero writes。Telemetry按`utility × query/baseline/update revision × PMID/work/version × citation status × rights`记录coverage、update ordering、deletion、relation/identity conflict、abstract availability和rate/rights block。

用户批准metadata-only canary后也不开放PMC全文、author identity、durable corpus或Entrez写入。submit/correct citation、账户操作和所有write/effect拒绝。
