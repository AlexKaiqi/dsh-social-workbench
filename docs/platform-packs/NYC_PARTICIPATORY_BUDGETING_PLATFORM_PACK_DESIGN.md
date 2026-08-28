# NYC Participatory Budgeting Platform Pack 设计

状态：`concept-fixture + historical route-fixture + current selected-record/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`nyc-participatory-budgeting/v0-design`

## 1. 稳定概念与官方证据

NYC Council的[官方过程页](https://council.nyc.gov/pb/)将PBNYC描述为idea collection、与agencies/delegates共同proposal development、district vote、winner进入下一fiscal-year budget，再由agency实施。当前Council capital projects需为公共实体基础设施、至少$50,000且使用寿命至少5年，并仅在participating districts开展。官方[current results press release](https://council.nyc.gov/press/2026/05/22/3126/)报告FY2027约128,000 voters、接近$25m、22 districts，online/paper、11岁以上resident与12 languages；这些是带核验日期的当前官方事实，不是稳定全局规则。[官方results目录](https://council.nyc.gov/pb/results/)作为当前selected/manual surface。

[NYC Open Data Participatory Budgeting Projects](https://data.cityofnewyork.us/City-Government/Participatory-Budgeting-Projects/wwhr-5ven)只覆盖至2017且最后更新于2020，含project、votes、winner、cost和precise locations。[Project Tracker](https://data.cityofnewyork.us/City-Government/Participatory-Budgeting-Project-Tracker/qm5f-frjb)只覆盖至2018年3月且最后更新于2020，区分ballot price、subproject cost、PB funding、total appropriated、agency与status。两者是明确stale的historical route fixture，不能证明当前schema、成员district或完整历史。

## 2. 概念映射

| Native | `PublicParticipatoryBudget*` |
| --- | --- |
| idea / agency-delegate proposal development | need + developed-from relation |
| district / participating district | exact scope与population definition |
| ballot project / votes / winner | separate roster, aggregate and selection |
| cost / ballot price / PB funding / total appropriated | distinct amount roles |
| capital-project eligibility | process revision knowledge |
| agency / tracker status | implementer authority + source-declared execution |
| online + paper / language | channel policy + rendition/common origin |

## 3. 期望只读能力

`definition.read`、`current-result.selected.read`保持selected/manual。`historical-project.list/read`与`historical-tracker.list/read`具有official route fixture，但当前没有PortBinding；未调用Socrata route或读取row。未来canary必须固定dataset ID、schema revision、historical coverage、page/order、fields、rights、privacy、purpose与retention，并显式输出`not-current`和`not-complete`。

## 4. 数据、安全与Conformance

普通projection只保留opaque cycle/district/project/agency、approved span、aggregate vote、winner、amount roles、status与relations。exact addresses、coordinates与postcode默认drop/coarsen；姓名、contact、demographics、political profile、comments/attachments与未审查文本不保留。

Synthetic覆盖2017/2018 stale coverage不得冒充current、historical rows与current HTML不可拼成连续population、votes不是unique people、winner≠appropriation、PB funding≠total appropriated、appropriation≠spend、agency status≠physical verification、online/paper common origin及precise location drop。proposal/vote/unvote/comment/share与tracker/admin mutation恒拒绝。

