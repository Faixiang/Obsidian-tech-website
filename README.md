# 曜石 OBSIDIAN — 企業官網

**CIS222 Web Design and Development · Group Project**
虛擬企業官網，E-Commerce 型網站

| | |
|---|---|
| **品牌** | 曜石（OBSIDIAN） |
| **全稱** | 曜石智能科技有限公司 · OBSIDIAN Technologies |
| **線上展示** | https://faixiang.github.io/obsidian-tech-website/ |
| **倉庫** | https://github.com/Faixiang/obsidian-tech-website |
| **截止日期** | 2026-12-20 23:59 |

---

## 概覽

一個虛構的物聯網硬件企業官網，三條產品線（環境感測終端 S1、智能網關 G2、能耗管理套件 E3）。

網站為純靜態實現：原生 HTML5 + CSS3 + JavaScript，無框架、無後端、無外部依賴。
所有資料存於瀏覽器 `localStorage`，可完整走通「瀏覽 → 加入採購單 → 結算 → 訂單確認」的流程。

**16 個頁面，導航無死鏈。**

---

## 頁面結構

| 層級 | 頁面 |
|---|---|
| 一級 | `index` |
| 二級 | `about` `products` `services` `support` `news` `contact` `careers` |
| 三級 | `product-detail` |
| 功能頁 | `login` `register` `register-done` `cart` `order-confirm` `sitemap` `404` |

---

## 互動功能

| 組件 | 位置 | 說明 |
|---|---|---|
| **漢堡菜單** | 全站 header（≤ 960px） | 點擊展開全屏抽屜，鎖定背景滾動，`Esc` 與點擊遮罩可關閉 |
| **手風琴** | `support.html` 常見問題 | 六條 FAQ，單開模式，`aria-expanded` / `hidden` / `aria-controls` 三態同步 |
| **圖片輪播** | `index.html` 首屏 | 三幀自動切換（4 秒），圓點與左右鍵可控，懸停暫停，尊重 `prefers-reduced-motion` |
| **圖片懸停** | `products.html` 產品卡 | 純 CSS，鼠標移入放大 1.06 倍並顯示青色描邊 |
| **浮動導航** | 全站（≥ 1536px） | 右側固定欄，上半為頁面導航，下半為當前頁章節錨點，滾動時自動高亮 |
| **進場動畫** | 全站 | `IntersectionObserver` 觸發，元素進入視口時由模糊轉清晰並上浮 16px |

浮動導航為漸進增強實現：由 JavaScript 從既有導航克隆生成，
**腳本失效時自動回退為 header 橫排導航**，不會出現「整站無導航」。

---

## 功能鏈路

**會員註冊**
```
register.html → 校驗 + 寫入 localStorage → register-done.html 回顯資料
```

**購買流程**
```
product-detail.html?code=S1|G2|E3 → 加入採購單 → cart.html
        → 結算校驗 + 寫入 localStorage → order-confirm.html 回顯訂單
```

**身分切換**
```
login.html → 寫入會話 → 全站導航顯示身分
```

---

## 設計系統

全站視覺由 CSS 變量統一管理，改主題只需改變量值，無需改動組件樣式。

```css
/* 五級深色縱深 */
--night: #02020A;   --deep: #0B1F3A;    --slate: #16294A;
--graphite: #1C2530; --metal: #1E2A44;

/* 雙強調色 */
--cyan: #00D4B8;    /* 主鏈路 */
--purple: #7B2FFF;  /* 創新線 */
```

**顏色變體由腳本生成。** CSS 中的文字色變體全部由 `docs/contrast.py` 按 WCAG 2.1
公式自動求解——保持品牌色相不變，僅沿亮度軸調整至達標。

```bash
python docs/contrast.py
```

修改色值請重跑腳本，**不要手動改 CSS 中的顏色變量**。

### 標誌

`assets/img/logo.svg` 為純向量，含中英文雙行字標與六角水晶圖形。
字標由字型輪廓轉為路徑，**不依賴任何字型檔**，在任何系統上渲染一致。

---

## 技術實現

| 項目 | 說明 |
|---|---|
| 框架 | 無。原生 HTML5 + CSS3 + JavaScript（ES5 語法，無構建步驟） |
| 後端 | 無。資料存於 `localStorage` |
| 外部資源 | 僅 Google Fonts（帶系統字體回退），其餘全部本地化 |
| 支付 | 無。購物車為流程演示，不接入支付網關，不索取支付資訊 |
| 無障礙 | 語義標籤、`aria-*` 狀態同步、鍵盤可達、`prefers-reduced-motion` 支持 |

### 規模

```
HTML   16 個頁面
CSS    3,667 行
JS     1,776 行（main 1,176 / auth 312 / cart 288）
素材   6 個手寫 SVG
```

### 前端校驗 ≠ 安全

本專案的表單校驗在瀏覽器端運行，**任何客戶端校驗都可被繞過**。
真實的登入、註冊、訂單必須由後端校驗，密碼須加鹽雜湊儲存，全程 HTTPS 傳輸。

---

## 目錄結構

```
Group Project/
├── index.html                首頁
├── about.html                關於我們
├── products.html             產品與服務
├── product-detail.html       產品詳情（按 ?code= 切換型號）
├── services.html             服務方案
├── contact.html              聯繫我們
├── support.html              技術支持
├── news.html                 企業動態
├── careers.html              加入我們
├── login.html                員工 / 客戶登入
├── register.html             會員註冊
├── register-done.html        註冊結果展示
├── cart.html                 購物車
├── order-confirm.html        訂單確認展示
├── sitemap.html              站點地圖
├── 404.html                  錯誤頁
│
├── assets/
│   ├── css/style.css         全站設計系統（CSS 變量統一令牌）
│   ├── js/
│   │   ├── main.js           導航 / 浮動導航 / 輪播 / 手風琴 / 進場動畫
│   │   ├── auth.js           會話 / 表單校驗 / 跨頁數據
│   │   └── cart.js           購物車 / 訂單
│   └── img/                  手寫 SVG（標誌、產品圖、拓撲圖）
│
├── docs/
│   ├── 验收清单.md            逐項自檢表 + 對比度求解結果
│   ├── 报告大纲.md            2000 字報告框架
│   ├── 網頁策劃.md            頁面規劃與資訊架構
│   ├── contrast.py           WCAG 對比度自動求解器
│   ├── logo-obsidian-v3-stacked.svg
│   └── screenshots/          各階段驗收截圖
│
├── CIS222_CIS282_Group_Project_计划书.md
├── 康陶集团官网_视觉与交互复刻设计参数报告.md
├── 曜石智能科技_品牌规范与项目方案_V1.1.1.md
├── .gitignore
└── README.md
```

---

## 本地運行

**直接雙擊 `index.html`** 即可瀏覽，無需伺服器、無需安裝依賴。

如需本地伺服器（推薦，便於開發者工具除錯）：

```bash
python -m http.server 8000
# 或
npx serve .
```

然後訪問 `http://localhost:8000`。

---

## 文檔

| 文件 | 內容 |
|---|---|
| `曜石智能科技_品牌规范与项目方案_V1.1.1.md` | 視覺規範：色板、字階、間距、組件、對比度 |
| `康陶集团官网_视觉与交互复刻设计参数报告.md` | 版式硬參數參考 |
| `CIS222_CIS282_Group_Project_计划书.md` | 專案計劃與技術決策 |
| `docs/验收清单.md` | 逐項自檢表 |
| `docs/报告大纲.md` | 書面報告框架 |

---

## 已知限制

- **無後端**：所有資料存於 `localStorage`，清除瀏覽器數據即丟失，換裝置不同步
- **無支付**：購物車為流程演示
- **浮動導航僅 ≥ 1536px 顯示**：低於此寬度回退為 header 橫排導航，避免遮擋內容
- **字體依賴 CDN**：Google Fonts 不可用時回退至系統字體，版面可能略有差異

---

*CIS222 Web Design and Development · Group Project*
