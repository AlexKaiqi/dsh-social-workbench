# Canada ISC First Nations Drinking Water Advisories Platform Pack 设计

状态：`concept-fixture + official selected/map-download candidate / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`canada-isc-first-nations-drinking-water-advisories/v0-design`

## 1. 稳定概念、authority与population

[About drinking water advisories](https://www.sac-isc.gc.ca/eng/1538160229321/1538160276874)区分boil、do-not-consume与do-not-use，short-term不足一年、long-term超过一年，scope可从单个building到whole community。多数地区由Environmental Public Health Officer建议，First Nation chief and council或delegate实际issue/rescind；BC与部分jurisdiction authority不同。

[Short-term list](https://www.sac-isc.gc.ca/eng/1562856509704/1562856530304)覆盖south of 60但排除BC，并只显示active/recently lifted；[long-term map](https://www.sac-isc.gc.ca/eng/1620925418298/1620925434679)又限定public systems on reserve、financial support与时间基线。两者不能合并成Canada、First Nations或全部supply advisories的完整分母。

## 2. 概念映射

| Native | `PublicDrinkingWaterSafety*` |
| --- | --- |
| First Nation / community / public system | community、system、service-area；identity不依赖名称相似 |
| BWA / DNC / DNU | exact advisory kind与instruction |
| date set / long-term since / date revoked | issue、classification threshold与actual lift history |
| homes/buildings/population band | source-defined population measures，不能相加成unique people |
| EPHO recommendation | lift-recommended standing与health authority |
| chief/council decision | actual issuer rescission |
| repair/upgrade/training/monitoring | action kinds；project complete≠water acceptable |
| ISC funding/support | funding/program authority；不是supplier或lift authority |

## 3. 能力、文化与隐私边界

`definition.read`、`selected advisory/process.read`和`map-download metadata.read`只作fixture/manual candidate。future route固定short/long、active/lifted、financially-supported/not-supported、region/BC exclusion、as-of date、authority和history；不得用地图HTML、social posts或provincial data补成全国coverage。

Community/system identity、small population、homes/buildings、project detail与geography可能形成敏感community/critical-infrastructure画像，默认粗化或drop；尊重First Nation作为system owner/operator和notice issuer的authority，不把ISC support文案改写成federal issuance。全部report/contact/subscribe/advisory/lift/admin/write拒绝。

## 4. Synthetic conformance与遥测

Fixtures覆盖precautionary advisory、BWA/DNC/DNU、one-building vs whole-community、short→long threshold、BC missing、financial-support population split、infrastructure complete but operations pending、confirmation testing→EPHO recommendation→chief/council actual lift、lifted then reissued及project stage drift。

Telemetry按`short/long/map resource × as-of/process revision × region/population scope × community/system × advisory kind/standing × EPHO/issuer/ISC authority × action/completion × coverage/privacy/rights`记录missing region、population mismatch、recommendation-vs-lift gap、stale/project drift、drop/quarantine与effects=0。本轮未请求advisory rows或map data。
