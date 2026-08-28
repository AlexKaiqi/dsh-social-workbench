# Eurostat EU-SILC Unmet Health-Care Needs Platform Pack

[EU-SILC health metadata](https://ec.europa.eu/eurostat/cache/metadata/en/hlth_silc_01_esms.htm)定义medical与dental care、prior 12 months、自报need/nonreceipt及main reason；access-barrier composite只包含too expensive、waiting list和too far/no transport。[2024 release](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250820-2)使用`hlth_silc_08b`，age 16+。

采用`hlth_silc_08/08b/08c` metadata/DSD/codelist/API fixture；scientific-use microdata不采用。必须固定total population还是people-in-need denominator、main reason、medical/dental、country system definition、income quintile与status flag；EU-SILC不得与EHIS互填。

[restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)仅作EUPL transport reference。Telemetry按`year × country × dataset × population/denominator × service × reason × breakdown × status`记录DSD/reason/composite drift、latest-only revision和zero effects。
