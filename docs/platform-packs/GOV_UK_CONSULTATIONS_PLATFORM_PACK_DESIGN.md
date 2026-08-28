# GOV.UK Consultations Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / known-path-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`gov-uk-consultations/v0-design`

## 1. 产品、schema 与生命周期

[GOV.UK consultation guidance](https://guidance.publishing.service.gov.uk/publish-update-retire-content/standard-content-types/consultations/)定义consultation为正式征求观点的内容类型；页面在开放、关闭和发布government response后保持同一URL。contact details在关闭时消失，页面转为“analysing feedback”，government response通常应在关闭后12周内发布。

官方document types区分`consultation`、`open_consultation`、`closed_consultation`、`consultation_outcome`以及call-for-evidence各状态。它们可能共享一个content item/schema或作为linked content出现，不能按URL变化猜测新记录或把closed自动写成outcome published。

## 2. 接入与权利

[Content API](https://content-api.publishing.service.gov.uk/)允许任何人无需认证、为任何目的读取已知GOV.UK path对应的JSON，beta且限制10 requests/second；它不提供动态search，也不直接返回attachment bytes，且部分内容可能是placeholder或未迁移。公开[Search API](https://www.gov.uk/help/reuse-govuk-content)明确unsupported、可能无通知变化，因此发现与known-path read必须分开。

GOV.UK content按[Open Government Licence](https://www.gov.uk/help/reuse-govuk-content)复用并保留attribution；第三方attachments、外部consultation sites和personal/contact data仍逐项审查。当前只设计approved roster/known path读取；不使用unsupported Search API做durable completeness承诺，也不scrape站点。

## 3. 固定schema、Skills 与能力边界

[alphagov/publishing-api content schemas `5494a03…`](https://github.com/alphagov/publishing-api/tree/5494a03a6e474a673a287ae029fa3367277f66dc/content_schemas)包含consultation frontend/notification/publisher_v2 JSON Schemas，schema subtree README标MIT；只作synthetic fixture与drift证据，不运行生成器或内部publisher。

未发现官方GOV.UK consultation MCP或Agent Skill。Whitehall Publisher的create/update/publish需要Signon与publisher权限，是政府内容管理面，不属于研究Connector；respond email/form/postal address、survey submission和publication全部拒绝。

## 4. Fixture、观测与晋级

fixture覆盖：open→closed→analysing→outcome、same content ID/revision、call for evidence、external consultation URL、applicable/excluded nations、contact disappearance、response迟延、linked attachments、placeholder/redirect、Content API vs unsupported Search API、OGL attribution与zero response/publish。

Telemetry按`approved path roster × content/schema/document type revision × organisation × lifecycle/window`记录known/requested/found/placeholder/redirect、content/history/outcome/attachment coverage、contact drop、response delay、OGL attribution、Search API attempted=0和write effects=0。未来canary只验证用户批准的known path GET；它不证明全站咨询coverage。
