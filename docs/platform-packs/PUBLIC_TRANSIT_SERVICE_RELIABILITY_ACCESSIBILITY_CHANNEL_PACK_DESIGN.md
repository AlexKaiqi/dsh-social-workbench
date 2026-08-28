# Public Transit Service Reliability, Disruptions & Accessibility Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现schedule/realtime整合、prediction准确性、服务交付、延误/取消、通告及时性、facility outage、无障碍路径和绩效解释中的需求与痛点。它统一`PublicTransitService*` projection，但不统一jurisdiction、agency/operator、mode、feed partition、service day、route/stop/trip identity、prediction model、alert authority、facility ownership、accessibility completeness、performance methodology、history、privacy或rights。

最小事实链：

```text
schedule revision -> service day -> route/pattern -> trip -> stop sequence
                                     |
                                     +-> trip update/prediction -> source-reported actual stop event
                                     +-> vehicle position/progress
alert/incident -> active window + informed entities + cause/effect assertion
station topology -> pathway -> required facility -> live facility status
metric definition -> population + numerator + denominator + threshold -> aggregate revision
```

任何箭头都必须由exact native ID和成员authority证明；time/name/coordinate相似只生成review candidate，不能建立canonical merge。

## 2. 成员与能力矩阵

| capability | MTA | TfL | MBTA | TfNSW | 当前发布 |
| --- | --- | --- | --- | --- | --- |
| `public-transit.schedule.read` | GTFS fixture | Unified timetable fixture | GTFS/V3 fixture | GTFS fixture | knowledge/fixture only |
| `public-transit.prediction.read` | GTFS-RT fixture | Unified prediction fixture | GTFS-RT/V3 fixture | GTFS-RT fixture | knowledge/fixture only |
| `public-transit.vehicle.read` | product-specific fixture | Unified Vehicle fixture | GTFS-RT/V3 fixture | GTFS-RT fixture | knowledge/fixture only |
| `public-transit.alert.read` | GTFS-RT + MTA extension fixture | status/disruption fixture | GTFS-RT/V3 fixture | GTFS-RT Alerts v2 fixture | knowledge/fixture only |
| `public-transit.facility.read` | selected/static candidate | topology + Lift Disruptions fixture | GTFS/V3/live_facilities fixture | location-facilities fixture | knowledge/fixture only |
| `public-transit.history.read` | performance aggregate fixture | selected reports | LAMP archive/performance fixture | historical GTFS/RT candidate | knowledge/fixture only |
| `public-transit.federated-read` | future restricted | future restricted | future restricted | future restricted | exact feed/operator/mode roster required |

成熟度：`requested=4 / concept=4 / schedule route fixture=4 / realtime route fixture=4 / alert route fixture=4 / accessibility topology-or-facility fixture=3 / live facility-status route fixture=2 / history-or-performance fixture=3 / manual=4 / callable=0 / durable=0`。GTFS wire compatibility、OSS、MCP、Skill或另一个member成功都不提高成员成熟度。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、GTFS/GTFS-RT/provider schema与extension digest、agency/operator/mode/feed roster、service-day/timezone policy、route/stop/trip/facility identity rules、alert/accessibility/performance definition、licence/attribution、decision、verification、lineage和tombstone；不保存持续实时protobuf或车辆轨迹。

未来获得durable授权后，分析数据库只接field-approved opaque identity、coarse mode/route/stop、typed lifecycle/posture、exact relation和approved aggregate。动态物化视图至少包括：

- `member-agency-operator-mode-feed-product-and-service-day-roster`；
- `schedule-revision-to-realtime-entity-exact-lineage`；
- `route-direction-pattern-stop-platform-topology-and-id-drift`；
- `prediction-issue-to-later-prediction-to-source-reported-actual-event`；
- `missing-not-realtime-capable-stale-deleted-cancelled-separation`；
- `trip-cancelled-added-duplicated-replacement-modified-and-stop-skipped-moved`；
- `alert-active-window-informed-entity-cause-effect-message-history`；
- `alert-vs-observed-trip-stop-event-impact-gap`；
- `station-pathway-required-facility-static-accessibility-lineage`；
- `facility-outage-limited-restored-to-current-journey-candidate`；
- `performance-by-exact-population-threshold-numerator-denominator-period`；
- `service-delivered-on-time-headway-wait-travel-time-incident-facility-hour-separation`；
- `schedule-realtime-alert-facility-history-coverage-and-freshness`；
- `vehicle-location-employee-rider-journey-security-free-text-drop-audit`；
- `member-schema-extension-id-terms-rate-history-and-methodology-drift`。

每个view携带definition revision、member/feed/product、service date/timezone、watermark、coverage、rights、privacy、input snapshot和rebuild reason；schema、feed partition、ID policy、freshness、licence或metric definition变化只重建受影响partition，不改写旧evidence。

## 4. 可观测性

Telemetry维度至少为：

`member × agency/operator/mode × feed/product/resource × GTFS/schema/extension revision × service date/timezone × route/pattern/stop/trip × schedule relationship × prediction/actual posture × alert cause/effect/standing × facility/accessibility standing × performance definition/population/denominator × freshness/history × privacy/rights`

记录：

- requested/returned/retained/dropped/quarantined；
- feed fetch/parse/schema/extension错误、FULL_DATASET/incrementality冲突和partition缺口；
- header/entity/vehicle/prediction age、clock skew、stale watermark与out-of-order revision；
- schedule→realtime unresolved、trip/stop ID drift、duplicate/native-delete/tombstone；
- prediction coverage、prediction revision count、actual-event availability与禁止伪actual计数；
- cancellation/skipped/moved/added/duplicated conflict及missing-realtime rejection；
- alert active-window gap、informed-entity scope、cause/effect unknown、message correction与ended/expiry ambiguity；
- facility topology gap、owner/reporter conflict、outage/restoration lineage和current-access candidate incompleteness；
- metric definition/threshold/denominator drift、missing period、partial day、late backfill和跨成员comparison rejection；
- licence/attribution/non-endorsement/rate/retention drift、fallback rejection与zero effects。

告警按member/feed/product隔离；一个bus feed健康不能掩盖subway alert stale，一个current API健康也不能掩盖history/performance缺口。

## 5. 合成 conformance

至少验证：

1. schedule trip存在但没有realtime，保持unknown而非cancelled；
2. assigned trip未开始移动且无VehiclePosition，不推断取消；
3. stale header与fresh header/old entity分开告警；
4. prediction连续修订，最终actual不改写旧prediction；
5. estimated/interpolated time不升级为measured actual；
6. `CANCELED` trip、`SKIPPED` stop和`NO_DATA` stop分别保存；
7. added/duplicated/replacement trip不与scheduled trip模糊merge；
8. alert route-wide与stop-specific informed entity不扩散到整个network；
9. alert active但没有actual event evidence，不计算受影响trip/rider数；
10. alert expiry/消失保持restoration unknown；
11. publisher cause保留assertion posture，不晋级confirmed root cause；
12. static accessible station + required lift outage形成current journey degraded candidate；
13. 同station另一条完整path存在时，一个lift outage不自动物化station inaccessible；
14. lift restored但另一个required facility unknown，不物化journey accessible；
15. pathway coverage incomplete显式degraded；
16. exact stop name/coordinate相同但native namespace不同，只建candidate；
17. service date跨午夜按member timezone/policy解释；
18. on-time 90%与headway adherence 90%不进入同一metric series；
19. facility availability denominator为facility-hours时不与station/day比较；
20. exact vehicle coordinate、employee/rider identity、journey trace和security detail全部drop。

## 6. 隐私、权利与安全

- 默认drop或降精度exact live vehicle coordinate、vehicle/consist serial、operator/driver/employee ID、内部track/control reference、security-sensitive infrastructure、rider/account/journey/search/subscription identity和free-text incident detail；
- public vehicle feed不授权长期个体车辆/员工轨迹画像；历史materialization优先stop-event和aggregate，不保存逐秒坐标；
- route/stop/facility名称可公开展示不等于任意长期AI索引权利，逐成员licence、attribution、non-endorsement、retention和correction/delete传播先于写入；
- TfL branding/OS/Geomni、TfNSW trademarks/third-party data、MBTA/MTA developer terms分别绑定，不由GTFS标准或community catalogue覆盖；
- alert/free text只索引获准的最小span，联系人、内部编号和安全细节drop/quarantine。

## 7. Probe与副作用边界

本Channel没有平台Probe。发布/修改service alert、incident或facility status，提交事故/无障碍问题，预约paratransit，订阅通知，联系agency，注册/提升API key，改变schedule/dispatch/vehicle/control-plane或任何admin write都可能产生运营、公共安全、通知、账户或乘客副作用，全部保持zero effect。主动需求测试只能走系统自有landing page、问卷、访谈或产品实验Channel。

## 8. 晋级顺序

1. 冻结member/feed/product/agency/operator/mode roster与官方schema/licence；
2. 先用synthetic fixture验证所有不可推断项；
3. 另行授权后只做metadata/small-sample read canary，逐feed记录freshness与coverage；
4. TfNSW production key因无sandbox不能被标记sandbox；
5. identity、service-day、facility topology、history和metric denominator对账通过后才允许analysis projection；
6. rights/retention/correction/delete/observability通过后才讨论durable materialization；
7. operational canary必须能因schema/extension、feed partition、freshness、ID、licence、rate或methodology drift自动fail closed。

