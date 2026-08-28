# EU CTIS Clinical Trial Platform Pack 设计

状态：`researched / concept+selected-public-record-fixture / missing-public-machine-contract`  
核验日期：2026-08-26  
Pack ref：`eu-ctis-clinical-trial/v0-design`

## 1. 产品、监管概念与population

本Pack描述EU Clinical Trials Information System的公开trial/report surface。官方[CTIS overview](https://euclinicaltrials.eu/about-this-website/)说明CTIS自2022-01-31上线，sponsors通过同一系统向最多30个EU/EEA国家申请、更新trial并提交结果，Member States/EEA authorities评估、authorize/refuse和监管；公众可查看EU clinical trial number、sponsor、trial design及随transparency规则公开的documents/results。

CTIS把regulatory application、country/member-state decision、authorized/refused、trial start/end/temporary halt/early termination、substantial modification、public document和results放在同一生态，但它们不是一个status。`PublicClinicalStudy*`分别保留study/protocol/application/decision/status/amendment/result/document relation以及sponsor/regulator/member-state authority。

[EMA CTIS页面](https://www.ema.europa.eu/en/human-regulatory-overview/research-development/clinical-trials-human-medicines/clinical-trials-information-system)和门户说明ongoing legacy trials在2025 transition后进入CTIS；2022前的EU Clinical Trials Register/EudraCT与CTIS仍是不同population/representation，不能假定全历史已统一、无遗漏或同一revision。

## 2. access、rights 与route门

本轮核验到公开search和selected trial/report/document页面，但未发现稳定、版本化、公开developer API/schema。当前只建立concept与selected-public-record/manual fixture；不采用浏览器自动化、HTML、内部XHR、search endpoint、community client/MCP或WHO projection作为CTIS fallback。

public disclosure、deferral/redaction、document availability、language和Member State publication具有独立coverage；public portal出现不代表document可长期复制、AI处理或持久索引。每个record/document另存terms、transparency/legal basis、licence/purpose和获取日期。sponsor/contact/site/person与confidential/personal data默认drop。

authorized/refused是regulatory authority state，不等于科学有效、研究已开始、治疗获marketing authorization或patient recommendation；results posted也不证明完整或有效。

## 3. Fixture 与晋级

synthetic fixture覆盖one application/multiple countries、authorized/refused divergence、temporary halt/early termination、substantial modification、public/redacted/deferred document、legacy EudraCT relation、language representation、missing machine contract和zero writes。Telemetry按`EU trial number × country/member state × application/protocol revision × native state × document/results representation × transparency/rights revision`记录coverage、missing documents、authority conflict和zero effects。

只有EMA发布明确public API/schema或用户提供合法export contract后才可提出route fixture升级。真实search/document read、sponsor workspace、application/update/results submission、contact和任何write/effect当前拒绝。
