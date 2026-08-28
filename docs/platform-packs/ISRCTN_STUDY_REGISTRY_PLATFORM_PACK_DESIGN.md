# ISRCTN Study Registry Platform Pack 设计

状态：`researched / concept+official-xml-api-csv-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`isrctn-study-registry/v0-design`

## 1. 产品、概念与价值

本Pack描述ISRCTN study publication registry、search、Transparency Tracker、CSV download和XML API。官方[FAQ](https://www.isrctn.com/page/faqs)说明registry以标准格式公开可搜索的study record，支持registration、update、results reporting和patient-friendly content；search results可CSV下载，XML API文档版本仍标注draft/incomplete。

ISRCTN identifier、protocol、record update、recruitment status、condition、intervention、eligibility、primary/secondary outcomes、results link/upload和plain-English summary分别建模。支付registration fee只证明publication workflow收费，不是study funding、approval、quality或market demand。

record可被WHO ICTRP weekly feed再次投影；ISRCTN↔WHO exact ID建立common-origin，不重复计数。HRA/NIHR等外部展示也是alternate provider representation，不自动扩大rights或coverage。

## 2. route、license 与身份边界

[Licence to Post](https://www.isrctn.com/page/licence_to_post)及FAQ说明Contribution按CC BY供用户copy/distribute/transform/use，metadata有CC0 waiver；每个record仍保留responsible registrant/source attribution和获取日期。CSV、XML、registry page和results document分别记录representation及licence。

route fixture固定official XML API、CSV search export、draft doc revision、query/filter/page、record schema、status/update/history、licence/attribution和error。draft/incomplete意味着schema drift gate更严格，不允许通过HTML或community wrapper补缺；真实route仍需用户批准。

Responsible Registrant、contacts和研究者身份只作authority ref，不保留姓名、个人联系字段或lead graph。recruitment site/person、participant data和患者匹配全部排除。

## 3. Fixture 与晋级

synthetic fixture覆盖new record→updates、recruitment state、plain/scientific title、result absent/present、protocol/DOI link、WHO feed common-origin、CC BY/CC0 split、draft API schema drift、contact drop和zero writes。Telemetry按`query/export/API revision × ISRCTN × record revision × status/results × licence`记录coverage、update lag、identity/common-origin conflict、attribution和rights block。

metadata-only canary、results document/span和durable corpus逐层另审。register/update/upload results、pay fee、contact/recruitment和所有write/effect拒绝。
