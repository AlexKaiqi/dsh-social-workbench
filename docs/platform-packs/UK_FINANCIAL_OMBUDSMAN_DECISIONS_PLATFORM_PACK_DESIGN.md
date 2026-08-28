# UK Financial Ombudsman Service Decisions Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-fos-decisions/v0-design`

## 1. 概念与价值

[FOS decision database](https://www.financial-ombudsman.org.uk/businesses/resolving-complaint/ombudsman-decisions)包含2013年4月1日以来公开的final decisions，可按product/business、sector、date和upheld/not upheld检索。它能揭示金融服务中的具体投诉议题、处理过程和救济，但官方明确提示每个case独特，数据库不是法律或FOS一般方法的决定性陈述。

| Native concept | `PublicDisputeDecision*` | 约束 |
| --- | --- | --- |
| complaint/case | case identity | 公开decision population不是全部complaint denominator |
| investigator assessment | investigator stage/content | 不得当final determination |
| provisional/final decision | stage + relation | final supersedes provisional，不抹去history |
| upheld/not upheld | native outcome + navigation family | 不代表市场发生率或普遍法律结论 |
| complainant acceptance | binding status | published final不自动binding |
| award/recommendation | remedy + exact role | binding award、recommendation和payment分开 |

## 2. Capability fixture

concept capabilities为official database/filter discovery、selected decision metadata/document reference、process/taxonomy revision和publication observation。当前只允许selected official-record fixture；未定义API/feed route，不得把HTML/internal search endpoint包装成API或用browser scraping fallback。

[FOS decision process](https://www.financial-ombudsman.org.uk/who-we-are/make-decisions)是binding policy的事实源：investigator view、provisional decision、final decision、complainant acceptance、binding effect、award/recommendation和judicial review分别建模。拒绝或未及时接受的final decision不能标`accepted-and-binding`。

## 3. 隐私、物化与验证

FOS说明会防止识别person或small-business complainant。ordinary projection drop姓名、initial、地址、contact、账户/保单/claim ref及能重识别的case detail；business/respondent只保存scope-local opaque ref。Dolt保存Pack/definition/outcome/binding/remedy taxonomy与lineage；分析库只接获准的最小case/domain/outcome metadata。

synthetic fixtures覆盖investigator view后final改变、provisional upheld后final not upheld、final accepted vs rejected/no response、binding award vs non-binding recommendation、published decision不等于representative denominator、page/document common-origin、complainant drop、route unavailable/no HTML fallback和complaint/accept/contact zero effects。真实selected metadata canary、document读取或durable materialization均需用户另批。
