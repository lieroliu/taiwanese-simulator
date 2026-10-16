# 台灣人生模擬（暫名）

以台灣為舞台的人生模擬網頁遊戲。玩家選擇一個**出生世代**，被隨機分配身分、家庭與出生地，從出生走到人生終點。重點不在數值，而在**角色每個階段的心境與遇到的處境**。

靈感來源：[1 in 8 Billion（80億分之1）](https://1in8b.life/)。原作比較的是「出生在哪個國家」，本作比較的是「出生在台灣的哪個年代、成為什麼樣的人」。

## 核心概念

- **五個出生世代**：五、六、七、八、九年級（民國年級，1961–2010）。戰後的經歷透過父母那一代呈現
- **身分軸會隨世代改變**：早期世代的人生差異主要來自族群與性別；後期世代則越來越取決於家庭所得與城鄉
- **統計決定發生什麼，文字呈現怎麼感受**：壽命、死因、升學率、所得等由公開統計抽樣；心境文字預先撰寫並經人工審稿
- **同一刻出生的其他人**：沿用原作設計，讓同世代、不同身分的角色並行，看見彼此人生的分岔

## 怎麼玩

線上版：<https://lieroliu.github.io/taiwanese-simulator/>（`main` 更新後自動部署）。也可以直接用瀏覽器打開 [index.html](index.html)。整個遊戲是一個單一 HTML 檔，不需要伺服器。輸入出生年（1961–2010），遊戲會依當年統計抽出出生地、性別、族群和家境，然後一個月一個月往下算，有事發生才停下來。

## 檔案結構

| 路徑 | 內容 |
|---|---|
| [index.html](index.html) | 可玩的原型，所有程式、資料和文字都內嵌在這一個檔案裡 |
| [data/stats/](data/stats/) | 官方統計資料（戶政、主計總處、衛福部、教育部等），來源見 [sources.md](data/stats/sources.md) |
| [content/](content/) | 文字內容：歷史事件的個性版本、0–6 歲事件、交往過程、族群專屬事件與共同事件的族群版本。格式見 [FORMAT.md](content/FORMAT.md) |
| [tools/build.py](tools/build.py) | 把 `data/stats/` 和 `content/` 重新嵌進 `index.html` |
| [tests/](tests/) | 用 Playwright 跑大量人生的自動檢查 |
| [docs/](docs/) | 設計文件與歷史事件清單 |

## 修改流程

1. 改 `content/*.json` 或 `data/stats/*.json`
2. `python3 tools/build.py`
3. 跑測試（需要 Playwright，`PW` 可指定 playwright 模組路徑）：
   - `node tests/smoke.js`：跑 1500 個人生，不能有錯誤
   - `node tests/consistency.js index.html 400`：抓年紀、父母、婚姻、孩子的前後矛盾，並輸出政治參與分布
   - `node tests/repetition.js`：同縣市、不同地區、不同族群（含新住民子女）的日記重複率
   - `node tests/cohort.js`：各世代的升學、結婚、生育、買房比例
   - `node tests/money.js`：各世代 30／45／65 歲的存款中位數
   - `node tests/share.js`：跑幾個人生到結局，檢查分享圖能產生 1080×1920 的圖
   - `node tests/testmode.js`：檢查測試模式（網址加 `?test=1`）能指定出生縣市、族群、性別和家境
   - `node tests/eras.js`：同樣家境、同樣個性的人，生在不同年級的差距（學歷、買房、存款、後悔的事）
   - `node tests/fun_content.js`：檢查好笑小事、差點死掉、死因場景和高風險選擇的內容格式
   - `node tests/fun.js`：跑很多人生，看好笑小事的比例、差點死掉的次數、高風險選擇出現和被選的次數，以及平均壽命
   - `node tests/classes.js`：國中能力分班（升學班、普通班、放牛班）在各年代、各家境的比例
   - `node tests/repeats.js`：同一生裡同一句話、同一個問題重複出現的次數
   - `node tests/age_rules.js`：未滿 16 歲不騎機車，16–17 歲偷騎會照當年的取締寫出有沒有被抓；未成年抽菸喝酒照當年法規
   - `node tests/kin_content.js`：親戚建議內容檢查；`node tests/kin.js`：每個人都有親戚的建議、填志願衝突怎麼選、轉系和重考的結果
   - `node tests/sexuality_content.js`：同志內容的格式、跟交往／外遇內容能不能用在同性伴侶，以及用簡化模型跑幾萬個人生，檢查同婚時間、同性伴侶不會自己懷孕、出櫃狀態不會倒退、家裡知道後不再安排相親

## 文件

| 文件 | 內容 |
|---|---|
| [docs/eras.md](docs/eras.md) | 世代 × 身分矩陣：關鍵事件、身分處境、心境主題 |
| [docs/data-sources.md](docs/data-sources.md) | 可用的台灣公開統計與口述歷史來源 |
| [docs/design-notes.md](docs/design-notes.md) | 架構選擇、敏感議題處理原則、待決問題 |
| [data/eras.json](data/eras.json) | 世代與身分的結構化資料（早期草稿） |
| [docs/historical-events.md](docs/historical-events.md) | 約 90 件歷史事件與觸發條件 |

## 目前進度

- [x] 概念與世代矩陣
- [x] 可玩的網頁原型：五到九年級（民國年級，1961–2010），出生條件依統計抽樣，逐月推進
- [x] 歷史事件依年代、地區、族群、個性產生不同的日記
- [x] 選項只是志向，成敗看當下的家境和社會條件
- [x] 交往、結婚、生育、買房、存款與家境、父母老去
- [x] 同一屆的人生對照
- [ ] 族群之間的差異還不夠明顯
- [ ] 分享用的直式結果圖
