# Capterra B2B Software Review Platform Pack 设计

状态：`researched / contract-or-manual-export-only / public-blocked / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`capterra-b2b-software-review/v0-design`

## 1. 定位与 population 边界

本Pack把Capterra / Gartner Digital Markets的公开网页、Reviews Insights、own-product Download Tool和licensed competitive comparison视为四个不同populations。当前未发现可支持通用公开review read的官方API；public web在network层直接blocked。未来只能根据用户拥有的vendor account、官方export artifact或书面content license建立独立binding。

官方来源：[General User Terms](https://www.capterra.com/legal/terms-of-use/)、[Content Compliance Policy](https://www.capterra.com/legal/content-policy/)和[Community Guidelines](https://www.capterra.com/legal/community-guidelines/)。本Pack不访问页面、不登录vendor portal、不导出review、不回复或solicit review，不操作rating或incentive。

## 2. 概念与能力映射

| Capterra concept | `ProductFeedback*`映射 | 边界 |
| --- | --- | --- |
| written review | canonical review record | 只当contract/export有exact schema |
| overall/aspect ratings | rating/aspect-rating records | scale、missingness、population固定到definition |
| pros/cons | exact content roles | 只定位authorized artifact revision |
| reason for choosing | selection/switching-reason content | 文本不自动创建relation |
| switched from | exact switched-from relation | 仅exact export field |
| used for / usage context | collection experience context | identity-minimized |
| verified reviewer | provider-verified assertion | 不是事实认证 |
| incentive / vendor-referred | incentive/source context | missing保持unknown |
| vendor response | separate provider response + reply relation | 不证明resolved |
| Reviews Insights / AI summary | provider summary/derived representation | 不伪装reviewer authorship |
| competitive comparison | licensed derived population | 不从own-product export推导 |

reviewer联系方式、LinkedIn、职位、company、country与细粒度firmographics默认drop/restrict。vendor-referred或incentivized只描述征集上下文；incentive不等于positive，也不允许用它删除或降权一条真实体验。

## 3. 权利、export 与 schema 合同

- 2026-05-04 General User Terms覆盖Capterra、Software Advice和GetApp等相关服务，对未获书面许可的automated extract/cache/index/store和AI/ML使用设置明确限制。所以HTML、浏览器、search cache、社区scraper或广汏MCP不是fallback。
- Content Compliance Policy将Reviews Insights限定为internal use；Download Tool只面向客户自有产品reviews并限组织内部使用。这一权限不延伸到竞品review corpus、对外引用或自行计算竞品指标。
- 一个export binding必须固定own-product entitlement、export time、provider schema/version evidence、field inventory、license purpose、allowed audience、retention/deletion和identity minimization。人工下载不意味不需这些合同。
- 没有可验证官方schema的CSV/JSON不得凭字段名猜测。unknown field保留raw quarantine metadata，不直接进入canonical projection。
- 竞品比较或review quote需单独licensed artifact/binding；own-product export不得跨population join补齐。

## 4. Skills与开源审计

- `capterra-contract-export-research/v1`：检查用户提供的官方export instructions、schema、license和purpose，只产生binding proposal。
- `capterra-product-feedback-fixture/v1`：用合成fixture验证review/aspect、pros/cons、verification/incentive unknown、exact switching、vendor response与identity drop。
- 当前无`approved-capterra-read` Skill；请求统一返回`capability-unavailable:no-authorized-export-or-license-binding`。
- [omkarcloud scraper `331966f…`](https://github.com/omkarcloud/capterra-scraper/tree/331966f76d59f686748c0f54453f2c552f0a1160)未发现repo license，且route与现行Terms冲突；[Scavio MCP `1659b5d…`](https://github.com/scavio-ai/scavio-mcp/tree/1659b5de7a14beb40875805a67a523daa9866503)的通用爬取API不提供数据权利。两者均为rejected route reference，不安装、不执行。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| public product page URL | preflight blocked；不发network request |
| own-product export中出现竞品 | 仅authored content；不创建competitor dataset |
| verified + incentivized | 两个正交collection facts；不改写rating |
| incentive不可见 | unknown；不标non-incentivized |
| 自由文本说“从X迁移” | switching candidate；不生成exact relation |
| exact `switched from` export field | exact relation + field evidence |
| vendor response claims fixed | reply assertion；lifecycle不自动resolved |
| export schema/license drift | quarantine，索引不继续更新 |

Telemetry按`export/license binding × own product × schema revision × window`记录artifact received/accepted/quarantined、records projected/dropped、unknown fields、verification/incentive distribution with missingness、switching exact/candidate、identity/firmographic drop、license/retention/deletion drift和zero web/write。进入fixture之后仍不代表callable；真实export、portal访问、长期物化、竞品分析或对外引用均需用户与合同双重授权。
