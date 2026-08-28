# CNINFO Corporate Disclosure Platform Pack 设计

状态：`researched / concept-fixture / manual-or-contract-only / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`cninfo-corporate-disclosure/v0-design`

## 1. 平台与当前接入证据

[巨潮资讯公告查询](https://www.cninfo.com.cn/new/commonUrl/pageOfSearch?checkedCategory=category_zj_szsh&url=disclosure%2Flist%2Fsearch)声明平台由深交所全资子公司运营，是法定信息披露平台，覆盖深沪京、基金、债券、港股、定期报告、问询/监管文件等。页面还说明栏目内容由上市公司提供、部分文档由软件自动转换；因此publisher、issuer、exchange/regulator和converted rendition authority必须分开。

本轮未找到面向目标用途的公开、版本化developer API/OpenAPI/feed/export或Agent contract。网页内部JSON/POST请求、PDF静态路径、Data Service商业入口与公开网页不是同一种capability；没有精确合同前只允许synthetic concept fixture和用户有权材料的selected-only manual package。

## 2. 概念映射与边界

| Native concept | `PublicCorporateDisclosure*` | 约束 |
| --- | --- | --- |
| orgId/security code/market | entity/security identity | 内部orgId schema未获官方合同，不据community code固化 |
| announcement ID/title/time | filing envelope/placement | title classification不是正文事实或完整population |
| annual/interim/quarterly report | periodic report | 报告期、披露时间与修订分别记录 |
| inquiry/regulatory measure | authority-authored document | 不当作issuer risk admission或已认定违法 |
| issuer announcement/PDF | statutory portal document | issuer content、portal publication与conversion层分开 |
| correction/cancellation | lifecycle/relation | 旧revision及派生span可定位失效 |
| site search result count | search placement/coverage | 约数、分页上限与内部endpoint不证明全量 |

## 3. Skills、开源与治理

固定community `use_cninfo@7b85afc…` MIT调用网页内部查询、下载PDF并维护cache；`cninfo-disclosure@23da8b8…` MIT Skill封装相同查询/PDF且混入HKEX Playwright；`SenseNova-Skills@98a8bde…` MIT也把CNINFO内部接口包装为market search。它们只作字段和风险线索，不是官方API、许可或可执行route；均未安装、执行或连接。

未发现CNINFO官方领域Skill/MCP。证券代码、公司名称之外的人名、签名、地址、电话、email、股东/高管身份与附件第三方内容默认drop/restrict。任何投资建议、证券交易、互动问答或公告提交均不属于本系统。

## 4. Fixture、观测与晋级

synthetic fixture覆盖：security/org/report/announcement identity、periodic vs ad-hoc、issuer vs regulator authority、PDF conversion、correction relation、market/category placement、approximate/truncated search count、PII drop、internal endpoint/HTML/browser/community Skill拒绝和zero writes。

当前Telemetry只能发布`official-machine-contract-missing`、manual selection provenance与evidence review age，不伪造API health或全市场coverage。只有官方Data Service/developer合同明确schema、auth、rate、目标用途、document/content rights、AI/index、retention/deletion及live/sandbox后，才可提出route fixture/canary；否则保持manual selected-only。
