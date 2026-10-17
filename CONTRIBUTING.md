# 開發說明：檔案分工、建置、平行開發

上線的遊戲還是一個 `index.html`（GitHub Pages 只發布這個檔），但它是**建置出來的**。程式寫在 `src/` 底下的許多小檔案，用 `tools/build.py` 依序接成 `index.html`。

**不要直接改 `index.html`。** 改 `src/`、`content/` 或 `data/`，然後重建。

## 建置

```sh
python3 tools/build.py           # 把 content/、data/stats/ 轉成 src/data/*.js，再把 src/ 接成 index.html
python3 tools/build.py --check   # index.html 跟 src/ 建出來的不一樣就失敗（部署前會跑）
```

`src/page.html` 是網頁骨架，裡面一行 `//@include 路徑` 或 `/*@include 路徑*/` 就會被換成那個檔案的內容。**include 的順序就是程式執行的順序。**改 `src/` 和重建後的 `index.html` 要放在同一個 commit。

## 檔案分工

| 檔案 | 負責什麼 |
|---|---|
| `src/page.html` | 網頁骨架（HTML 版面）和所有檔案的載入順序 |
| `src/css/style.css` | 全部樣式 |
| **engine/ 人生計算** | |
| `engine/util.js` | 亂數、`pick`、`chance`、`fx` 等小工具 |
| `engine/world.js` | 各縣市、族群、職業的粗略統計 |
| `engine/character.js` | `newLife`：出生年 → 出生地 → 族群 → 性別 → 家境 |
| `engine/reactions.js` | 依年紀、個性寫反應句的工具 |
| `engine/milestones.js` | 人生關卡（上學、升學、當兵、工作、結婚、買房等，含選擇） |
| `engine/mortality.js` | 死亡與死因 |
| `engine/mood.js` | 心境：家境 × 個性 × 社會氣氛（之後的心情值、憂鬱症放這裡） |
| `engine/reasons.js` | 選項的兩個標籤：身邊的人怎麼說、個性會不會 |
| `engine/people.js` | 身邊的人（名字、各自的人生）、`autoChoose`、`doChoice` |
| `engine/scars.js`、`engine/habits.js` | 舊事件留下的影響、一輩子掛在嘴邊的話 |
| `engine/cohort.js` | 你這一屆：出生時跟同年孩子比、日記裡「那一年」的官方數字、結局的「你這一屆」表（資料在 `src/data/off.js`） |
| `engine/money.js` | 存款、家產、房價、房貸 |
| `engine/consistency.js` | 前後矛盾的守門員 |
| `engine/age-limits.js` | 未成年騎車、抽菸、喝酒的年代規則 |
| `engine/regrets.js`、`engine/satisfactions.js` | 結局的後悔的事、滿意的事 |
| `engine/era-effort.js` | 同樣的選擇在不同年代結果不同 |
| `engine/step.js` | 每個月的主迴圈 `step` 和每年一次的 `yearly` |
| `engine/diary-filters.js` | 最外層的日記過濾：補日期、去重複、公教用語、朋友介紹（必須是最後一個包 `step` 的檔案） |
| **events/ 各類事件** | |
| `events/history.js` | 歷史事件時間軸 |
| `events/random.js`、`events/variety.js` | 一般隨機事件、依背景變化的版本 |
| `events/work.js`、`events/region.js` | 各職業、各地區的日常 |
| `events/early-childhood.js`、`events/romance.js` | 0–6 歲、交往過程 |
| `events/lens.js`、`events/takeaways.js` | 共同事件的在地版本、個性收穫 |
| `events/history-variants.js` | 歷史事件的個性版本（content/history_variants.json 等） |
| `events/partners.js`、`events/affair.js` | 對象、婆家、外遇 |
| `events/sexuality.js`、`events/same-sex-text.js` | 同志路線、同性伴侶的文字過濾 |
| `events/fun-danger.js` | 好笑小事、差點死掉、死因場景、年代危險選擇 |
| `events/kin.js`、`events/ethnic.js` | 親戚建議、族群事件 |
| `events/generations.js`、`events/tech.js`、`events/popculture.js` | 同一刻其他世代、科技、流行物 |
| `events/abroad.js` | 住在國外 |
| **ui/ 畫面** | |
| `ui/play.js` | 遊戲畫面：日記、選擇視窗、左側現況、快轉 |
| `ui/summary.js`、`ui/cohort-table.js` | 結局頁、後悔的事 |
| `ui/share.js` | 分享用直式圖 |
| `ui/glossary.js` | 年代用語小解釋 |
| `ui/map.js` | 足跡地圖 |
| `ui/scene.js` | 日記上方的像素小圖 |
| `ui/wiring.js` | 按鈕與鍵盤綁定、啟動 |
| **data/ 產生的資料（不要手改）** | |
| `src/data/*.js` | 由 `tools/build.py` 從 `content/*.json`、`data/stats/` 產生（`off.js` 是結局「你這一屆」用的官方統計）；`map.js` 由 `tools/build_map.py` 產生；`hv.js` 是空的佔位 |

文字內容（事件句子、選項）放在 `content/*.json`，格式見 [content/FORMAT.md](content/FORMAT.md)。

## 平行開發規則

1. **一個串負責一組檔案。**開工前在串裡說要改哪些檔案；別的串正在改的檔案，先跟那個串（或透過協調）講好再動。
2. **新功能盡量開新檔案**，在 `src/page.html` 適當的位置加一行 include。很多功能是用「包住舊函式」的方式加上去的（`{const s0=step;step=function(s){...}}`），所以位置很重要：
   - 改人生計算的放在 `engine/step.js` 之後、`engine/diary-filters.js` 之前
   - `engine/diary-filters.js` 永遠是最後一個包 `step` 的
   - 畫面相關的放在 `ui/` 底下
3. **`index.html` 合併衝突不要手動解。**直接選任一邊，然後跑 `python3 tools/build.py` 重建再 commit。
4. **只搬程式、不改行為的修改**（重構、拆檔）必須通過逐行比對：
   ```sh
   git show origin/main:index.html > /tmp/before.html
   PW=... node tests/same_output.js /tmp/before.html index.html 60
   ```
   它用固定亂數種子跑同樣的 60 生，每一行日記和結局頁都要一樣。
5. **改行為的修改**要跑 `node tests/smoke.js` 和跟那個功能有關的測試（清單見 [README.md](README.md#修改流程)），再發 PR。一個 PR 只做一件事。
