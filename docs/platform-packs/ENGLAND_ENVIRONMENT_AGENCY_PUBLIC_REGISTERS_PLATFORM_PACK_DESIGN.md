# England Environment Agency Public Registers Platform Pack 设计

状态：`concept-fixture + exact API/dataset + conditional-rights fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`england-environment-agency-public-registers/v0-design`

## 1. 稳定概念与官方证据

[官方API目录](https://www.api.gov.uk/ea/public-registers-for-environmental-information/)覆盖申请、许可条件、监测、breach、enforcement及多类EPR/discharge register；[Public Registers Online](https://environment.data.gov.uk/public-register/view/index)把permit/licence、exemption、CAR与enforcement区分。

[Consented Discharges with Conditions](https://www.data.gov.uk/dataset/55b8eaa8-60df-48a8-929a-060891b7a109/consented-discharges-to-controlled-waters-with-conditions1)把site/general、effluent amount/time和determinand numerical limits分层，但季度extract不含textual conditions；[Compliance Ratings](https://www.data.gov.uk/dataset/1b268e32-d399-4e1c-87a0-00a17a11fce6/compliance-ratings-waste-and-installations)是calendar-year、whole-permit breach points/rating，并非单次测量或全环境表现。

## 2. 概念映射与权利

| Native | `PublicEnvironmentalRegulation*` |
| --- | --- |
| application / issued permit / variation | application、permit、condition revision |
| discharge site / effluent / determinand | site、outfall、parameter/limit分层 |
| CAR / breach | inspection/assessment与compliance finding；authority/finality保留 |
| annual compliance rating A–F | assessment aggregate；固定permit population/year，不反推单次违规 |
| enforcement register | notice/order/enforcement；不等于remediation |

上述两个dataset标注Environment Agency Conditional Licence，包含内部/个人用途、不得发布、最长一年等约束。即使API免注册，也不能把visibility当reuse right；当前route-fixture可固定，durable仍为0。逐resource的licence、purpose、retention expiry、deletion和attribution必须独立评审。

## 3. 期望能力与合成验证

仅设计`definition.read`、`api/resource-schema.read`、`selected-public-record.metadata.read`和`conditional-rights.conformance`。future canary必须固定exact route/dataset、program、permit population、季度extract与daily register差异、文本条件缺口和field allowlist；不能用dataset数值条件补全未发布的text condition。

Synthetic覆盖application→permit、variation/supersession、site→effluent→determinand limit、missing text condition、CAR→breach、annual rating但measurement coverage missing、conditional licence一年到期导致partition失效、exact location/operator/contact drop以及API失效时禁止HTML fallback。Telemetry同时记录rights expiry和deletion completion。本轮没有读取数据行。
