# England GP Patient Survey Platform Pack

[2026 results](https://www.gp-patient.co.uk/latest-survey/results)于2026-07-09发布national、region、ICS、PCN和practice CSV/XLSX；[technical annex](https://www.gp-patient.co.uk/data-analysis-2026)固定online-first/paper-followup、design/nonresponse/calibration weights和online-only独立weight。2024是new time-series起点；2026 national response rate为22.1%，小base/sensitive cells按published suppression rules处理。

采用questionnaire/reporting-variable/aggregate CSV/XLSX fixture，不采用person datasets、postcode linkage或survey participation。contact、last appointment、preferred professional、overall experience、pharmacy/dental分别建模；practice result不是objective quality/ranking，registered-patient denominator不是England population。

[GPPS-online-services@`ad11afb`](https://github.com/nhsengland/GPPS-online-services/tree/ad11afb5a7b32c0fd22c48d70bc83c09e2bef428)是NHS England/MIT的2021 row-level internal study，README明确需要internal access和IG clearance，只作static method witness。Telemetry按`survey × geography/organisation × question × service/outcome × weight/base/suppression`记录series、organisation mapping和zero effects。
