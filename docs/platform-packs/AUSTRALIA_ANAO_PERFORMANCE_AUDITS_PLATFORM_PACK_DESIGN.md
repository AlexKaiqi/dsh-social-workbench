# Australia ANAO Performance Audits Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`australia-anao-performance-audits/v0-design`

## 1. 概念与价值

[ANAO publications](https://www.anao.gov.au/pubs)提供报告与出版物目录。[Audit process](https://www.anao.gov.au/about/audit-process)说明performance audit按ANAO standards检查entity operations，经历objective/scope、planning/evidence和reporting；被审计方可评论并正式回应，过去建议的follow-up可进入未来work program。

[Performance audit process](https://www.anao.gov.au/work/insights/performance-audit-process)说明报告包含objective、scope、criteria、finding/conclusion、recommendation和entity formal response。由此形成exact report→finding→recommendation→response谱系，不能把response当审计发现。

## 2. 状态authority

[2024–25 performance audit outcomes](https://www.anao.gov.au/work/information/2024-25-performance-audit-outcomes)区分fully agreed、agreed with qualification、noted/no response和disagreed；entity self-reported implementation也可能与之后的ANAO follow-up audit不同。

| Native concept | 抽象 | 约束 |
| --- | --- | --- |
| audit objective/scope/criteria | scope-method binding | finding只在此边界内成立 |
| finding/conclusion | final auditor finding | 不推断fraud或普遍表现 |
| recommendation | recommendation | 不等于接受/落实 |
| entity response | response status/content | 保留qualification/no response |
| entity update | auditee self-report | 不是auditor confirmation |
| follow-up performance audit | follow-up audit authority | 新scope/revision独立保存 |

当前只定义selected official-record fixture。publications页面虽可筛选翻页，但未验证稳定版本化API/feed，因此不得包装HTML/internal endpoint或使用community scraper fallback。

## 3. 物化与验证

Dolt保存Pack、audit process、response/implementation taxonomy、identity/relation review和lineage；分析库仅接获准的最小organization/report/finding/recommendation/status metadata。fixtures覆盖fully agreed但未落实、qualified response、no response、self-report implemented而follow-up partial、follow-up作为新report、范围外推拒绝、自然人/contact drop及所有audit request/contact/subscribe/write zero effects。
