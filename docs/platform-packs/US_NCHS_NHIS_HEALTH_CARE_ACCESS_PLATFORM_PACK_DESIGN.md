# U.S. NCHS NHIS Health-Care Access Platform Pack

[NCHS definition](https://www.cdc.gov/nchs/hus/sources-definitions/unmet-need.htm)把unmet need限定为past-12-month因cost延迟或未获得medical care、prescription drugs或dental care；[DQS](https://www.cdc.gov/nchs/dqs/health-topics/healthcare-system-insurance-cost.html)区分adult/child和final/early preliminary estimates。[methods](https://www.cdc.gov/nchs/nhis/about/nhis-methods.html)说明2025起使用基于2020 Census的新sample design。

采用programme/question/method/DQS/table/PDF fixture；public-use/preliminary microdata均不采用。`needed but not get`、`delayed`与medication behavior保持独立；cost-only不能扩为所有access barrier，2022 nonfinancial module也不能续成annual core。

[nhisml@`d287cb6`](https://github.com/soda-lmu/nhisml/tree/d287cb69450435c8693da6e5b1f4ba8fdba99c60)为independent MIT microdata/ML pipeline，下载缓存、预测与individual feature surface均越界。Snapshot/telemetry按`year × preliminary/final × adult/child population × service/question × outcome/barrier × denominator × weight/quality`固定sample break、missing codes与zero effects。
