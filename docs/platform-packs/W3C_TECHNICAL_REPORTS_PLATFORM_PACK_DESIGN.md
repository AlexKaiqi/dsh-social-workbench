# W3C Technical Reports Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / public-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`w3c-technical-reports/v0-design`

## 1. 产品与population

本Pack只覆盖W3C API中的公开specification/group/version/supersession metadata、Technical Reports catalog与获准的exact publication spans，不覆盖member-only内容、编辑/发布动作、GitHub issue/PR写入或完整网页抓取。

[W3C API](https://www.w3.org/api/)是无需认证的HTTPS JSON API；其specification endpoints覆盖shortname、status、versions、latest、predecessor/successor、supersedes/superseded与deliverer group。[TR catalog](https://www.w3.org/TR/)同时区分Recommendation-track Standards、Notes/Statements和Registries，不能按“都在TR页”统一成normative standard。

## 2. 概念映射与推断边界

[2025 W3C Process](https://www.w3.org/policies/process/)是本Pack当前process revision：Working Draft不必代表WG consensus，Editor's Draft没有官方地位；Recommendation才是W3C及成员endorsement。2025 revision移除了Proposed Recommendation，因此历史与当前记录必须绑定process revision，不能用旧枚举解释新publication。

| Native concept | `PublicTechnicalStandard*` | 约束 |
| --- | --- | --- |
| specification series/shortname/version | spec/edition/version identity | latest与dated edition并存，latest不覆盖历史 |
| WD/CR Draft/CR Snapshot/REC | native lifecycle | candidate、patent-review和recommendation语义分别保存 |
| Note/Statement/Registry | informational/registry record | 不继承Recommendation normativity |
| editor draft | editor-draft representation | 无官方standing，不等于WG或W3C endorsement |
| implementation experience/test report | implementation/test evidence | process evidence不证明全生态部署 |
| supersedes/predecessor/successor | exact relation | family/version/supersession不可用标题模糊合并 |

## 3. 接入、权利与开源证据

未来route只允许固定shortname/status/date/group和field selection的W3C API GET；TR HTML仅作human source link，不作为API失败fallback。W3C document license、Patent Policy与每份report status必须分别记录；API公开不自动批准全文持久化、embedding或衍生语料。

固定官方候选：[w3c/w3c-api@118324b](https://github.com/w3c/w3c-api/tree/118324b11dddfd1ce6af15cf5d80b0658e295197)。本轮未在root发现license，只作endpoint/schema witness，不vendoring、不运行。

## 4. Fixture、观测与晋级

synthetic fixture覆盖2023/2025 process revision、WD无consensus、CR Draft/Snapshot、REC、Discontinued/Obsolete/Rescinded/Superseded、Note/Statement/Registry、editor draft、dated/latest edition、implementation report、errata与zero publication/write。

Telemetry按`process revision × group × series/shortname × version/date × status × representation`记录status mapping、normativity/authority completeness、predecessor/successor/supersession、latest drift、coverage、rights/license、API error/rate与write attempts。最小canary未来只读一个known shortname metadata；不证明TR全文可materialize或规范已被实现。
