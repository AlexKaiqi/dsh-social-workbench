# Toronto DineSafe Food Premises Platform Pack 设计

## 1. 稳定概念

[DineSafe](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/)是Toronto Public Health的food premises inspection/disclosure program。每次inspection产生Pass、Conditional Pass或Closed notice；notice是inspection outcome，不是business review或future safety guarantee。

[process](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/about-dinesafe/)区分：

- minor：minimal health risk；Pass仍可能包含minor；
- significant：potential health hazard；Conditional Pass并通常24–48小时reinspection；
- crucial：immediate health hazard；未能即时纠正可触发Order to Close；
- Closed期间authority daily monitoring；所有order items及其他significant/crucial corrected后，authority才发Pass并允许reopen。

correction required、ticket、second reinspection、summons/referral、closure order、reopening verification和latest notice是不同事件。Closed不等于永久停业；Pass不等于zero infractions或continuing safety。

## 2. Capability与路由

官方CKAN catalogue package固定为`b6b4f3fb-2e2c-47e7-931d-b87d22806948`。2026-08-26只读catalogue metadata确认current CSV/XML/JSON、historical ZIP及duplicate-named legacy/current resources；未读取resource rows。

| capability | exact resource policy | 当前状态 |
| --- | --- | --- |
| process/infraction/notice definition read | official Toronto pages | knowledge |
| package/resource/schema metadata read | CKAN package ID + exact resource ID | exact catalogue fixture only |
| selected current inspection metadata read | fixed current CSV/XML/JSON resource + field allowlist | manual/fixture only |
| selected historical lineage read | fixed historical ZIP resource + history contract | manual/fixture only |
| first-active/same-name resource fallback | none | rejected |
| complaint、inspection request、ticket、closure/reopen、contact/write | none | rejected |

当前`callable=0 / durable=0`。resource name不稳定且存在重复，只有固定resource ID、format、last-modified、schema digest、current/historical population与replacement decision才能晋级；generic CKAN MCP的`first resource`策略必须失败。

## 3. Snapshot、rights与字段边界

[DineSafe terms](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-terms-of-use/)说明信息只描述most recent inspection当时条件，通常24–36小时发布，但不保证accuracy/completeness/currency，也不构成endorsement。[Toronto OGL](https://open.toronto.ca/open-data-licence/)要求attribution/non-endorsement并排除personal/third-party/official marks。

catalogue package当前`license_id=not specified`，与portal-wide OGL说明并存。Snapshot同时保留package license field与portal licence digest；durable use前必须取得exact resource binding evidence，不能自动把portal default覆盖package metadata。

默认projection保留opaque establishment/inspection ID、coarse establishment type、inspection date、notice/result、infraction code/severity、action/correction/reinspection/closure posture。name、full address/coordinate、phone、operator、complaint、inspector identity/comments、free text默认drop。

## 4. 动态视图、可观测性与fixture

动态视图：`current-vs-historical-resource-lineage`、`inspection-to-infraction-one-to-many`、`pass-with-minor-vs-no-infraction`、`conditional-pass-reinspection-escalation`、`closed-order-correction-pass-reopen`、`resource-duplicate-replacement-drift`、`posting-lag-and-latest-condition-warning`与`location-person-free-text-drop-audit`。

Telemetry逐`package/resource/schema revision × current/history population × establishment/inspection identity × result/notice × infraction severity × enforcement/correction/closure posture × posting lag × licence/terms`记录returned/retained/dropped、duplicate resource conflict、history gap、reinspection deadline、closure lineage gap、stale watermark、license mismatch、fallback rejection和zero effects。

Synthetic至少覆盖：Pass with minor；Conditional Pass→corrected at first reinspection→Pass；not corrected→ticket→second reinspection→summons/referral；crucial corrected during inspection not closed；crucial not corrected→Closed；closure active→authority Pass/reopen；duplicate resource name chooses fixed ID；package license unspecified triggers rights review。

必须拒绝：Pass→zero violation/endorsement、Conditional Pass→illness、crucial→confirmed harm、Closed→permanent failure/outbreak、latest Pass→erase closure、website missing→business safe/closed、portal OGL→official mark use，以及community mirror/MCP→official route。

## 5. 官方资料

- [DineSafe](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/)
- [About DineSafe / inspection and closure process](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/about-dinesafe/)
- [Infraction definitions](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-infractions/)
- [DineSafe terms](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-terms-of-use/)
- [Toronto Open Data licence](https://open.toronto.ca/open-data-licence/)

本轮只调用一次official CKAN catalogue metadata查询，没有下载CSV/XML/JSON/ZIP或读取inspection rows。
