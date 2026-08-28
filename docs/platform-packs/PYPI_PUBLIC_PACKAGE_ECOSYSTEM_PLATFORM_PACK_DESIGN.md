# PyPI Public Package Ecosystem Platform Pack 设计

状态：`researched / fixture-eligible / BigQuery-separate / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`pypi-public-package-ecosystem/v0-design`

## 1. 定位与禁止边界

本Pack只设计公开project/release/file metadata、Index API与RSS release feed。BigQuery download dataset作为独立usage representation；不下载wheel/sdist或provenance payload，不install/import/build，不解析本地requirements/lockfile，不upload/yank/delete project/release/file，不接Google/PyPI credentials。

官方来源：[API policy](https://docs.pypi.org/api/)、[JSON API](https://docs.pypi.org/api/json/)、[Index API](https://docs.pypi.org/api/index-api/)、[Simple Repository API](https://packaging.python.org/en/latest/specifications/simple-repository-api/)、[name normalization](https://packaging.python.org/en/latest/specifications/name-normalization/)、[yanking](https://docs.pypi.org/project-management/yanking/)、[download analysis](https://packaging.python.org/en/latest/guides/analyzing-pypi-package-downloads/)、[RSS feeds](https://docs.pypi.org/api/feeds/)。

## 2. 稳定概念与能力

| Concept / surface | 映射 | 状态 |
| --- | --- | --- |
| project identity | display name + normalized lookup name；`.`, `_`, `-` normalization固定 | fixture-eligible |
| release/version | PEP 440/native resolver revision；release不是file | fixture-eligible |
| distribution file | filename/type/hash/size/requires-python/upload time；descriptor only | fixture-eligible |
| Simple JSON | resolver-index representation；repository API version与last serial保留 | fixture-eligible，new integrations preferred |
| PyPI JSON | project/version metadata；upload-time publisher values；deprecated `releases/downloads`字段不作稳定依赖 | fixture-eligible |
| yanked release | lifecycle assertion；当前PyPI UI只支持whole release，Index file rows暴露yanked reason | fixture-eligible |
| delete project/release/file | distinct irreversible assertions；不能由API absence独推 | fixture-eligible |
| RSS newest/updates/project releases | feed entry representation；bounded release discovery | fixture-eligible |
| BigQuery `pypi.file_downloads` | one row per observed download event，另立metric/window/query/cost definition | synthetic fixture only；live research-gated |

JSON metadata来自upload时提供的值，不一定等于artifact内metadata；同一release后续upload不会更新首个metadata。JSON `downloads`恒为`-1`且已deprecated，禁止当usage值。distribution project名也不等于Python import package名。

## 3. 生命周期、usage与证据

PyPI当前yank是non-destructive release操作；resolver通常忽略yanked release，但exact `==`/`===` match可选。删除可发生在file、release或project且不可逆。建模必须同时保存操作scope与API exposure scope，不能把每个file的`yanked=true`错误计成多个独立release事件。

官方明确说明download statistics会受pip cache、internal/unofficial mirror、非PyPI托管、inflation脚本与历史数据质量影响，也不说明项目质量。BigQuery需要Google project/API，查询可能计费；这使它成为独立Connection/Profile与cost gate，而不是JSON API的附带字段。

只有exact yank/delete/status assertion可候选派生`EvidencePackageLifecyclePressure`；BigQuery聚合只有在query、partition window、installer filter、data-quality caveat与cost evidence齐全时才可候选派生`EvidencePackageUsageProxy`。

## 4. Skills 与开源审计

- [Warehouse](https://github.com/pypi/warehouse/tree/1ccf4dc86f52b79fd8763a68001de23bc4dc4ccb) Apache-2.0，是PyPI canonical implementation静态参考。
- [Twine](https://github.com/pypa/twine/tree/f536ac5d0c77a24a997854328e64644f576b4992) Apache-2.0，是upload协议参考，因write-oriented不作connector。
- [pypinfo](https://github.com/ofek/pypinfo/tree/3950b394f5ef4ab3ba36ab9d1cd43f5bc5ae2802) MIT社区CLI，可参考BigQuery query/cost输出；不安装、不运行、不接credential。
- 未发现PyPI/PyPA官方Agent Skill或面向PyPI research的官方MCP。

Pack Skills：`pypi-contract-and-spec-research/v1`、`pypi-package-fixture-conformance/v1`、未来`pypi-approved-roster-read/v1`与单独立项的`pypi-approved-download-query/v1`。后两者当前分别返回no authorized binding与cost/credential gate。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| `Friendly_Bard` and `friendly-bard` | same normalized lookup identity，保留display spelling |
| one release has many files all yanked | one release assertion + file exposure，authority不按file倍增 |
| exact pin to yanked release | 保存resolver exception；不标记unavailable |
| file deleted, release remains | artifact coverage缺口，不扩成release/project deletion |
| JSON `downloads=-1` | rejected as deprecated sentinel，不生成usage evidence |
| BigQuery cached/mirror/CI rows |按metric definition聚合；不推断unique users |
| ETag/serial changes | append representation revision；不覆盖旧snapshot |
| description/URL/license/file | untrusted/ref only，zero artifact retrieval/execution |

Telemetry按`definition × normalized project × representation × release/file × window/query`记录ETag/cache/serial、project/release/file/lifecycle/usage coverage、normalization/resolver/schema drift、BigQuery bytes/cost gate、content/identity drop与zero upload/yank/delete/install。PyPI API建议使用ETag、descriptive User-Agent与节制请求；大量download应走mirror/cache，不能把“当前edge无rate limit”解释为无限授权。

