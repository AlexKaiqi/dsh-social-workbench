# TC39 Proposals Platform Pack 设计

状态：`researched / provider-route-fixture-eligible / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`tc39-proposals/v0-design`

## 1. 产品与population

本Pack覆盖TC39公开proposal index、proposal repository、stage transition/regression/withdrawal、Test262 relation及ECMAScript draft integration。当前route fixture只经GitHub Connector读取固定`tc39`官方repository/path/commit；不参与会议、不提交issue/PR或proposal。

[TC39 Process](https://tc39.es/process-document/)当前定义Stage 0、1、2、2.7、3、4：Stage 2仍可显著变化，2.7用于测试/实现验证，3推荐实现但仍可能因web兼容或生产实现反馈而变化，4才完成并准备纳入standard。Stage 4仍不等于所有runtime已发布或用户已迁移。

## 2. 概念映射与推断边界

| Native concept | `PublicTechnicalStandard*` | 约束 |
| --- | --- | --- |
| champion/committee/editor group | editor/committee authority | champion update不等于stage transition consensus |
| proposal repository | proposal/work item identity | repo存在不证明Stage 1+或committee ownership |
| Stage 0/1/2/2.7/3/4 | native lifecycle | 保留精确stage；不与其他组织数字stage比较 |
| regression/withdrawal | state transition | 旧stage evidence保留，current projection失效 |
| Test262/implementations | test/implementation evidence | tests或prototype不等于shipping adoption |
| ecma262 integration/yearly edition | integration/publication relation | draft integration与GA批准的yearly standard分开 |

## 3. 接入、权利与开源证据

固定官方候选：[tc39/proposals@600a427](https://github.com/tc39/proposals/tree/600a4278a7cabcb53915fa97296b5688529ddd07)用于stage index；root未发现license，不复制或vendoring。 [tc39/ecma262@ed463bc](https://github.com/tc39/ecma262/tree/ed463bc10dbeaad0410ce67e541a77ea8e9900a5)按Ecma TC39 IPR/text copyright policy授权，不能简化为普通MIT/BSD代码库。

未来route同时固定TC39 source authority、GitHub provider authority、repository/path/commit、proposal/stage/process revision和rights purpose。README table不替代meeting decision/source lineage；GitHub读取失败不得fallback到third-party proposal trackers。

## 4. Fixture、观测与晋级

synthetic fixture覆盖0→1、2重大变化、2.7 tests、3 implementation feedback、4 integration、regression、withdrawal、inactive proposal、champion/committee authority、Test262、yearly publication与zero GitHub/committee writes。

Telemetry按`process revision × proposal × repository/commit × stage × target spec/edition`记录stage/decision completeness、transition/regression lineage、test/implementation references、draft/yearly-edition relation、provider/source authority、coverage、rights/license和write attempts。真实repository GET需另行授权，不能把stage count当作需求频次。
