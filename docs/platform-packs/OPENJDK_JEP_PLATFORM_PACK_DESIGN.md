# OpenJDK JEP Platform Pack 设计

状态：`researched / concept-fixture-only / official-machine-contract-missing / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`openjdk-jep/v0-design`

## 1. 产品与population

本Pack只描述OpenJDK JEP公开process、JEP index/detail、release target、integration/delivery、preview/incubator与deprecation/removal语义。它不抓取OpenJDK网页、不读取JBS、mailing list或源码、不提交JEP或bug。

[JEP 1](https://openjdk.org/jeps/1)定义JDK Enhancement-Proposal & Roadmap Process；[JEP Index](https://openjdk.org/jeps/0)展示Draft、Submitted、Candidate、Proposed to Target、Targeted、Integrated、Closed/Delivered与Closed/Withdrawn等当前native state。JEP 1的流程叙述与当前index展示存在历史演化，因此状态必须连同网页/process revision evidence保存，不能靠静态枚举猜测。

## 2. 概念映射与推断边界

| Native concept | `PublicTechnicalStandard*` | 约束 |
| --- | --- | --- |
| JEP/type/scope/component | proposal identity/classification | JEP不是Java SE标准，也不替代JCP |
| Draft/Submitted/Candidate | native lifecycle | Candidate不等于funded、targeted或delivered |
| Proposed to Target/Targeted | release decision/target | target仍可能变化；不是所有distribution承诺 |
| Integrated/Closed Delivered | source/release relation | integration与GA availability、默认启用、生产采用分开 |
| preview/incubator | feature mode | 明示非永久API承诺，可能变化或撤回 |
| deprecate/remove | compatibility change | exact release/affected surface与migration text必须定位 |

## 3. 接入、权利与开源证据

本轮未发现官方版本化JEP public API、feed或可固定schema；因此HTML表格不计route fixture，future binding返回`official-machine-contract-missing`，不得fallback到scraper、browser、JBS内部接口或community MCP。

固定官方源码候选：[openjdk/guide@ea3c221](https://github.com/openjdk/guide/tree/ea3c2217d0cdcc3a051395f9d3028c0d6f773416)指向JEP正式流程，root license未发现，只作process witness；[openjdk/jdk@f40a2c3](https://github.com/openjdk/jdk/tree/f40a2c3625484087cfdb41d34b360414ccf0ebd0)是GPL-2.0为主且含附加例外/文件条款的源码候选，只用于未来integration/test lineage设计，不能反推JEP状态。

## 4. Fixture、观测与晋级

synthetic fixture覆盖process/index taxonomy drift、Draft/Submitted/Candidate/Targeted/Integrated/Delivered/Withdrawn、preview/incubator、deprecation/removal、target release变更、JEP↔source/test relation、JEP与JCP/Java SE标准边界及zero bug/JEP/write。

Telemetry按`process revision × JEP × native status × target/delivered release × component`记录taxonomy drift、state/decision completeness、release relation、compatibility role、coverage、rights与blocked route。只有出现正式machine contract或用户批准的manual import定义后才能重新评估，不以“网页稳定”代替合同。
