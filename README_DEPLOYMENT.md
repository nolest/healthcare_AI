# Remote Health Care System - 本地部署指南

## 📋 項目概述

Remote Health Care System 是一個智能診斷點遠程醫療服務系統，支持患者自主測量生命體徵，並由專業醫護人員進行遠程評估和診斷。

## 🛠️ 系統要求

### 必需軟件
- **Node.js**: 版本 18.0 或更高
- **npm**: 版本 8.0 或更高（通常隨 Node.js 安裝）
- **Git**: 用於版本控制（可選）

### 推薦開發環境
- **操作系統**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **瀏覽器**: Chrome 90+, Firefox 88+, Safari 14+
- **代碼編輯器**: VS Code, WebStorm, 或其他現代編輯器

## 🚀 快速開始

### 1. 安裝依賴
```bash
cd healthcare_frontend
npm install
```

**注意**: 項目不包含 node_modules 文件夾，首次運行必須執行此步驟。

### 2. 啟動開發服務器
```bash
npm run dev
```

開發服務器將在 `http://localhost:5173` 啟動

### 3. 構建生產版本
```bash
npm run build
```

構建文件將生成在 `dist/` 目錄中

### 4. 預覽生產版本
```bash
npm run preview
```

## 📁 項目結構

```
healthcare_frontend/
├── public/                 # 靜態資源
├── src/                   # 源代碼
│   ├── components/        # React 組件
│   │   ├── ui/           # UI 基礎組件
│   │   ├── LoginForm.jsx # 登錄表單
│   │   ├── RegisterForm.jsx # 註冊表單
│   │   ├── MedicalStaffDashboard.jsx # 醫護人員控制台
│   │   ├── PatientDashboard.jsx # 患者控制台
│   │   ├── CovidFluAssessment.jsx # COVID/流感評估
│   │   ├── DiagnosisForm.jsx # 診斷表單
│   │   ├── TestingIsolationGuidance.jsx # 指導建議
│   │   └── PatientCovidAssessments.jsx # 患者評估記錄
│   ├── utils/            # 工具函數
│   │   └── mockDataStore.js # 數據存儲管理
│   ├── App.jsx           # 主應用組件
│   ├── main.jsx          # 應用入口
│   └── index.css         # 全局樣式
├── package.json          # 項目配置
├── vite.config.js        # Vite 配置
└── README.md            # 項目說明
```

## 🔧 配置說明

### 依賴說明
- **React 18**: 前端框架
- **Vite**: 構建工具
- **Tailwind CSS**: CSS 框架
- **Lucide React**: 圖標庫
- **Radix UI**: UI 組件庫

### Vite 配置 (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 👥 用戶賬戶

### 預設測試賬戶
- **患者賬戶**: patient001 / password123
- **醫護人員賬戶**: doctor001 / password123

### 註冊新賬戶
系統支持用戶註冊功能：
1. 點擊登錄頁面的"註冊"標籤
2. 填寫完整的註冊表單
3. 選擇用戶角色（患者或醫護人員）
4. 註冊成功後自動登錄

## 🏥 功能模塊

### 患者功能
- **概覽**: 查看個人健康數據概覽
- **新測量**: 記錄生命體徵測量
- **歷史記錄**: 查看測量歷史
- **診斷報告**: 查看醫護人員診斷
- **COVID/流感評估**: 進行症狀自評
- **症狀追蹤**: 記錄症狀變化

### 醫護人員功能
- **概覽**: 查看患者統計和風險分布
- **待處理**: 查看需要處理的患者
- **患者管理**: 管理患者信息
- **診斷評估**: 進行患者診斷
- **COVID/流感管理**: 查看患者評估記錄
- **指導建議**: 提供專業指導

## 🔒 數據存儲

系統使用 localStorage 進行本地數據存儲：
- 用戶認證信息
- 患者測量數據
- 診斷記錄
- COVID 評估結果

## 🌐 部署到生產環境

### 靜態網站部署
1. 運行 `npm run build`
2. 將 `dist/` 目錄內容上傳到 Web 服務器
3. 配置服務器支持 SPA 路由

### 推薦部署平台
- **Vercel**: 零配置部署
- **Netlify**: 靜態網站託管
- **GitHub Pages**: 免費託管
- **AWS S3 + CloudFront**: 企業級部署

## 🐛 故障排除

### 常見問題

**1. 依賴安裝失敗**
```bash
# 清除 npm 緩存
npm cache clean --force
# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install
```

**2. 開發服務器無法啟動**
- 檢查 Node.js 版本是否符合要求
- 確保端口 5173 未被占用
- 檢查防火牆設置

**3. 構建失敗**
- 檢查代碼語法錯誤
- 確保所有依賴已正確安裝
- 檢查 Vite 配置文件

**4. 數據不同步**
- 清除瀏覽器 localStorage
- 檢查瀏覽器控制台錯誤
- 確保使用相同域名訪問

## 🔄 自定義修改

### 移除測試賬戶顯示
如需移除登錄頁面的測試賬戶信息顯示，可以編輯 `src/App.jsx` 文件，找到並刪除測試賬戶相關的 JSX 代碼。

### 修改樣式
- 全局樣式：編輯 `src/index.css`
- 組件樣式：使用 Tailwind CSS 類名
- 自定義組件：在 `src/components/` 目錄下添加

### 添加新功能
1. 在 `src/components/` 創建新組件
2. 在 `src/utils/mockDataStore.js` 添加數據管理方法
3. 在相應的控制台組件中集成新功能

## 📞 技術支持

如遇到技術問題，請檢查：
1. 瀏覽器控制台錯誤信息
2. 網絡連接狀態
3. 依賴版本兼容性

## 📝 開發注意事項

### 代碼規範
- 使用 ES6+ 語法
- 組件採用函數式寫法
- 使用 Tailwind CSS 進行樣式設計
- 保持代碼簡潔和可讀性

### 性能優化
- 使用 React.memo 優化組件渲染
- 合理使用 useCallback 和 useMemo
- 圖片資源進行壓縮優化
- 代碼分割和懶加載

---

**Remote Health Care System** - 智能診斷點遠程醫療服務

