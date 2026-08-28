# Canada Recalls and Safety Alerts Platform Pack 设计

状态：`researched / concept+official-feed-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`canada-recalls-safety-alerts/v0-design`

## 1. 产品与population

加拿大政府的[Recalls and Safety Alerts open dataset](https://open.canada.ca/data/dataset/d38de914-c94c-429b-8ab1-8776c31643e3)提供JSON/CSV英法资源，[central site](https://recalls-rappels.canada.ca/en)跨food、consumer products、health products、medical devices、cannabis和vehicles发布recall与safety alert。dataset标注Open Government Licence - Canada并持续/每日更新；许可、resource URL和schema revision仍需逐次固定。

本Pack不能把所有记录统称recall。Recall、Advisory、Warning、Notification或其他native type映射到不同record kind；program/category/authority、active vs archived、English vs French、updated revision也分别保存。

## 2. 概念与边界

一个native record绑定official ID、record type、category/program authority、title/summary、affected product/range、hazard/reason、recommended/corrective action、publication/update/archive time、alternate-language/rendition relation和source link。英法记录若缺稳定alternate key则不得仅按title merge。

- active/archived是publication state，不是hazard或remedy completion；
- safety alert不自动包含recall或market withdrawal；
- cross-domain category不生成统一risk scale或跨监管authority排序；
- JSON/CSV可能common-origin，不作独立evidence；
- link、attachment、image和第三方内容不自动抓取；contact/person identity默认drop；
- feed失败不得fallback到HTML/browser、搜索结果或community mirror。

## 3. Fixture、观测与晋级

未发现加拿大主管机构官方Agent Skill、MCP或专用开源client；official JSON/CSV本身足以作为route fixture，不需要社区wrapper。synthetic fixture覆盖recall vs safety alert、六类domain、active/archive、English/French alternate、JSON/CSV common-origin、amend/correct/withdraw、missing link、rights revision和zero notification/report/write。

Telemetry按`resource/language/format × native type × programme × record × revision`记录requested/returned/retained/dropped、coverage/watermark/lag、alternate matching、type/status completeness、license drift和zero effects。至少一次用户批准的metadata-only official-feed canary通过后才可`modeled-partial`；真实feed、附件、全文或durable materialization逐用途另审。
