# Australia AER Retail Energy Performance Platform Pack

[AER retail performance reporting](https://www.aer.gov.au/industry/retail/performance-reporting)要求retailers定期报告customer numbers、contracts、complaints、energy debt、payment plans、hardship programmes、disconnections和reconnections，并按季度/年度发布。[Q2 2025–26 release](https://www.aer.gov.au/publications/reports/performance/retail-energy-market-performance-update-october-december-2025-quarter-2-2025-26)把XLSX分为Schedule 2 customer/market、Schedule 3 complaints/debt/payment/disconnections、Schedule 4 hardship与Schedule 6 embedded networks/life support/family violence；这些schedule population和敏感性不可互填。

[current guideline](https://www.aer.gov.au/industry/registers/resources/guidelines/retail-performance-reporting-procedures-and-guidelines)自2025-07-01生效并改用flat CSV submission template。public XLSX是regulator-published aggregate；retailer submission portal、CEO letter和raw submission不是read route。NERL jurisdictions、electricity/gas、residential/small-business、retailer、customer account与hardship-customer denominator必须固定；customer account不是unique household/person。

debt、arrears、payment plan、Centrepay、concession、hardship assistance、disconnection与reconnection分别建模。disconnection不是network outage或service reliability failure；reconnection不证明debt cleared、hardship resolved或customer benefit。

[AER copyright policy](https://www.aer.gov.au/about/policies/disclaimer-copyright)一般以CC BY 4.0发布AER-owned material并要求attribution，同时保留logo、third-party和resource-specific exceptions。

[cdr-energy-research@`b5816db`](https://github.com/Artic0din/cdr-energy-research/tree/b5816dbec09a0f57d7cff374dcf975ef7483b756)针对CDR Energy product-reference plan APIs，不是retail performance，并缺少明确license；拒绝fallback。Snapshot/telemetry按`reporting period × guideline/template revision × jurisdiction × retailer/aggregate × fuel/customer class × schedule/metric × account denominator × quality/revision`记录coverage、correction和zero effects。
