# Australia ABS Patient Experiences Platform Pack

[2024–25 release](https://www.abs.gov.au/statistics/health/health-services/patient-experiences/2024-25)覆盖GP、specialist、dental、hospital、ED、telehealth、mental health与prescription barriers；[methodology](https://www.abs.gov.au/methodologies/patient-experiences-methodology/2024-25)定义15+ private-dwelling population、telephone electronic questionnaire、proxy、25,368 fully responding persons、weights、RSE/MOE及2024–25 very-remote coverage break。

采用release/method/data-item/XLSX cube fixture；custom data request和DataLab不采用。`delayed or did not use`组合、due-to-cost/other-reason、needed-population、wait-longer-than-acceptable与actual urgent wait bands分别保留；Patient Experience Survey不用于condition prevalence。

[readabs@`b6b0c0d`](https://github.com/MattCowgill/readabs/tree/b6b0c0da5c989e801d21c55a655f2fca69683965)是community/MIT spreadsheet/API client，不证明本release属于稳定API dataflow或拥有cube semantics。Telemetry按`financial year × cube/table × population/geography × service × outcome/barrier × denominator × RSE/MOE`记录coverage/method drift和zero effects。
