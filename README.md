# Remote Health Care System

智能診斷點遠程醫療服務系統

## 🚀 快速開始

### 方法一：使用啟動腳本（推薦）

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

### 方法二：手動啟動

1. 安裝依賴：
```bash
cd healthcare_frontend
npm install
```

2. 啟動開發服務器：
```bash
npm run dev
```

3. 在瀏覽器中打開：http://localhost:5173

## 📋 測試賬戶

- **患者賬戶**: patient001 / password123
- **醫護人員賬戶**: doctor001 / password123

## 📚 詳細文檔

請查看 `README_DEPLOYMENT.md` 獲取完整的部署和開發指南。

## 🏗️ 構建生產版本

```bash
cd healthcare_frontend
npm run build
```

構建文件將生成在 `dist/` 目錄中。

## 🔧 系統要求

- Node.js 18.0+
- npm 8.0+
- 現代瀏覽器（Chrome 90+, Firefox 88+, Safari 14+）

## 📁 項目結構

```
healthcare_frontend/
├── public/                 # 靜態資源
├── src/                   # 源代碼
│   ├── components/        # React 組件
│   ├── utils/            # 工具函數
│   ├── App.jsx           # 主應用組件
│   └── main.jsx          # 應用入口
├── package.json          # 項目配置
└── vite.config.js        # Vite 配置
```

## 📞 支持

如遇問題，請檢查：
1. Node.js 版本是否符合要求
2. 網絡連接是否正常
3. 瀏覽器控制台是否有錯誤信息

## 📝 注意事項

- 首次運行需要執行 `npm install` 安裝依賴
- 項目不包含 node_modules 文件夾，需要自行安裝
- 開發服務器默認運行在 http://localhost:5173

