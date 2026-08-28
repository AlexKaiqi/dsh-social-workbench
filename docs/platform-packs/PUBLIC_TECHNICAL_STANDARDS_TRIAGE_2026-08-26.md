# Public Technical Standards & Compatibility Change 候选分诊（2026-08-26）

状态：`researched`；requested=5，concept-fixture-eligible=5，route-fixture-eligible=4，callable=0，durable-approved=0  
目标 Channel：`public-technical-standards/v0-design`

## 1. Coverage 缺口与第一性原理结论

现有Channel能观察软件issue、package生命周期、漏洞、规则制定、采购、资助和公司披露，却没有稳定表示“生态未来要求兼容什么、技术委员会正在选择什么、平台准备弃用或移除什么、实现者在哪些规范约束上受阻”。这类信号能解释未来迁移压力和产品兼容窗口，但不是客户需求、已部署采用、法律义务或市场规模。

共同最小事实是：organization/group/process revision、work item/draft/proposal/specification/edition、native lifecycle、normative/informative/editorial、editor/body/implementer/commenter authority、exact revision/commit、transition/decision、implementation/test evidence、updates/replaces/obsoletes/supersedes relation、compatibility/migration/deprecation/removal role、rights与coverage。不同组织不共享单调状态机；例如W3C 2025流程已移除Proposed Recommendation，TC39现有Stage 2.7，WHATWG Living Standard持续变化，OpenJDK JEP又是平台增强流程而非标准。

## 2. 候选与当前判定

| 候选 | 信号增量 | 官方表面 | 当前判定 |
| --- | --- | --- | --- |
| IETF Datatracker / RFC Editor | Internet-Draft、WG/IESG/RFC状态、RFC category、updates/obsoletes与版本链 | [Datatracker API](https://datatracker.ietf.org/api/)、[RFC downloads](https://www.rfc-editor.org/series/rfc-download/)、[BCP 9](https://www.rfc-editor.org/info/rfc2026/) | concept+native-route fixture；只读metadata/edition候选；submission/ballot全部拒绝 |
| W3C Technical Reports | Working Draft、Candidate Recommendation、Recommendation、Note/Statement/Registry、版本与supersession | [2025 Process](https://www.w3.org/policies/process/)、[W3C API](https://www.w3.org/api/)、[TR catalog](https://www.w3.org/TR/) | concept+native-route fixture；公开JSON metadata候选；editor draft不继承W3C endorsement |
| WHATWG Living Standards | Living Standard、Review Draft、workstream、source commit、issue与implementer-interest变化 | [Workstream Policy](https://whatwg.org/workstream-policy)、[Working Mode](https://whatwg.org/working-mode)、[Stages](https://whatwg.org/stages) | concept+provider-route fixture；只经固定官方repository/commit；issue不等于editor decision或consensus |
| TC39 Proposals | Stage 0/1/2/2.7/3/4、proposal regression/withdrawal、Test262与spec integration | [TC39 Process](https://tc39.es/process-document/)、[proposals](https://github.com/tc39/proposals)、[ECMAScript spec](https://tc39.es/ecma262/) | concept+provider-route fixture；只经固定official GitHub source；Stage 3/4不等于所有runtime已部署 |
| OpenJDK JEPs | JEP Draft/Submitted/Candidate/targeting/integration/delivery、preview/incubator、deprecation/removal与release target | [JEP 1](https://openjdk.org/jeps/1)、[JEP Index](https://openjdk.org/jeps/0) | concept fixture；当前未发现版本化public API/feed；HTML不能冒充machine contract |

`route-fixture`计算IETF/W3C两个native machine products，以及WHATWG/TC39经官方GitHub repository的provider route；后两者必须同时保留source authority与GitHub transport/provider authority。OpenJDK网页表格不计route。

## 3. Skills、MCP 与固定开源候选

以下只做源码、提交与许可证静态审计，均未安装、执行或连接：

| Artifact | 固定revision / license | 结论 |
| --- | --- | --- |
| [ietf-tools/datatracker](https://github.com/ietf-tools/datatracker/tree/73ad6df217a7df9371b23f876c7d3b4178dc892d) | `73ad6df…` / BSD-3-Clause | IETF Datatracker官方实现；用于API model/state taxonomy和negative write-surface fixture，不运行服务 |
| [w3c/w3c-api](https://github.com/w3c/w3c-api/tree/118324b11dddfd1ce6af15cf5d80b0658e295197) | `118324b…` / root license未发现 | W3C API官方源码候选；只作endpoint/schema witness，无license不vendoring |
| [whatwg/html](https://github.com/whatwg/html/tree/208004fb0c299e2d2a24e973ec7bd35bc888add9) | `208004f…` / CC-BY-4.0；code portions BSD-3-Clause | 官方Living Standard source/review-draft结构；source commit可固定版本，但issue/PR不自动成为规范 |
| [tc39/proposals](https://github.com/tc39/proposals/tree/600a4278a7cabcb53915fa97296b5688529ddd07) | `600a427…` / root license未发现 | 官方stage index/schema witness；无license不复制语料或vendoring |
| [tc39/ecma262](https://github.com/tc39/ecma262/tree/ed463bc10dbeaad0410ce67e541a77ea8e9900a5) | `ed463bc…` / Ecma TC39 IPR policy | 官方draft spec与integration lineage；license/patent terms逐用途审查，不等同普通OSS许可证 |
| [openjdk/guide](https://github.com/openjdk/guide/tree/ea3c2217d0cdcc3a051395f9d3028c0d6f773416) | `ea3c221…` / root license未发现 | OpenJDK官方Developer Guide source；指向JEP正式流程，只作过程witness |
| [openjdk/jdk](https://github.com/openjdk/jdk/tree/f40a2c3625484087cfdb41d34b360414ccf0ebd0) | `f40a2c3…` / GPL-2.0（另有附加例外/文件条款） | release source与test lineage候选；不从code presence反推JEP状态或发行采用 |

未发现上述组织官方发布、专门用于“需求研究”的Agent Skill或MCP。通用GitHub Skill/MCP最多提供repository transport，不会使repository issue成为标准、不替代组织流程语义，也不自动授予规范内容的AI/index/reuse权利。

## 4. 选择与下一门槛

五个成员进入共同概念Channel，逐产品独立晋级。下一步仅以手写synthetic fixtures验证process revision、native lifecycle、normativity、authority、immutable edition/living commit、transition、regression/withdrawal、updates/obsoletes/supersedes、implementation/test evidence、compatibility role、common-origin provider projection与zero writes。任何真实API/GitHub读取、语料materialization、submission/comment/ballot/issue/PR、MCP/Skill安装或执行都需另行授权。
