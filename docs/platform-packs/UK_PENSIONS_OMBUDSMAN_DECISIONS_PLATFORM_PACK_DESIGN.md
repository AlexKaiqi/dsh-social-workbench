# UK Pensions Ombudsman Decisions Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-pensions-ombudsman-decisions/v0-design`

## 1. 概念与价值

[TPO decisions](https://www.pensions-ombudsman.org.uk/decisions)公开pension complaint/dispute、Financial Assistance Scheme appeal和PPF complaint/referral等determinations，可按topic、decision type、outcome、lead/significant与日期筛选。它能揭示pension administration、communication、benefit calculation和scheme process中的正式争议。

| Native concept | `PublicDisputeDecision*` | 约束 |
| --- | --- | --- |
| complaint/dispute/FAS/PPF matter | case + provider record type | 不同statutory path不合并population |
| Adjudicator view | investigator stage | 可被party反对，不是final determination |
| preliminary decision | preliminary stage | comment window后才可能final |
| Determination | final decision | 对各方binding/enforceable，仍保留appeal posture |
| upheld/partly/not upheld | native outcome | 不等于普遍责任或发生率 |
| direction/compensation | remedy | direction pending appeal仍可执行，除非法院stay/sist |

## 2. Procedure与appeal fixture

[investigation process](https://www.pensions-ombudsman.org.uk/investigation-process)把application review、investigation、Adjudicator view、preliminary decision和final Determination分开；[appeal guidance](https://www.pensions-ombudsman.org.uk/how-appeal)说明Determination最终且对各方有约束力，可就法律问题向适用法院上诉。England/Wales、Scotland和Northern Ireland的court、permission与time limit保持jurisdiction-specific ref，不压成一个通用期限。

当前只有selected official-record fixture。公开filter/page和PDF并不构成未经批准的callable route；不使用HTML/internal endpoint fallback，也不请求decision document。

## 3. 隐私、物化与验证

公开列表可能展示complainant initials；ordinary projection仍drop姓名、initial、地址、contact、member/account ref和可重识别case detail。respondent scheme/provider仅保存opaque organization ref，不做排名。

synthetic fixtures覆盖Adjudicator view→final change、preliminary→final、binding determination appealed、direction在appeal pending但未stay、court stay、variation/set-aside、不同FAS/PPF procedure不合并、initial drop、page/PDF common-origin、missing route无fallback和complaint/evidence/appeal/contact zero effects。真实selected metadata、document、appeal history和durable materialization均需另批。
