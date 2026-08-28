# 公共企业信贷需求与融资条件候选分流（2026-08-26）

## 1. 结论

下一Channel选择U.S. Federal Reserve SLOOS、ECB Bank Lending Survey、Bank of England Credit Conditions Survey与Bank of Canada Senior Loan Officer Survey。现有Business Demography与Business Insolvency Channels描述企业形成、存续与formal distress procedure，却缺少两者之间的融资供给、贷款需求、授信标准和价格/非价格条件信号。

这些成员提供lender-reported aggregate pressure，不是identified business lead、loan application、approval、credit volume、contract term、default event或融资建议。

| 成员 | 独特价值 | 官方接入 | 本轮成熟度 | 主要边界 |
| --- | --- | --- | --- | --- |
| Federal Reserve SLOOS | C&I/CRE standards、terms、demand、special questions | HTML/PDF/table + DDP CSV/XML-SDMX | exact machine route + selected manual | standards vs terms；domestic vs foreign panel；DDP迁移 |
| ECB BLS | euro-area/country net percentage、diffusion index、past/expected | ECB Data Portal SDMX `BLS` + report/annex | exact machine route + selected manual | two-step weighting；question/dimension；net vs DI |
| Bank of England CCS | availability、demand、terms、defaults/LGD、market-share balance | HTML + annex/questionnaire XLSX | table/file route + selected manual | measure-specific sign；rights review；无CCS API |
| Bank of Canada SLOS | current overall/price/non-price conditions及历史需求叙述 | Valet `slos` CSV/JSON/XML + pages | exact machine route + historical manual | publication 2020停止但data继续；current/historical fields不连续 |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / availability-or-standard fixture=4 / current-demand fixture=3 / historical-demand fixture=4 / price-term fixture=4 / non-price-term fixture=4 / regular-or-ad-hoc expectation fixture=3 / credit-performance fixture=2 / reported-driver fixture=4 / response-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读official pages/methodology/terms、static route contracts、fixed-SHA source text与`git ls-remote`；没有请求observation、CSV/XML/SDMX/XLS/XLSX/PDF data file、API key/account、MCP/Skill执行或subscription，也没有提交survey、申请贷款、联系银行或产生金融/平台副作用。

## 2. 第一性原理边界

1. lender-reported credit supply、borrower demand、actual loan volume和business financing need是四种不同事实。
2. lending standard是approval policy；loan term是在approval之后的contract condition；availability是另一个survey wording，不能互换。
3. application、approval、facility、drawdown、outstanding balance、default、loss和write-off是不同lifecycle facts；survey方向不产生任何一个individual fact。
4. respondent institution、question response、weighted response、loan category、borrower segment和aggregate series是不同unit。
5. domestic bank、foreign branch/agency、euro-area bank、UK bank/building society与Canadian financial institution不是同一population。
6. C&I、CRE、loans to enterprises、corporate lending、small-business credit、credit lines与capital-market access不按相似label合并。
7. large/middle-market、large、medium、small、very small、SME与PNFC依赖source definition，不允许跨成员自行设统一阈值。
8. net percentage、weighted net balance、diffusion index、balance of opinion、mean response和qualitative descriptor不是同一measure。
9. positive value没有全局含义：可能是tightening、stronger demand、more availability、cheaper/looser terms、higher defaults或improved quality。
10. `tightened minus eased`、`stronger minus weaker`、`increased minus decreased`与intensity-weighted score必须分别绑定question和direction convention。
11. unweighted respondent share、institution market share、individual loan outstanding、national loan share和implicit sample weighting不可互换。
12. past three months、next three months、annual expectation、current level和level relative to historical range是不同time roles。
13. reported expectation不是publisher forecast、bank commitment或realised outturn；需要exact question relation才能事后比较。
14. reported factor contribution是respondent assessment，不是因果估计，也不证明某企业因投资、库存或重组而借款。
15. spread over base/reference rate不是interest-rate level；fees、premium、collateral、covenant、maturity与credit-line size不能压成单一cost。
16. default-rate change、LGD change、delinquency/charge-off expectation不是default count、loss amount或insolvency proceeding。
17. standard/ad-hoc questions、nonresponse、NA、panel churn、confidentiality、question redesign、sign backcast与distribution migration决定coverage和revision。
18. official page、machine endpoint、data republisher、community MCP、licensed durable materialization和cross-country comparability是六个独立结论。
19. aggregate macro pressure可产生市场研究hypothesis，但不能生成identified sales lead、credit score或对困境企业的定向接触。
20. current observation缺失可能来自question not asked、series discontinued、NA、suppression或route drift，不能解释为unchanged/zero demand。

## 3. 官方成员证据

### 3.1 Federal Reserve SLOOS

- [SLOOS About](https://www.federalreserve.gov/data/sloos/about.htm)固定voluntary panel、up-to-six authorisation、typical quarterly cadence、domestic/foreign panels和aggregate-only publication。
- [July 2026 release](https://www.federalreserve.gov/data/sloos/sloos-202607.htm)固定standards/terms/demand的net-percentage方向、firm size与historical-range special questions。
- [DDP SLOOS](https://www.federalreserve.gov/datadownload/Choose.aspx?rel=sloos)与[DDP help](https://www.federalreserve.gov/datadownload/help/)固定CSV/XML-SDMX distribution；BYP退役公告使route处于migration。
- [Board disclaimer](https://www.federalreserve.gov/disclaimer.htm)固定public-domain default与third-party exceptions。

### 3.2 ECB BLS

- [BLS overview](https://www.ecb.europa.eu/stats/ecb_surveys/bank_lending_survey/html/index.en.html)固定quarterly、约160 institutions、22 standard questions、18 backward/4 forward与country results。
- [BLS methodology](https://data.ecb.europa.eu/methodology/bank-lending-survey-bls)固定net percentage、diffusion index与two-step weighting。
- [ECB Data API](https://data.ecb.europa.eu/help/api/data)固定SDMX 2.1 route grammar；`BLS` dataflow仍需DSD/key/coordinate fixture。
- [ESCB reuse policy](https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html)固定attribution、no-confidential-data和revision条件。

### 3.3 Bank of England CCS

- [2026 Q2 release](https://www.bankofengland.co.uk/credit-conditions-survey/2026/2026-q2)固定past/expected、market-share weighting、intensity score、measure-specific positive direction和corporate question set。
- [Compilation guide](https://www.bankofengland.co.uk/credit-conditions-survey/compilation-guide)与release annex/questionnaires固定question/term方法；当前无CCS-specific developer API证据。
- [Legal terms](https://www.bankofengland.co.uk/legal)只明确Database data的OGL；CCS annex durable/commercial reuse保持review-required。

### 3.4 Bank of Canada SLOS

- [SLOS page](https://www.bankofcanada.ca/publications/slos/)固定quarterly current condition series、publication discontinued但data continues、CSV/JSON/XML与response disclaimer。
- [Backgrounder](https://www.bankofcanada.ca/wp-content/uploads/2011/07/senior_loan_officer_survey_backgrounder.pdf)固定balance-of-opinion、market-share weighting、price/non-price与overall construction。
- [Valet guide](https://www.bankofcanada.ca/valet-api-how-to/)固定no-registration/no-key/no-cost route；[terms](https://www.bankofcanada.ca/terms/)固定attribution和不得绕过request limits。
- [2019 Q1 release](https://www.bankofcanada.ca/2019/04/senior-loan-officer-survey-first-quarter-of-2019/)证明历史narrative曾包含demand与capital-market access，但不证明current group仍含这些series。

## 4. 固定版本 OSS、MCP 与 Agent Skill 审计

| 候选 | 身份/许可 | 有价值能力 | 不能证明/风险 |
| --- | --- | --- | --- |
| [shanehull/fred-mcp@`427dc12`](https://github.com/shanehull/fred-mcp/tree/427dc125f8c503662ab4be13d69cf9045dfab6a0) | community，MIT | FRED 37类read tools、ALFRED vintages、series/release metadata | 需FRED key；republisher不是Board SLOOS authority；generic transform不保留question/sign/panel |
| [scka-de/ecb-mcp@`bc50c66`](https://github.com/scka-de/ecb-mcp/tree/bc50c668b7dcf1269bef174ec25d8c693f56e112) | community，MIT | ECB dataset search/explain、generic SDMX read，无key | built-ins不含BLS domain mapping；natural-language key风险；`npx -y`执行latest |
| [tylercroberts/pyvalet@`453b294`](https://github.com/tylercroberts/pyvalet/tree/453b29403354cb6970219c4b25f0ecdbd11e7a1a) | community，MIT | Valet list/group/series、CSV/JSON wrapper | 非官方；旧依赖组合；不理解SLOS sign/weight/history break |
| [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e) | SDMX TWG normative repo；LICENSE未声明 | OpenAPI、data/metadata/availability semantics | protocol reference不是client或domain Skill；许可未清不能复制代码 |

未发现四成员authority维护、同时固定survey/question/panel/loan category/borrower segment/sign/balance/weighting/time role/quality/revision的Business Credit Agent Skill。所有候选只进入knowledge snapshot，不进入active runtime或callable registry。

## 5. 晋级建议

1. 四成员先冻结official program/panel/question/measure/direction/balance/weighting/time role/quality/release/rights。
2. 用synthetic fixtures先证明survey response不等于application/approval/volume，positive sign不全局统一，expectation不等于outturn。
3. 分别验证Fed DDP envelope与迁移、ECB BLS DSD/constraint、BoE HTML/annex schema、BoC Valet `slos` group/series metadata；禁止cross-member fallback。
4. generic MCP/client必须通过fixed-version、tool allowlist、credential/no-install/no-write、bounded network、schema preservation和domain conformance；能返回数字不升级成熟度。
5. sandbox/canary只允许approved aggregate series/cells，限制member/question/period/cell/byte/TTL并监控question/sign/weight/panel/schema/licence/distribution drift。
6. 当前不实现真实Connector、不安装或执行候选、不读取observations。
