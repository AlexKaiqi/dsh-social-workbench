# ADR-0001：以证据生命周期为核心，连接器作为可替换边缘

- 状态：Provisional
- 日期：2026-08-23

## 背景

目标横跨信息获取、需求挖掘、内容生成和发布。直接为每个平台编写一个“采集 + 分析 + 发布”的完整 adapter，会复制状态、权限和错误处理，并把平台 DOM/API 的变化传播到整个系统。

## 决策

1. 核心领域对象是 SourceItem、DemandSignal、ContentBrief、ChannelVariant、PublicationPlan 和 PublicationResult。
2. 连接器按可声明能力接入，并记录官方证据、账号类型、授权范围、成本、风险和最后验证时间。
3. 来源事实、模型推断和生成内容分别保存。
4. 发布采用不可变 plan、一次性人工批准和 transactional outbox。
5. 国际多平台发布优先验证 Postiz 委托层；公开网页采集优先验证 RSS/RSSHub；国内平台按官方能力单独接入。
6. 无通用官方发布能力的平台采用 manual handoff，不用私有接口或反检测自动化补齐。

## 后果

- 新增平台通常只改变连接器和平台变体规则，不改变分析与批准模型。
- 系统可以诚实表达“可读但不可发”“可生成交接包但不可自动发布”。
- 初期需要多保存一层 provenance 和能力元数据，但换来可审计与可降级。
- Postiz/RSSHub 等外部服务失效时，核心 evidence、brief 和 publication history 不丢失。

## 未决项

- 首批平台和账号类型。
- 外部 AGPL 服务采用自托管、远程服务还是不接入。
- Evidence Store 的保留时长和删除同步。
- 单人批准与团队角色模型。

## 复审条件

完成两个官方 API spike、一个委托服务 spike 和一个人工交接 spike 后复审；如果领域模型无法表达真实平台差异，再修改，而不是预先为所有平台造抽象。
