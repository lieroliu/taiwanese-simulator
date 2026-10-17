# 資料來源 (sources.md)

Each JSON file in this folder has `"source": "See sources.md#<topic>"`; the sections below match those topics.
Format of every table: `{"source", "url", "unit", "data": {western year: value}, "est": [estimated years], "notes"}`.
Official tables fetched 2026-10-16 from Taiwan government sites (內政部、衛福部/國健署/疾管署、教育部、主計總處、勞動部、移民署、客委會). Where a table still mixes in secondary sources, its own `source`/`notes` field says so.
Patched files (labour, edu_jobs, education, marriage_divorce, mortality, names): official tables replaced the earlier secondary estimates; any years the official source lacks were kept from the earlier source and are named in that table's `notes`.

## Known gaps
- County births before 1981 and county population before 1974: only in printed yearbooks, not downloadable.
- Unemployment 1961–64, 1966–69, 1971–72; employment by sector/occupation before 1978 is sparse.
- University joint-exam admission rate 1954–2000 is still from a secondary compilation (no official online table).
- House price index: 內政部 pip.moi.gov.tw blocked from this environment; only 2024 price-to-income ratio by county.
- Smoking before 1990, drinking before 2009, betel nut before 2007: no official surveys found.
- Top-10 causes of death by sex before 1981 (1972 both-sexes only).
- 1956/1966 census 本省/外省 by county not online; groups.json uses 客委會 self-identification surveys (2010/2016/2021) instead.
- Household types (單親、祖孫) before 2001, people with disabilities before 2001, household debt ratios before 2002, and the number of 卡債 debtors in 2005–06 (only secondary estimates of 52–70萬 people; not used): no official downloadable table found.
- 國家文化記憶庫 (memory.culture.tw) not reachable from this thread; handled by a separate thread (regional_memory.json).

## births

All from 內政部 (Ministry of the Interior). RIS tables came from 戶政司 人口統計資料 快速下載 (https://www.ris.gov.tw/app/portal/346). That page is an iframe of /info-popudata/app/awFastDownload/toMain_panel, and each file is fetched with a POST to https://www.ris.gov.tw/info-popudata/app/awFastDownload/view with `type=xls&m4c=<code>` plus the session CSRF token. Some tables came from 內政統計查詢網 (https://statis.moi.gov.tw/micst/webMain.aspx?k=defjsp), exported as yearly-cycle CSV through `webMain.aspx?sys=220&funid=<id>&ymf=..&ymt=..&cycle=4&outmode=2&...`.

| Table | Agency / publication / table | Code / URL | Years | Gaps / caveats |
|---|---|---|---|---|
| births_total_and_sex_ratio | 戶政司 歷年全國人口統計資料 > 出生數及粗出生率(按登記及發生), sheets 全國(登記) and 全國(登記)-不含金門縣及連江縣 | RIS y2s1 | 1961–2025 | National births by sex only from 1980. For 1961–79 the sex split is for the Taiwan area (excludes Kinmen and Matsu) |
| total_fertility_rate, fertility_rate_by_mother_age | 戶政司 育齡婦女生育率及繁殖率(按發生) | RIS y2sa | 1961–2025 | ≤1973 excludes Kinmen and Matsu and is by registration date. Unadjusted series used |
| population_national | 戶政司 人口年增加及出生死亡率 (year-end); 年中人口按性別及五齡組 (mid-year) | RIS y1s3, y1s9 | 1961–2025 | Official mid-year figures start 1975. For 1961–74 mid-year = (prev year-end + year-end)/2, which is MOI's own definition; these years are listed in est |
| population_by_county / _22 | 戶政司 年度縣市統計 > 縣市人口按性別及五齡組 (表一) | RIS y0s1 | 1974–2025 | **1961–1973 county population not available** in any downloadable official table. 新竹市 and 嘉義市 are merged into their counties before 1982 |
| births_by_county_sex / _22 | 內政統計查詢網 出生人數(登記日期)性別概況─按區域別分 | statis funid c0120101 | 1994–2025 | The query system starts in 1994. County sums equal the national total. 2007+ cross-checked against RIS y0sm |
| births_by_county_occurrence_22 | 內政統計查詢網 出生人數(發生日期)生母年齡概況─按區域別分 (總計) | statis funid c0120105 | 1981–2025 | Totals only, occurrence basis. **County births 1961–1980 not found** (only in the printed 臺閩地區人口統計 yearbooks) |

County mergers: on 2010-12-25 臺北縣 became 新北市, and 臺中縣+市, 臺南縣+市 and 高雄縣+市 were merged into municipalities. The 2010 annual figures already use the new units. 桃園縣 became 桃園市 on 2014-12-25, and the 2014 figures already use 桃園市. The 22-county versions sum the old units, which is exact because the outer boundaries did not change.

## marriage_divorce

| Table | Source | Code | Years | Notes |
|---|---|---|---|---|
| crude_marriage_rate, marriages | 戶政司 結婚對數及粗結婚率(按登記) | RIS y4s1 | 1961–2025 | ≤1973 excludes Kinmen and Matsu. Same-sex marriages included from 2019 |
| crude_divorce_rate, divorces | 戶政司 離婚對數及粗離婚率(按登記) | RIS y5s1 | 1961–2025 | Same as above |
| mean_age_first_marriage | 戶政司 結婚年齡中位數及平均數(按發生) | RIS y4s5 | 1975–2025 | **1961–1974 not published** in the downloadable series |
| first_marriage_rate | 戶政司 結婚對數、初(再)婚人數(按發生) | RIS y4s3 | 1975–2025 | Rate is per 1000 never-married people aged 15+ |
| marriages_by_age_group_sex | 戶政司 結婚人數按年齡(按發生) | RIS y4s4 | 1975–2025 | The 2020 male all-marriage row has an error in the source; it was corrected using the first-marriage and remarriage rows |
| marriage_rate_by_age_sex | Derived: y4s4 counts / y1s9 mid-year population by sex and age | RIS y4s4 + y1s9 | 1975–2025 | Computed here; not an official published rate |

## names

| Table | Source | URL | Coverage |
|---|---|---|---|
| given_names_by_cohort | 內政部 全國姓名統計分析 112年版, 統計表五十六 各出生年前十大名字排名與人數按性別分 (2023-06-30). 107年版 same table → data_2018. 統計表五十一 → overall_top100_2023 | https://www.ris.gov.tw/documents/data/5/2/112namestat.pdf ; https://www.ris.gov.tw/documents/data/5/2/107namestat.pdf | Birth decades 民國1–9 … 110–112 (1912–2023). Counts are people still living at the snapshot date |
| surnames_top100 | Same publications, 統計表五十七 姓氏排名與人數按三階段年齡別分 | same | Top 100 with counts, 2023 (with age bands) and 2018 |

## health_habits

| Table | Agency / publication | URL | Years | Gaps / caveats |
|---|---|---|---|---|
| adult_smoking_rate | 國民健康署「國人吸菸行為調查結果」圖1 歷年18歲以上成人吸菸率－標準化 (1990-96 菸酒公賣局 survey; 1999 李蘭 survey; 2002 國民健康促進知識態度行為調查; 2004+ 國人吸菸行為調查) | https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=1718&pid=9913 (chart image /PageFile/Attach/9913/File_25908.jpg) | 1990, 92, 94, 96, 99, 2002, 2004-2018, 2020, 2022, 2024; by sex | Values read from the chart's printed data labels. 1990-96 definition (>=3 cig/day) differs from 1999+ (>=100 lifetime + past 30 days). Nothing official before 1990 found. |
| drinking_rate | 國健署/國衛院 國民健康訪問調查 (NHIS), via 健康促進統計年報 103年 表2-2-2 and 114年 表2-2-5 | https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=268&pid=19632 ; https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=268&pid=7529 | 2009, 2013, 2017, 2021; by sex | NHIS 2001/2005 adult past-year drinking not located; no pre-2001 official series. |
| betel_nut_chewing_rate | 國健署 健康危害行為監測調查 / 健康促進暨國人健康行為監測調查, via 健康促進統計年報 103年 表2-3-1 and 114年 表2-3-3 | same two yearbook URLs | 2007-2018 annual; 2023 (=pooled 2023-24); male 2007-11 only | 2019-2021 not surveyed; nothing official before 2007 found. |
| hbv_carrier_rate | 疾管署 疫情報導 32(14), 2016「臺灣B型肝炎防治」; 疾管局 DOH98-DC-1103 期末報告 | https://www.cdc.gov.tw/Uploads/files/201607/d1c77547-90f9-4c17-a57c-a75754c3a7b8.pdf ; https://www.cdc.gov.tw/Uploads/files/c71e9435-fde8-48c5-81ff-a78293911e9e.pdf | Points: 1980s, 1984, 1993, 2007, 2009, 2011, 2013, 2014 | Report-level points (6-year-olds, pregnant women, adults), not annual; no sex split. Vaccination: July 1984 (carrier mothers' infants), universal July 1986. |
| hypertension_diabetes_prevalence | 國健署 國民營養健康(狀況變遷)調查 via 健康促進統計年報 103年 表1-2-1 (20+) and 114年 表1-2-3 (18+, rolling) | https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=268&pid=19632 | 2005-08, 2013-14, rolling 2013-16 ... 2020-24; by sex | Two age bases. NAHSIT 1993-96 and 2002 三高調查 figures not retrieved. |

## mortality

| Table | Agency / publication | URL | Years | Gaps / caveats |
|---|---|---|---|---|
| life_expectancy (replacement) | 內政部 民國50-58年臺灣地區簡易生命表 (tc505-tc585.htm) for 1961-69; 1970+ unchanged | https://www.moi.gov.tw/cl.aspx?n=3032 (files via ws.moi.gov.tw/Download.ashx) | 1961-2025 | 1961-69 male/female only (no both-sexes e0 published). |
| life_table_qx | 內政部 歷年簡易生命表: 民國50年 (五歲組), 60/70/80年 (lt60/lt70/lt80.htm), 90年 (tc9021s.htm), 100年 表2, 110年 表2, 114年 表2 | https://www.moi.gov.tw/cl.aspx?n=2982 | 1961, 1971, 1981, 1991, 2001, 2011, 2021, 2025; by sex | Grouped nqx computed from published lx; truncated at 85+. Supersedes life_table_qx_1971. |
| infant_mortality_mohw | 衛福部統計處 114年死因統計年報 表11 | https://dep.mohw.gov.tw/DOS/cp-5069-87715-113.html (xlsx: https://www.mohw.gov.tw/dl-102168-341816db-80fa-41d5-86e7-e885b35872af.html) | 1986-2025 annual (both sexes) | 1995 jump = registration improvement. No sex split in this table; life-table q0 by sex in life_table_qx notes. |
| injury_death_rates_annual | 同上 表12 (事故傷害, 運輸, 機動車) and 表13 (自殺) | same | 1986-2025 annual | ICD-9 to 2007, ICD-10 from 2008. |
| causes_of_death_by_sex | 同上 表1-3 歷年(男性/女性)死亡原因 | same | 1981, 1986, 1991, 1996, 2001, 2006, 2011, 2016, 2021, 2024, 2025 | 1961 and 1971 not obtained: only scanned PDFs (衛生統計要覽 61-62年, 衛生統計(二)生命統計 63-80年) at https://dep.mohw.gov.tw/DOS/lp-5066-113-xCat-003-2-20.html. |
| cause_rates_by_sex | 同上 表1-3 | same | 1981-2001 every 5 yrs; 2006-2025 annual | accidents, suicide, chronic liver disease & cirrhosis. |
| causes_of_death_1972 | 臺灣省政府衛生處 臺灣省衛生統計要覽 民國61年 表32 十大主要死亡原因 (scanned PDF, values read from page image, pdf p.109) | https://service.mohw.gov.tw/WWWDOS/Files/%E8%A1%9B%E7%94%9F%E7%B5%B1%E8%A8%88%E8%A6%81%E8%A6%BD/61%E5%B9%B4.pdf | 1972 | Both sexes only; nearest available to 1971. |
| infant_mortality_registered_1963_1972 | 同上 表35 嬰兒及產婦死亡率 (pdf p.114-115) | same | 1963-1972 | Registered rates, under-reported. |

## income_prices

DGBAS database tables are queried as `https://nstatdb.dgbas.gov.tw/dgbasall/webMain.aspx?sys=210&funid=<ID>`. The CSV export uses `sys=220&funid=<ID>&outmode=3&cycle=4&ym=4000&ymt=11600&fldlst=111…`.

| Table | Agency / publication | URL | Years | Gaps / caveats |
|---|---|---|---|---|
| household_disposable_income | 行政院主計總處 (DGBAS), 114年家庭收支調查報告: 第4表 所得分配比與所得差距 and 第10表 可支配所得; 家庭收支重要指標 (A020001010) for median and per-capita figures | https://www.stat.gov.tw/News_Content.aspx?n=3908&s=236588 (Year04.xls, Year10.xls); nstatdb A020001010 | Mean: 1964, 1968, 1970–2025. Q5/Q1 ratio and Gini: 1964, 1968, 1970, 1972, 1974, 1976–2025. Median and per-capita: 1976–2025 | The survey ran every 2 years before 1970. The historical table has no 1966 value. 1961–63 are before the survey began |
| household_income_by_county | DGBAS 家庭收支調查 常用資料: 平均每戶可支配所得─按區域別分 | https://www.stat.gov.tw/cp.aspx?n=3914 → https://ws.dgbas.gov.tw/001/Upload/463/relfile/10315/1259/mean.xls | 1980–2010 every 5 years (old county boundaries); 2011–2025 every year | The source has every year from 1980. 新竹市 and 嘉義市 are blank in early years. Kinmen and Matsu are not covered |
| cpi | DGBAS 物價統計: 各種物價總指數 | nstatdb A030601015 (2021=100, 1981+); A030601019 (2016=100, 1959–2022) | 1959–2025 | Base-2021 values for 1959–80 are rescaled by me, not official, and are listed in `est`. Inflation is computed from the index |
| basic_wage | 勞動部: 基本工資之制訂與調整經過; 歷年最低工資/基本工資調整 | https://www.mol.gov.tw/topic/3067/5990/5999/14485/?cprint=pt ; https://www.mol.gov.tw/1607/28162/28166/28180/70460/76761/76833/ | 1956–2026 (effective dates) | 1956 and 1964 give the year only. The minimum wage replaced the basic wage from 2025. The 2027 rate (30,900) is excluded because it was still awaiting Executive Yuan approval |
| avg_monthly_earnings | DGBAS 薪資及生產力統計: 每人每月總薪資 (A046201010) and 經常性薪資 (A046301010) | nstatdb A046201010, A046301010 | Industry + services, total and by sex: 1980–2025. Industry sector and manufacturing: 1973–2025 | No industry + services aggregate before 1980 |
| gdp_per_capita | DGBAS 國民所得統計常用資料 (A018101010) | nstatdb A018101010 | 1961–2025 | 2025 is preliminary |
| house_price_to_income_ratio | 國家發展委員會 都市及區域發展統計彙編 6-1-3 住宅支出, compiled from 內政部 房價負擔能力指標 | https://data.gov.tw/dataset/6507 | 2024 only, by county | pip.moi.gov.tw blocks this environment (WAF "Request Rejected"), so 2002–2023 could not be retrieved |
| house_price_index | 內政部 住宅價格指數 | https://pip.moi.gov.tw/ | none | Not retrieved because the site is blocked. Private indexes (信義, 國泰) are not official and were not used |

## labour

| Table | Agency / publication | URL | Years | Gaps |
|---|---|---|---|---|
| unemployment_rate | DGBAS 人力資源調查 人力資源主要指標 (A040107010); points before 1978 kept from Data Book 2002 | nstatdb A040107010 | 1978–2025 every year, plus 1952–77 points | 1961–64, 1966–69 and 1971–72 not retrievable: the database starts in 1978 and older Data Books are blocked |
| unemployment_rate_by_sex (new) | same | same | 1978–2025 | — |
| lfpr_by_sex | same (published rates) | same | 1978–2025 | By-sex figures before 1978 are unavailable |
| employment_by_sector | DGBAS 各行業就業人口: A040103010 (1978–2000), A040103055 (2001+); points before 1978 kept from Mao & Schive | nstatdb A040103010, A040103055 | 1978–2025 every year | Classification break in 2001. Gap years before 1978 remain |

## edu_jobs

| Table | Agency / publication | URL | Years | Gaps |
|---|---|---|---|---|
| employed_by_occupation_share | DGBAS 職業別就業人口: A040104010 (5th revision), A040104020 (6th revision) | nstatdb | 1978–2025 every year | Classification break in 2001 |
| employed_by_education_share | DGBAS 勞動力-按教育程度分 (A040101020) | nstatdb A040101020 | 1978–2025 | Graduate degrees shown separately only from 2011 |
| earnings_by_industry | DGBAS A046201010; basic wage from 勞動部 | nstatdb A046201010 | 1973/1980–2025 | DGBAS revisions change some older values. The 2024–25 by-industry snippets still come from news reports |

## education

| Table | Agency / publication | URL | Years | Gaps |
|---|---|---|---|---|
| junior_high_continuation_rate, elementary_to_junior_high_rate, senior_high_to_higher_ed_rate (+ vocational) | 教育部 各級學校畢業生升學率, via DGBAS A160103010; pre-1976 values kept from PECC/MOE | nstatdb A160103010 | 1976–2025 every year (vocational from 1987), plus pre-1976 points | Senior-high definition changes in 1999 (based on a graduate survey) |
| univ_admission_rate | 大學考試入學分發委員會; 教育部 一般大學日間部招生報考及錄取人數 (2001–2009, including all-routes rate) | https://ws.moe.edu.tw/001/Upload/1/relfile/7851/41916/49ec7d5b-2dcc-411f-8841-a22d9edb641f.pdf | 1954–2026 | Rates for 1954–2000 still come from a secondary compilation. No official table was found |
| higher_ed_net_enrollment (by_age added) | 教育部 高等教育淨在學率, via DGBAS A160102012 | nstatdb A160102012 | 2008–2025 | No aggregate for ages 18–21 |
| educational_attainment_15plus (new) | DGBAS 人力資源調查 (A040101020: employed + unemployed + not in labour force); 內政部 戶籍 15歲以上人口教育程度 (A130208010) | nstatdb A040101020, A130208010 | Survey: 1978–2025. Registry: 1997, 2000–2025 every 5 years | Nothing before 1978 (would need census data) |

## groups

File: `data/groups.json` (topic "groups"). All figures are official government publications; none are interpolated (`est` is empty for every table).

### hakka_share_by_county
- Agency: 客家委員會 (Hakka Affairs Council)
- Publications: 全國客家人口基礎資料調查研究 for 93年 (2004), 97年 (2008), 99–100年 (2010/11) and 103年 (2014); 105年度 (2016) and 110年 (2021) 全國客家人口暨語言基礎資料調查研究
- URLs:
  - 2021 report: https://www.hakka.gov.tw/File/Attach/37585/File_96737.pdf (表3-2 gives the 2016 and 2021 county shares and counts under 客家基本法, by county of household registration)
  - 2016 report: https://www.hakka.gov.tw/File/Attach/37585/File_73865.pdf
  - 2010/11 report, Tainan City Government mirror of the council's report: https://w3fs.tainan.gov.tw/001/Upload/14/attachment/8851/4216/99%E5%B9%B4%E5%AE%A2%E5%AE%B6%E4%BA%BA%E5%8F%A3%E8%AA%BF%E6%9F%A5.pdf (附表A-5 shares and 附表A-6 counts, by county of residence)
  - Report list and national figures for 2004: https://cloud.hakka.gov.tw/Pub/Opendata/DTST20251200013.csv (data.gov.tw dataset 176211); https://cloud.hakka.gov.tw/Pub/Opendata/DTST20171200004.csv (data.gov.tw dataset 73163)
- Years: 客家基本法 county shares for 2010, 2016 and 2021. National 客家基本法 figure only for 2014. National single and multiple self-identification figures for 2004 and 2008.
- Gaps:
  - The 客家基本法 definition starts with the 2010/11 survey.
  - No county shares for 2004.
  - 2008 county shares exist only under 多重自我認定.
  - The 2014 report was not downloaded, so there are no 2014 county shares under 客家基本法.
  - 澎湖, 金門 and 連江 have small samples.

### hakka_multi_self_id_by_county
- Agency and publications: the same as above, from 99–100年 report 表6-2 (2008 and 2010) and 105年 report 表4-5 (2014 and 2016)
- Years: 2008, 2010, 2014, 2016. These are the only county shares comparable back to 2008.

### mainlander_share_by_county
- The official 1956 戶口普查 and 1966 census county tables of 本省籍/外省籍 were not found online.
  - Searched 主計總處, 內政部, ndc and data.gov.tw. Only library catalogue records and secondary citations turned up.
  - Nothing was fabricated.
- Substitute data: 客家委員會 surveys, 單一自我認定主要族群 by county of residence. This covers 福老, 客家, 大陸各省市人, 原住民 and 臺灣人.
  - 2010/11 report 附表A-7
  - 2016 report 附表A-5
  - 2021 report 附表A-5
  - URLs are the same as for hakka_share_by_county.
- Years: 2010, 2016, 2021. These are survey self-identification shares, not 籍貫 or census data.

### indigenous_population_by_county
- Agency: 內政部 (內政統計查詢網; 戶政司)
- Tables:
  - 原住民人口─按區域別分 (funid c0110501, year-end), with denominators from 土地面積、戶數與人口數 (c0110101)
  - 現住原住民人口按性別、身分、原住民族別分 (村里 level CSVs, summed to national)
- URLs:
  - https://statis.moi.gov.tw/micst/webMain.aspx?sys=220&kind=21&type=1&funid=c0110501&cycle=4&outmode=12&utf=1&compmode=0&outkind=3&fldlst=111&codspc0=0,40,&ym=8000&ymt=11400
  - The same URL pattern with funid=c0110101
  - https://data.gov.tw/dataset/77052 and https://data.gov.tw/dataset/32971 (opdadm.moi.gov.tw downloads)
- Years: 1995–2025 by county, with 山地/平地 split and % of population. Tribe breakdown for 2015, 2021 and 2025.
- Gaps:
  - Nothing before 1995 in the MOI query system.
  - The jump in 2024–25 coincides with the 2024 amendment of 原住民身分法. The cause is inferred; the table does not state it.

### foreign_spouses
- Agencies: 內政部移民署; 內政部 (戶政)
- Tables:
  - 各縣市外裔、外籍配偶人數與大陸(含港澳)配偶人數 (cumulative since 1987-01; December files)
  - 結婚人數按國籍分 (c0140102)
  - 出生人數按生母原屬國籍 (c0120102)
- URLs:
  - https://www.immigration.gov.tw/5385/7344/7350/8887/?alias=settledown (xlsx/xls per month, e.g. /media/117184/…11412.xls)
  - https://statis.moi.gov.tw/micst/webMain.aspx?sys=220&kind=21&type=1&funid=c0140102&cycle=4&outmode=12&utf=1&compmode=0&outkind=3&codspc0=0,1,&codspc1=0,3,&ym=5000&ymt=11400
  - The same URL pattern with funid=c0120102
- Years:
  - Cumulative stock by nationality: 2015–2025
  - Marriages by spouse nationality: 2004–2025
  - Births by mother's nationality: 2004–2025
- Gaps:
  - The 2007–2014 December files linked from the immigration agency's archive return 404.
  - 1998–2003 marriages and births were not found in the MOI query system.

### migrant_workers
- Agency: 勞動部 (data from 勞動力發展署)
- Publication: 勞動統計年報
  - 2025 edition: 表13-2 引進移工在臺人數－按工作內容分 and 表13-3 按國籍分
  - Older editions: 表13-1 for 1992–1995
- URLs:
  - https://statdb.mol.gov.tw/html/year/year14/313030.pdf
  - https://statdb.mol.gov.tw/html/year/year14/313020.pdf
  - https://statdb.mol.gov.tw/html/year/year03/313010.pdf
  - https://statdb.mol.gov.tw/html/year/year13/313030.pdf
- Years:
  - Totals and industry vs social-welfare split: 1992–2025
  - Sector split and caregiver vs domestic-helper split: 1996–2025
  - Nationality split: 2000–2025
- Gaps:
  - No 1991.
  - 1992–95 social-welfare figures are computed as total minus industry.
  - From 2015, workers whose permit has lapsed are reported separately.

### new_immigrant_children
- Agency: 教育部統計處
- Sources:
  - 新住民子女就讀國中小人數分布概況統計 (106學年度 report; series covers 93–106學年)
  - Open data 104–114學年新住民子女就讀幼兒園及國中小學生人數
- URLs:
  - https://stats.moe.gov.tw/files/analysis/son_of_foreign_106.pdf
  - https://stats.moe.gov.tw/files/opendata/104_114edu_A_1_9.csv (data.gov.tw dataset 46320)
- Years:
  - 2004–2025 school-year counts
  - % of students for 2004–2017
  - Parent nationality for 2015–2025
- Gaps:
  - No % for 2018+, because the total enrolment figure is not in that file.
  - Later report PDFs (son_of_foreign_110 to 113) return 404.

## region_events

File: `data/region_events.json`. All three tables are keyed by **county** (the 22 current counties and cities), not by year. Counties that existed before the 2010 mergers are filed under their current names: 臺北縣→新北市, 臺中縣→臺中市, 臺南縣→臺南市, 高雄縣→高雄市, 桃園縣→桃園市. There are also two extra keys. `全臺` holds disasters that cannot be tied to one county. `全國` holds national oral-history collections.

### disasters_by_county (1961–2025)

**Main sources:**
- 內政部消防署, 臺灣地區天然災害損失統計表 (47年至114年12月), XLS. https://www.nfa.gov.tw/cht/index.php?act=download&ids=26130
  - Covers 1958–2025, giving deaths and missing per event.
  - The 總表 sheet runs to 1990. A separate sheet covers 1994 onward (after 消防署 was founded). The 1991–1993 rows have no events with 8 or more deaths.
  - The two sheets differ slightly for 2024: 0403 earthquake 20 vs 18 deaths, and 凱米 16 vs 15. The 1994+ sheet is used.
- 中央氣象署, 颱風資料庫, 颱風概況表 「災情」 field. https://rdc28.cwa.gov.tw/TDB/public/typhoon_detail?typhoon_id=YYYYNN
  - The list of all 415 warned typhoons from 1961 to 2026 came from the AJAX endpoint `public/warning_typhoon_list/get_warning_typhoon`.
  - Typhoon pages before 1994 say only 「有人員傷亡」 and give no numbers. The page for 納莉 (2001) has an empty 災情 field.
  - The page text is used for which counties were hit. Death counts come from 消防署.
- 中央氣象署地震測報中心, 1901年後災害性地震列表. https://scweb.cwa.gov.tw/zh-tw/page/disaster/5
  - The damage figures on this page cite 消防署. The 2024-04-03 earthquake was not on the first page load and is taken from 消防署 instead.

**Droughts:**
- 立法院預算中心 (2023-08), 表2-2-1 嚴重旱災 91–112年 and 表2-2-2 停灌/分區供水 104–112年. https://www.ly.gov.tw/Pages/Detail.aspx?nodeid=46360&pid=230835
- 水利署, 91北部地區乾旱事件. https://web.wra.gov.tw/ferc/News_Content.aspx?n=7995&s=39568
- 總統府 news release 19289 (Taipei third-stage water restrictions in 2002).

**Land subsidence:**
- 水利署 地層下陷狀況, 2025: significant subsidence area is 0. https://www.wra.gov.tw/cp.aspx?n=3679
- 水利署電子報 0172. Lists the counties with past subsidence, and gives area changes from 2001 to 2015. https://www.wra.gov.tw/epaper/Article_Detail.aspx?s=2835&n=30173
- 經濟部 2021-12-14 news: 雲林 502.7 km². https://www.moea.gov.tw/MNS/populace/news/News.aspx?kind=1&menu_id=40&news_id=98168
- **Gap:** the site web.wra.gov.tw/landsubsidence rejects requests from this environment ("Request Rejected"). Two cumulative figures were seen only in search-engine snippets of 水利署 pages and should be treated as unverified:
  - 屏東 佳冬 ≥320 cm, 1972–2001
  - 雲林 台西 about 220 cm, 1976–2003

**Event-specific sources:**
- 921 county deaths: 疾管署 report.
- 小林村: 監察院 msg 2759.
- 納莉: 水利署電子報 s=2474.
- 葛樂禮 / 石門水庫: 水利署電子報 s=2291. This page returned 503 when I checked it; its content was taken from the search index.
- 維冠: 工程會.
- 馬太鞍: 行政院 / NCDR.

**Gaps:**
- Typhoons before 1994 give only regions (北部, 南部, and so on). Where the source names only a region, I spread the event to every county in that region and marked those entries `region_mapped=true`. This is my own judgement.
- Disasters with no location in the official tables were left out: 1984-06-03 水災, 2005-06-12 豪雨, 1983 山洪.

### local_events_by_county (1979–2021, plus one background item from 1925)

**Sources** (full URLs are in `source_codes` inside the JSON):
- 監察院 investigation report on the three 1984 mine disasters (cybsbox 72322): dates and deaths for each.
- 國家運輸安全調查委員會: 太魯閣號, 南方澳大橋, CI611, GE222, SQ006. Its 2018 briefing on ey.gov.tw gives 202 deaths for CI676.
- 檔案管理局: 中華商場, and the Kaohsiung upgrades (1979 and 2010).
- 臺北市市場處: 254 displaced 中華商場 households.
- 黃金博物館: 金瓜石 closure in 1987.
- 環境部: RCA, 反杜邦, 六輕.
- 經濟部 雲林離島工業區.
- 臺灣省諮議會: 衛爾康 fire.
- 水利署 and 總統府: 八掌溪.
- 國家人權記憶庫: 高雄事件.
- 國史館臺灣文獻館 林志森 oral history, plus 林園區公所: 林園事件.
- 高公局: 雪山隧道.
- 金門日報 (kmdn.gov.tw): end of military administration on 1992-11-07.
- 馬祖日報: 小三通, 2001-01-02.
- 中研院 研之有物: 二林蔗農 (1925, flagged as background before 1961).

**Gaps:**
- I found no citable official page for these, so they are not included: 桃園 upgrade (2014), 臺北市 upgrade (1967), GE235 (2015), 國華航空 (1998).
- 新竹縣, 新竹市, 基隆, 苗栗, 南投, 屏東 and 臺東 have no social events in this table. Their local history appears in the disasters table instead.

### oral_history_sources_by_county

**Sources:**
- 國史館臺灣文獻館, 耆老口述歷史叢書 「XX鄉土史料」 (1992–2000). It covers 19 counties.
  - The original list page (th.gov.tw/new_site/05publish/07study/01history_saying.php) now returns 404. The series numbers come from the search-index copy of that page. Three were cross-checked against library catalogues: 9, 14 and 5.
  - The URL given is the institute's publication search page: https://www.th.gov.tw/CP/277
- Other sources, by institution:
  - City and county bureaus and history halls: 臺北市立文獻館, 黃金博物館, 基隆文觀局, 彰化文化局, 雲林文觀處, 嘉義市志, 臺南文化局, 高雄史博館, 屏東縣志, 宜蘭縣史館, 花蓮文化局, 澎湖記憶數位資料庫, 金門文化局, 連江文化處.
  - Hakka and Indigenous agencies: 客委會 客家文化發展中心 and 原民會.
  - National collections: 國史館, 國家人權博物館, 中研院近史所 and 臺史所, 國家圖書館 臺灣記憶.

**Gaps:**
- memory.culture.tw (國家文化記憶庫) was skipped on the coordinator's instruction. It is also blocked by the proxy here (CONNECT 403).
- Some URLs could not be reached from this environment, because of TLS or WAF errors, and are cited from the search index: chr.gov.taipei, tpa.gov.tw, bocach.gov.tw, content.yunlin.gov.tw (403), khm.org.tw, yihistory.e-land.gov.tw, matsu.gov.tw, mh.sinica.edu.tw, culture.hccc.gov.tw.

# Sources — region_economy & region_access (worker region1)

## region_economy

### employment_by_industry_by_county
- Agency / publication: 主計總處 79年戶口及住宅普查 就業狀況結果表(1990, 全查)；84年人口及居住調查(1995, 普查中間年抽樣)；人力資源調查 「就業者之行業─按地區分」年資料(2015-2025, data.gov.tw dataset 34113)
- URL: https://ws.dgbas.gov.tw/public/attachment/53114111171.pdf ; https://ws.dgbas.gov.tw/public/attachment/53114152171.pdf ; https://data.gov.tw/dataset/34113 (e.g. https://ws.dgbas.gov.tw/001/Upload/461/relfile/11525/236096/mp04044a114.xml)
- Years covered: 1990, 1995, 2015–2025
- Unit: % of employed persons aged 15+ by industry (rounded 0.1; rows sum to ~100); employed_thousand = employed persons in thousands
- Gaps / notes: Categories: agriculture=農林漁牧; mining_utilities=礦業+水電燃氣(+用水污染整治); manufacturing; construction=營造; commerce=批發零售(含國際貿易)+住宿餐飲(餐旅); public_education_health=公共行政+教育+醫療保健社工 (1990: 公共行政+社會服務業[教育/醫療/社福等]; 1995: 公共行政+社會服務及個人服務, so 1995 includes personal services and is not strictly comparable); other_services=運輸倉儲通信, 金融保險不動產, 工商/專業服務, 個人及其他服務. 1990/1995 are given both by the units of the time (by_historical_unit: 臺北縣, 臺中縣, 臺中市(省轄), 臺南縣, 高雄縣, 高雄市(院轄) etc.) and summed into today's 22 units (by_current_22; 金門/連江 not covered by 臺灣地區 tables). 1990 census excludes armed forces; 1995 survey counts in thousands (small counties rounded). Manpower-survey county estimates (2015+) have sampling error, esp. for 澎湖/臺東/嘉義市. GAP: no official online county-by-industry tables found for 1961-1989 or 1996-2014 (1966/1980 census reports and pre-2015 manpower yearbooks are not online as tables; 2000/2010 census county tables sit behind census.dgbas.gov.tw which blocks automated access).

### farm_household_share_by_county
- Agency / publication: 主計總處 農林漁牧業普查: 84年(1995) 農牧戶數按專兼業分 / 獨資漁戶數按專兼業分; 104年(2015) 表1 從事農牧業之農牧戶家數; 109年(2020) 表33 從業農牧戶家數, 漁業 表22 從業獨資漁戶家數; denominators = 內政部 戶籍登記戶數 (年底, 內政統計查詢網 c0110101); national series from 歷次普查結果摘要表
- URL: https://ws.dgbas.gov.tw/public/attachment/522313482471.pdf ; https://ws.dgbas.gov.tw/public/attachment/522313564671.pdf ; https://ws.dgbas.gov.tw/public/data/dgbas04/bc1/2015census/f1/2101010.xls ; https://ws.dgbas.gov.tw/001/Upload/463/relfile/11069/231576/a5637f90-c47d-4a0a-b688-2d03dbdfb8ce.xlsx ; https://ws.dgbas.gov.tw/001/Upload/463/relfile/11069/231576/97aab098-3f7e-46e6-864b-a1d71c944fb6.xlsx ; https://statis.moi.gov.tw/micst/webMain.aspx?sys=220&funid=c0110101
- Years covered: 1995, 2015 (farm only), 2020; national summary 1956–2020
- Unit: households; share = farm (or fishing) households / all registered households in the county, %
- Gaps / notes: 1995 counts ALL 農牧戶 (incl. part-time); 2015/2020 count only households actually operating farming that year (從事/從業農牧戶), so 2015/2020 are slightly lower by definition (national 2020: 691,477 operating vs 761,854 all). Fishing = 獨資漁戶 (sole-proprietor fishing households). 1995 臺中市/嘉義市 fishing counts suppressed (D) by DGBAS. Census household counts vs registered households: registered households include many one-person registrations, so shares are lower bounds of the share of people living on farms; national 農牧戶人口 share is given in national_summary. County tables for 1960-1990 censuses are not online (only national summary).

### industrial_zones
- Agency / publication: 經濟部產業園區管理局 (前加工出口區管理處 + 工業局工業區組) 園區介紹/服務中心園區簡介 pages; 科技產業園區 受雇員工統計表 (114年12月) and 統計月報摘要; 國科會 科學園區統計資料庫 D-1 從業員工數 (2026-09); 竹科/南科/中科 管理局 official history pages
- URL: https://www.bip.gov.tw/page.aspx?pageid=45da8e73a81d495d ; https://www.bip.gov.tw/formdownload.aspx?pageid=c888385a83251f60 ; https://www.bip.gov.tw/formdownload.aspx?pageid=ba9bc8e2b5bc5183 ; https://wsts.nstc.gov.tw/stsweb/sciencepark/ScienceParkReport.aspx?language=C&quyid=tqemployees01
- Years covered: opening dates 1966–; EPZ employees 1991–2025; science parks 2026-09
- Unit: opened = completion/opening date as stated on the official page (YYYY or YYYY-MM or YYYY-MM-DD); employees = persons
- Gaps / notes: Peak employment by zone is NOT published online: the 科技產業園區 summary sheet gives total EPZ employees only from 1991 (66,151) to now (2025-12: 89,554 in enterprises + 537 gov staff); pre-1991 totals not online. Science-park employees are current (2026-09) totals per administration, not per sub-park. State enterprises: 中鋼, 中油大林煉油廠, 台船 are listed by the official 臨海工業區 page as located in 高雄臨海工業區; 中鋼/中油/台塑 company websites were unreachable from this environment, so their own opening dates are not included. opened=null where the official page gives no date (see note).

### county_specialties
- Agency / publication: (a) 主計總處 79年戶口及住宅普查 就業者之行業按地區分 (manufacturing sub-industry shares, computed); (b) official park pages listed per entry
- URL: https://ws.dgbas.gov.tw/public/attachment/53114111171.pdf
- Years covered: 1990 + current park notes
- Unit: top-3 manufacturing sub-industries by share of manufacturing employment (%), 1990
- Gaps / notes: 1990 sub-industry ranking is a factual computation from the census table (residence-based: where workers live, not where factories are). official_park_notes: per county, signature industries as stated on government park pages (URL per entry).

## region_access

### transport_milestones
- Agency / publication: 交通部高速公路局（國工局編年大事紀）、國家發展委員會檔案管理局、行政院、交通部鐵道局、臺北捷運公司、高雄市政府、交通部公路局
- URL: https://www.freeway.gov.tw/Publish.aspx?cnid=2989 (main; per-event url in data)
- Years covered: 1974–2024 events
- Unit: event list keyed by year; counties = today's 22 county/city names affected
- Gaps / notes: Counties use current names (e.g. 臺南市 incl. former 臺南縣). 國道1號 intermediate sections 1974–78 not dated (only first section and full line). 南迴鐵路 1992-10 from CNA, not verified on an official page (url null). 臺北捷運 土城線(2006)/內湖線(2009) not verified, omitted. 花東線鐵路雙軌/電氣化(2014) not found officially, omitted. Pre-1974 items (縱貫公路, 中橫 1960, 十大建設 dates other than above) not collected. metro.taipei and thsrc/railway sites blocked; metro dates taken from metro.taipei 大事紀 via search result text.

### universities_by_county
- Agency / publication: 教育部統計處 縣市教育統計指標 — 各縣市大專校院概況統計 (cityu)
- URL: https://stats.moe.gov.tw/files/city/99/99cityu.xls ; https://stats.moe.gov.tw/files/city/105/105cityu.xls ; https://stats.moe.gov.tw/files/city/114/114cityu.xlsx
- Years covered: 2010, 2016, 2025
- Unit: schools (所) by location of main campus; students (人) counting all at main campus
- Gaps / notes: Academic years 99/105/114 = 2010/2016/2025. 2010 file uses 桃園縣 (now 桃園市) and already-merged 2010 municipalities. 連江縣 has none. Pre-2010 county breakdown not available online in this table series; first-university founding year per county not derivable from official statistics (gap). Counts include universities, colleges, junior colleges; branch campuses in other counties are not counted separately.

### senior_high_schools_by_county
- Agency / publication: 教育部統計處 縣市教育統計指標 — 高級中等學校概況統計按縣市別分 (cityh)
- URL: https://stats.moe.gov.tw/files/city/99/99cityh.xls ; https://stats.moe.gov.tw/files/city/105/105cityh.xls ; https://stats.moe.gov.tw/files/city/114/114cityh.xlsx
- Years covered: 2010, 2016, 2025
- Unit: schools (所)
- Gaps / notes: 2010 = 高中+高職 combined as published; from 2014 (十二年國教) 高級中等學校 definition (incl. 進修部-only schools in some years). Pre-2010 county counts not available online in this series (gap).

### remote_area_schools_by_county
- Agency / publication: 教育部統計處 114學年度偏遠地區學校名錄 (國民中小學本校、高級中等學校、中等以下學校分校分班)
- URL: https://stats.moe.gov.tw/files/school/114/faraway_new.xls
- Years covered: 2025
- Unit: school count by level; suffix _偏遠/_特偏/_極偏 = 地區屬性; branch_ = 分校分班
- Gaps / notes: Single year (114學年 = 2025). Classification per 偏遠地區學校教育發展條例 (2017+); earlier years used different definitions. Counties absent have no listed remote schools.

### urbanization
- Agency / publication: 內政部 內政統計查詢網: 土地面積、人口密度、戶數及戶量按縣市別 (c0110101); 都市計畫區現況人口 (c0810201)
- URL: https://statis.moi.gov.tw/micst/webMain.aspx?sys=220&funid=c0110101 ; https://statis.moi.gov.tw/micst/webMain.aspx?sys=220&funid=c0810201
- Years covered: density/pop/household size 1990,1996,2001,2006,2011,2016,2021,2025; urban-plan share 1997,2001,2006,2011,2016,2021,2025
- Unit: density 人/km²; population 人; household_size 人/戶; urban_plan_pop_share % of county population living in 都市計畫區 (現況人口)
- Gaps / notes: Snapshots only (full annual series in MOI database: density 1990–2025, urban-plan 1997–2025). Column labels as published: pre-merger units appear as 臺北縣, 桃園縣(103年改制前), 臺中縣/臺中市(99年改制前), 臺南縣/臺南市(99年改制前), 高雄縣/高雄市(99年改制前); MOI back-fills some current-name columns. 區域別總計 = whole country. No MOI county density before 1990 in this query system (gap; RIS has county population from 1974 but area changed 1982 when 新竹市/嘉義市 were split). Urban-plan share is a proxy for urban share; it is computed as 都市計畫區現況人口 ÷ registered county population, so it can exceed 100 (連江縣 2025 = 102.7) because planning-area population counts are not the household register. 都市化程度 official classification not used.

## occupations

| Table | Agency / publication | URL | Years | Gaps / caveats |
|---|---|---|---|---|
| by_occupation | 勞動部 職類別薪資調查報告 110年 表3 受僱員工人數、每人每月薪資—按職類別分 (263 職類) | https://statdb.mol.gov.tw/html/svy10/1035all.pdf | 2021 (July) | 工業及服務業受僱員工；不含公務員、自營作業者。7 月總薪資含當月分紅，電子、半導體等職類偏高。沒有年資分組；遊戲的年資曲線是估算。更早年份假設各職類相對平均的倍數不變。 |

## family

Fetched 2026-10-17. RIS tables via the same 快速下載 POST as births; DGBAS/CBC/MOHW CSVs via data.gov.tw (stat/dgbas hosts need the TWCA intermediates appended to the CA bundle).

| Table | Agency / publication / table | Code / URL | Years | Gaps / caveats |
|---|---|---|---|---|
| married_divorce_rate | 戶政司 離婚/終止結婚對數、粗離婚率及有偶人口離婚率(按發生日期) | RIS y5s3 | 1947–2025 | Per 1000 married people, by sex. ≤1973 excludes Kinmen and Matsu |
| divorces_by_marriage_duration | 戶政司 離婚/終止結婚對數按結婚期間(按發生日期) | RIS y5s5 | 1988–2025 | Counts by years married (<1 … 30+); buckets sum to the total |
| married_divorce_rate_by_age | 戶政司 有偶人口離婚率按性別及5歲年齡組(按發生日期) | RIS y5s4 | 1975–2025 | Whole numbers before 1991; 55+ blank in early years |
| households_by_type, households_by_type_share | 主計總處 家庭收支調查 家戶狀況按家庭組織型態分 | data.gov.tw 27963 (ws.dgbas.gov.tw …/046-性別統計指標-家戶狀況按家庭組織型態分.csv) | 2001–2025 | 單親 counts one parent with unmarried children of any age (not only minors). Share is computed here |
| low_income | 衛福部統計處 歷年低收入戶及中低收入戶之戶數、人數 | data.gov.tw 160963; 2000 from mohw.gov.tw dl-63155 表9 | 2000, 2003–2024 | 2011-07 社會救助法 widened the threshold, so 2011+ is not comparable with earlier years |
| household_debt | 中央銀行 金融健全參考指標－家庭部門 | data.gov.tw 23853 (cbc.gov.tw FSI-家庭部門.csv) | 2002–2025 | Borrowing/GDP %, debt service/disposable income %, borrowing/disposable income (times, recent years only) |
| disability_share | 內政部統計通報 100年第49週、102年第24週 | ws.moi.gov.tw week10049_2.doc, week10224.doc | 2002, 2011, 2012 (+ 2012 by age) | 2002 derived from the 2012 notice ("較91年底提升1.1個百分點"). No series before 2001 |
