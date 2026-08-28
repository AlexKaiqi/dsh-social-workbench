# IETF Datatracker / RFC Editor Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / public-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`ietf-datatracker-rfc/v0-design`

## 1. 产品与population

本Pack只覆盖IETF Datatracker公开document/group/state metadata、Internet-Draft/RFC只读representation及RFC Editor公开edition/index/feed，不覆盖Internet-Draft submission、IESG ballot position、账号、会议报名、邮件或任何流程写入。

[Datatracker API](https://datatracker.ietf.org/api/)公开JSON/XML ORM映射、document endpoint和无需key的简化`doc.json`；document同时具有availability、WG、IESG与RFC Editor等正交state，不能压成单一阶段。[RFC Editor下载说明](https://www.rfc-editor.org/series/rfc-download/)另提供published RFC feed与bulk/rsync产品；published RFC与Datatracker draft是相关但不同authority/representation。

## 2. 概念映射与推断边界

| Native concept | `PublicTechnicalStandard*` | 约束 |
| --- | --- | --- |
| stream/group/document name/revision | group/work item/draft identity | individual I-D不等于WG-adopted work item |
| draft availability/WG/IESG/RFC Editor states | native state refs | 正交保存，不拼成虚构线性状态 |
| RFC/category/STD/BCP | publication/series identity | RFC不必是Standards Track；Standards Track也不必达到Internet Standard |
| updates/obsoletes | exact relation | update不必全量替换；关系有方向与edition lineage |
| ballot/review/comment | decision/feedback record | position/comment不等于IESG或IETF consensus |
| XML/text/HTML/PDF/JSON | rendition | definitive/official role按具体RFC与当前发布规则固定 |

[BCP 9](https://www.rfc-editor.org/info/rfc2026/)明确Internet-Draft用于review，且并非所有RFC都是标准；因此draft标题、WG归属、IESG review或RFC发布均不能直接升级为生态采用、法律义务或客户需求。

## 3. 接入、权利与开源证据

未来route只允许固定group/document/RFC/field/window的公开GET/feed/bulk读取；submission API与ballot API即使有文档也在policy gate前拒绝。IETF/RFC文本适用IETF Trust legal provisions与具体document notice；代码license不替代document content rights。

固定官方候选：[ietf-tools/datatracker@73ad6df](https://github.com/ietf-tools/datatracker/tree/73ad6df217a7df9371b23f876c7d3b4178dc892d)，BSD-3-Clause。它只作API/state/schema/negative-write fixture，不安装或运行。

## 4. Fixture、观测与晋级

synthetic fixture覆盖individual I-D→WG adoption、active/expired/replaced/withdrawn、多个正交state、draft revision、RFC Informational/Experimental/BCP/Standards Track、STD subseries、updates/obsoletes、erratum、多rendition冲突、commenter authority与zero submission/ballot。

Telemetry按`stream × group × document/RFC × revision × representation × state-taxonomy revision`记录requested/returned/retained、state completeness、edition/rendition drift、relation direction、history/coverage、rights drop、rate/error/backoff与write attempts。用户批准后的最小canary只能读取一个已知document的metadata；它不证明draft corpus、RFC正文、历史完整性或durable rights。
