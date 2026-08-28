# NSW EPA Contaminated Land Notifications & Record of Notices Platform Pack 设计

状态：`concept-fixture + exact official monthly-file fixture + selected-register / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`nsw-contaminated-land-record/v0-design`

## 1. 稳定概念与双population

[NSW EPA overview](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land)区分section 60 notified sites与significantly contaminated land的法定record。notified sites经EPA评估为contaminated但不一定需要CLM regulation；[monthly list](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/list-of-notified-sites)提供PDF/XLSX，却只是EPA已知且被通知的potentially contaminated land，不是穷尽清单。

[Record of notices](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/record-of-notices)包含orders/notices、尚未fully carried out的approved voluntary management proposals、相关site audit statements与legacy actions，不包含section 60 notifications。自然人owner/occupier/responsible-party信息受privacy限制；record通常在notice发出约两周内更新。

## 2. 概念映射

| Native | `PublicContaminationRemediation*` |
| --- | --- |
| section 60 notification/list row | notification + notified/potential posture；不是significant declaration |
| EPA assessment / significant contamination declaration | assessment + statutory designation |
| preliminary investigation order | investigation action/order |
| management order | action/control obligation；不是completion |
| approved voluntary management proposal | accepted responsibility + planned/implementing action；不是liability admission |
| ongoing maintenance order | long-term control/stewardship |
| site audit statement | auditor authority assertion；scope/finality独立 |
| revoked/ended notice or declaration | termination/release posture；历史保留 |

## 3. 能力、身份与隐私边界

`definition.read`、`monthly XLSX resource/schema.read`、`record search contract.read`和`selected notice metadata.read`仅为fixture。future read分别固定notification-list与notices-record population、publication lag、legacy/current terminology cutover、area/notice number、schema、rights与field allowlist，禁止跨population fallback。

Lot/DP、street、suburb与LGA是notice当时状态，地块分割和边界调整会导致变化；只能保存source-declared identity和boundary revision。自然人、contact、documents、exact parcel/location与raw audit/sample values默认drop或quarantine。污染通知、report/contact/subscribe/complaint/site access/appeal/admin/write全部拒绝。

## 4. Synthetic conformance与遥测

Fixtures覆盖notified-but-not-regulated、significant declaration、preliminary order→management order、voluntary proposal not fully carried out、ongoing maintenance、audit statement、revocation、pre/post-2009 terminology、changed Lot/DP/LGA和privacy-redacted party。

Telemetry按`monthly file/register resource × process/schema revision × notification-vs-notice population × site/area/notice × designation/action/control × authority × publication lag × coverage/privacy/rights`记录returned/retained/dropped/quarantined、population crossover、identity drift、legacy mapping、stale/missing、fallback rejection与effects=0。本轮未下载XLSX或请求notice详情。
