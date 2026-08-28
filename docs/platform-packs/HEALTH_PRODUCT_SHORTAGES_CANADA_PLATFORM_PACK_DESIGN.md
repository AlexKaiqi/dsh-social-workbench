# Health Product Shortages Canada Platform Pack 设计

状态：`researched / concept+public-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`health-product-shortages-canada/v0-design`

## 1. 产品、概念与价值

本Pack描述加拿大受监管企业提交的drug shortage和discontinuation reports、public search/export与public API。Health Canada的[2026迁移公告](https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/establishment-licences/drug-establishment-licensing-bulletin/new-website-health-product-shortages.html)确认旧站在2026-01-18迁移到Health Product Shortages Canada，并明确public API extraction instructions变化；[public search](https://healthproductshortages.ca/search)说明结果来自company-submitted reports，可导出shortage/discontinuation CSV，并提供public API。

核心identity是report/notification × drug product × strength/form/package × Canadian market。actual/anticipated、shortage/discontinuation、resolved和Tier 3 native标识保持分开；Tier 3不得跨辖区映射成通用严重度。company/regulated party是notifier authority，Health Canada的平台发布或supply notice是另一个authority。

## 2. 能力、迁移与权利

concept capabilities为report search/read、product search、result export、public API extraction、status/history discovery和Health Canada supply notice read。public read/export/API与需要账户的mandatory report/update是不同ports；后者完全不进入本Channel。

route fixture必须固定2026 host、API instruction revision、resource/version、language、report type、filters、pagination、export schema、report/product identity、status/Tier taxonomy、updated timestamps、rate/error和terms。旧host redirect成功不证明schema兼容；不得静默fallback到旧endpoint、页面内部route或移动app。

公开报告可能包含公司信息；个人/直接联系人、邮箱和电话默认drop。CSV/API/page为同源representation。Canadian public-sector terms和站点运营者边界在durable review前逐字段核验；不得仅因“public access”假设CC0或AI/index权利。

## 3. Fixture与晋级

synthetic fixture覆盖shortage与discontinuation分离、anticipated→actual→resolved、Tier 3 native preservation、product presentation split、report revision、旧/新host schema drift、bilingual enum、export/API common-origin、company authority、contact drop、route unavailable和zero writes。Telemetry按`route revision × report × product/presentation × report type/status/Tier × language × terms revision`记录migration redirect、schema mismatch、identity conflict、history gap和rights block。

metadata-only canary需用户批准，且先重新核验当前public API instructions。禁止账户登录、report/create/update、email subscription、contact、患者/处方数据和医疗建议。
