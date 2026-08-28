# NYC DOB Building Regulation Platform Pack 设计

状态：`concept-fixture + exact Socrata dataset fixtures / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`nyc-dob-building-regulation/v0-design`

## 1. 稳定概念与官方证据

NYC Department of Buildings通过NYC Open Data发布多个互补population：[DOB NOW Build Job Application Filings](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Job-Application-Filings/w9ak-ipjd)描述提出的工作；[DOB NOW Build Approved Permits](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4)每行是2016年以来DOB NOW签发的permit且排除Electrical、Elevator与LAA；legacy [DOB Permit Issuance](https://data.cityofnewyork.us/Housing-Development/DOB-Permit-Issuance/ipu4-2q9a)每行是BIS中一个work type的permit lifecycle。job filing、work permit、sequence与work type不能压成一个ID。

[DOB NOW Certificate of Occupancy](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Certificate-of-Occupancy/pkdm-hqz6)从2021年3月后覆盖DOB NOW CO并区分CO/TCO、sequence/status/date；legacy [DOB Certificate of Occupancy](https://data.cityofnewyork.us/Housing-Development/DOB-Certificate-Of-Occupancy/bs8b-p36w)覆盖此前系统。CO报告法定use/occupancy及完成程序，不证明当前安全或实际入住。

[DOB Safety Violations](https://data.cityofnewyork.us/Housing-Development/DOB-Safety-Violations/855j-jady)、older [DOB Violations](https://data.cityofnewyork.us/Housing-Development/DOB-Violations/3h2n-5cm9)和[DOB ECB Violations](https://data.cityofnewyork.us/Housing-Development/DOB-ECB-Violations/6bgk-3dad)是不同origin/adjudication population；新旧violation可重叠。当前未固定一般建筑inspection event/result的公共dataset，必须报告missing inspection coverage。

## 2. 概念映射

| Native | `PublicBuildingRegulation*` |
| --- | --- |
| job filing / filing reason / job description | work application + proposed-work span；非授权或施工事实 |
| work permit / sequence / work type | permit + work item/discipline + revision relation |
| approved / issued / expired / permit status | independent authorization posture and validity dates |
| BIS / DOB NOW | distinct origin/system revision；不能last-write-wins |
| DOB violation / safety violation | finding record with overlap/common-origin policy |
| ECB/OATH summons | citation/adjudication lineage；非普通DOB penalty同义词 |
| CO / TCO / final CO / LOC | exact certificate type/status/scope and supersession |
| address / BBL / BIN / applicant or permittee fields | governed exact location/person projection；普通索引drop |

## 3. 期望只读能力与边界

`definition.read`、`dataset.metadata/schema.read`、`selected-public-filing.metadata.read`、`selected-public-permit.metadata.read`、`selected-public-violation.metadata.read`和`selected-public-certificate.metadata.read`仅为fixture capability。未来Socrata canary必须逐dataset固定portal、dataset ID、official ownership、schema revision、row identity/order/pagination、public-field allowlist、legacy/current population、overlap policy、exact-location/person drop、purpose/retention/deletion；禁止community view、任意SoQL、private DOB system或其他dataset fallback。

application、permit、violation与certificate capability分别晋级；缺失inspection route不能由CO或violation补绿。电子申请、permit renewal、inspection scheduling、complaint、certificate filing、fee/payment、document与任何status/admin write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖one job→multiple work permits、renewal without changes、approved date≠issued date、expired/revoked/void separation、BIS→DOB NOW migration、new/old violation duplicate candidate、DOB civil penalty≠ECB adjudication、TCO→final CO supersession、LOC≠CO、certificate issued≠actual occupancy、missing inspection coverage，以及applicant/owner/permittee/license/address/BBL/BIN drop。

Telemetry逐`dataset ID × schema/origin revision × application/permit/work item/violation/certificate population × authorization/finding/certificate posture × relation/history × public field/location/privacy/rights policy`记录returned/retained/dropped、overlap candidate、missing stage、schema drift、quarantine、community/private fallback rejection与zero writes。本轮没有调用任何Socrata数据行。
