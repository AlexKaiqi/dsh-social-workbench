# Public Technical Standards & Compatibility Change Channel Pack 设计

状态：`researched`；5个concept-fixture成员，4个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-technical-standards/v0-design`

## 1. 目标、成员和分母

本Channel发现正式技术标准化压力、兼容性迁移窗口和流程内实现反馈。它统一`PublicTechnicalStandard*` projection，但不统一组织流程、native lifecycle、normativity、authority、publication status、实现/部署程度、license或population。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| IETF Datatracker / RFC Editor | [Pack](IETF_DATATRACKER_RFC_PLATFORM_PACK_DESIGN.md) | concept+native-route fixture；public metadata candidate |
| W3C Technical Reports | [Pack](W3C_TECHNICAL_REPORTS_PLATFORM_PACK_DESIGN.md) | concept+native-route fixture；public JSON metadata candidate |
| WHATWG Living Standards | [Pack](WHATWG_LIVING_STANDARDS_PLATFORM_PACK_DESIGN.md) | concept+provider-route fixture；official repository/commit only |
| TC39 Proposals | [Pack](TC39_PROPOSALS_PLATFORM_PACK_DESIGN.md) | concept+provider-route fixture；official repository/commit only |
| OpenJDK JEPs | [Pack](OPENJDK_JEP_PLATFORM_PACK_DESIGN.md) | concept fixture；official machine contract missing |

requested=5、concept-fixture-eligible=5、route-fixture-eligible=4、callable=0、durable-approved=0。GitHub provider route不变成WHATWG/TC39 native API；任何成员不能继承IETF/W3C route成熟度。

## 2. 共同契约与禁止推断

共同projection固定organization/group/process revision、record/representation/native lifecycle、spec/proposal/draft/edition/repository commit identity、normativity、authority、transition/decision、implementation/test evidence、compatibility role、relation、history/coverage、rights与exact lineage。

- draft/proposal/work item不等于approved/published standard；published也不等于生态采用或部署；
- Standards Track、Recommendation、Living Standard、Stage 4、Delivered属于不同流程，不按名称或数字排序；
- normative requirement、informative rationale、editorial change、erratum、implementation report和test assertion分别归类；
- editor/champion/author、working group/committee、standards body、implementer和commenter authority不能继承；
- issue/comment/PR只形成相应作者的反馈，不能冒充committee consensus或editor decision；
- implementation interest、prototype、tests、two implementations或integration仍不证明所有vendor/runtime/version已shipping；
- updates/replaces/obsoletes/supersedes/withdraws/regresses必须保持方向、时间和revision，旧证据不删除但current projection失效；
- living latest必须固定observed commit/snapshot；provider mirror/fork与official source可能common-origin，不是独立证据；
- compatibility/deprecation/removal只证明正式文本所述范围，不证明任何用户安装受影响、迁移成本或购买意愿；
- standard/process/code公开不自动生成全文AI训练、embedding、再分发或永久保留权利；
- 本Channel不输出法律合规结论、标准认证、conformance verdict或市场规模。

## 3. 动态物化视图

- `emerging-normative-requirements-by-ecosystem-and-process-stage`：按exact normative span和native lifecycle展示，不跨组织排序；
- `compatibility-deprecation-removal-migration-by-target-version`：固定affected domain/version、change role与source revision；
- `proposal-regression-withdrawal-obsolescence-and-supersession-lineage`：展示完整方向关系并失效旧current projection；
- `formal-implementation-feedback-and-test-evidence-by-work-item`：只索引exact implementer/test authority，不提升为consensus；
- `living-versus-immutable-edition-drift`：比较latest commit、review/candidate snapshot和published edition；
- `standards-process-schema-rights-and-coverage-drift`：追踪process/API/schema/license/provider route、missing history与blocked member。

Dolt保存Pack、definition、process/schema/license digest、native taxonomy mapping、view definition、review decision、lineage和tombstone；获准的spec/issue/test spans未来才进入分析库。视图固定member/product/representation/process revision、authority、normativity、rights purpose与watermark；process revision、stage/status回退、supersession、commit变化、license或content policy变化触发partition invalidation/rebuild。

## 4. Channel Skills、Probe 与降级

`public-technical-standard-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal；不安装/执行、不调用API/MCP、不打开spec/JEP网页、不下载语料。

`public-technical-standard-conformance/v1`只用手写synthetic fixtures验证process revision、native state、normativity、authority、edition/commit、transition、relation、implementation/test evidence、compatibility role、provider/source authority和zero writes。

未来`approved-public-technical-standard-read/v1`只调度用户批准的exact member/product/group/work-item/path/field/window/budget binding；当前返回`no-authorized-public-technical-standard-binding`。不得fallback到HTML/browser/internal endpoint/community MCP/Skill/scraper或另一个成员。

本Channel没有标准化Probe。提交draft/proposal、评论、ballot、issue/PR或测试结果是在改变真实技术流程，不是需求测试；任何此类动作必须由未来独立、高影响工作流建模，不能借Connector或Probe执行。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| IETF individual I-D存在 | draft only；不标WG consensus、RFC或standard |
| W3C Working Draft / Editor Draft | 分开official standing；不标Recommendation |
| WHATWG issue有implementer comment | formal feedback only；不标editor decision/shipping |
| TC39 Stage 3→withdrawn | exact transition；旧Stage 3 view失效，不删除历史 |
| TC39 Stage 4 | ready/integration relation；不标所有runtime delivered |
| OpenJDK JEP Targeted | target release；不标GA/默认启用/用户采用 |
| same title / mirrored repo | 不merge；需exact identity/common-origin review |
| normative与informative span混合 | 分span归类；未知normativity不得升级证据 |
| GitHub/API失败 | missing-member/coverage degradation；no HTML/community fallback |
| submit/comment/ballot/issue/PR请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member/product × organization/group × work-item/spec/edition × process/schema/license revision × representation`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、native-state/normativity/authority completeness、transition/relation conflicts、edition/commit drift、implementation/test coverage、provider/source common-origin、rights/license/rate/lag drift和zero writes。至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`；正文、issue/comment、tests和durable materialization逐成员/字段/内容权利另审。
