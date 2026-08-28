# SEC EDGAR Corporate Disclosure Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / public-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`sec-edgar-corporate-disclosure/v0-design`

## 1. 产品与population

本Pack只覆盖公开EDGAR submission history、官方filing archive/index/RSS与已抽取XBRL data，不覆盖EDGAR Next账号、token、filer management、submission/status或任何申报动作。

[官方EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)在`data.sec.gov`提供无需认证的Submissions、Company Facts与Frames JSON；Submissions覆盖filer history，XBRL面覆盖10-Q、10-K、8-K、20-F、40-F、6-K及其变体，bulk ZIP夜间重编。完整filing documents、daily/quarterly indexes与RSS属于[EDGAR HTTPS archive](https://www.sec.gov/about/developer-resources)的另一representation。API实时更新不等于历史完整、事实可比或正文rights已批准。

## 2. 概念映射与推断边界

| Native concept | `PublicCorporateDisclosure*` | 约束 |
| --- | --- | --- |
| CIK / ticker / exchange | entity/security identity | ticker可变且非全局identity；CIK不等于跨法域LEI |
| accession/form/filingDate/reportDate | filing envelope/schedule | form type不证明特定section存在或语义一致 |
| primary document / exhibit | document/exhibit relation | exhibit可能含第三方作品、个人信息或合同正文 |
| companyfacts fact | extracted fact representation | 固定taxonomy/concept/context/unit/period/decimals/filing lineage |
| frame | provider aggregate | 不能反推某企业完整filing或跨企业天然可比 |
| 10-K risk/MD&A/strategy span | issuer-authored content | filing acceptance不是SEC验证、事实认定或审计覆盖 |
| amendment/restatement | exact relation/new revision | 不覆盖旧事实；派生索引必须可定位失效 |

历史reported capex/R&D只有在exact fact或reviewed span、固定period/unit/amount role且非forecast时，才可形成`reported-corporate-investment`候选。risk factor只形成issuer disclosure，不证明风险已发生；forward-looking plan最多形成`corporate-strategic-priority`。

## 3. 接入、权利与开源证据

未来route只允许明确CIK/form/date roster的GET、RSS或官方bulk产品。SEC [Fair Access](https://www.sec.gov/about/developer-resources)要求高效访问、当前总量不超过10 requests/second，并会阻断未分类bot；User-Agent/contact、rate、cache、conditional request、backoff与archive/bulk选择进入binding。浏览器CORS缺失不是改走proxy绕过的理由。

公开申报不代表issuer/exhibit正文是政府作品或可任意AI训练、再分发；document/content role逐项记录rights与attribution。签名、地址、电话、个人email、director/officer identity与exhibit默认drop/restrict。

固定community候选：`sec-edgar/sec-edgar@97db601…` Apache-2.0、`dgunning/edgartools@9ded979…` MIT、`SEC-API-io/sec-edgar-mcp@30763cb…` MIT、`skill-us-sec-edgar-harvester@24f1765…` GPL-3.0-only。它们仅作schema/parser/tool/negative fixture，第三方MCP corpus、normalized facts与license不替代SEC authority或content rights；均未安装或执行。

## 4. Fixture、观测与晋级

synthetic fixture覆盖：CIK/ticker变更、recent/older submissions分片、10-K/10-K/A、8-K exhibit、XBRL duplicate context、unit/dimension差异、issuer extension、restatement、fact→filing lineage、planned-vs-reported amount、forward-looking、PII/exhibit quarantine、10rps budget与zero filer APIs。

Telemetry按`CIK × form × accession × representation × taxonomy/version × report period`记录requested/returned/retained/dropped、index/submission/document/fact coverage、recent/older join、amendment/restatement invalidation、context/unit/dimension conflicts、archive/bulk lag、rate/403/backoff、rights/PII drop和write attempts。未来canary先做单CIK metadata-only GET；它不证明正文materialization、全市场coverage或MCP可采用。
