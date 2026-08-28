# 中国司法部立法意见征集 Platform Pack 设计

状态：`researched / concept-fixture-eligible / manual-only / no-machine-route`  
核验日期：2026-08-26  
Pack ref：`china-moj-legislative-consultation/v0-design`

## 1. 平台范围与稳定概念

[司法部立法意见征集栏目](https://www.moj.gov.cn/pub/sfbgwapp/lfyjzjapp/)集中发布法律、行政法规、部门规章等草案的公开征求意见通知。本Pack只表达用户选择的公开通知、draft/附件、发布机关、意见期限、提交方式与后续公开结果/正式文本的人工exact relation；不覆盖留言、邮件、邮寄提交或个人意见内容。

同一栏目可能转载其他机关通知，authority必须取通知署名/发布证据而不是网页host。标题中的“草案”“修订稿”“办法”不决定法律层级、stage或最终状态；只有明确官方文件和exact relation才能建立proposal→adopted/correction/outcome。

## 2. 接入与coverage边界

当前未发现官方developer API、版本化schema、bulk/export、RSS、MCP、Agent Skill或允许目标用途的机器合同。列表页与公开正文可见只支持concept evidence和用户选择的manual package，不授权crawler、browser automation、internal endpoint、附件批量下载或长期全文索引。

公开征求意见通常提供deadline和email/postal/online submission方式，但不等于公开全部stakeholder submissions；部分机关或地方会发布征集数量、采纳/不采纳汇总或附件，它们是authority outcome summary，不是完整response corpus。跨机关结果页必须用official reference或人工确认连接，名称/日期相似只形成candidate relation。

## 3. 数据治理与Probe

- 联系人、电话、邮箱、地址和提交者身份默认drop/restrict；
- draft正文与附件逐文件判断政府信息、第三方作品、retention与AI/index权利；
- “收到N条、采纳M条”保留counting definition，不推断unique persons、支持率、代表性或政策成功；
- 未发现结果不能写成“未采纳”或“无反馈”；
- 不以测试、批量或AI生成意见进行政策Probe，任何真实提交都需要独立合法目的、人工审阅、身份与责任确认。

## 4. Fixture、观测与晋级

`china-moj-legislative-consultation-concept-fixture/v1`覆盖联合发文、转载authority、多个deadline/提交方式、draft附件、closed without outcome、later outcome summary、partial adoption counts、final text candidate、contact drop、attachment quarantine与zero submit。

Telemetry只记录manual package的source/date/authority/evidence、concept coverage、missing-machine-contract、relation review和restricted-field drop；不发起网络或自动发现。出现官方API/export/partner contract后再从official evidence重新设计，不继承网页结构或community脚本。
