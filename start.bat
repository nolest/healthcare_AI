@echo off
chcp 65001 >nul

echo 🏥 Remote Health Care System - 快速啟動
echo ========================================

REM 檢查 Node.js 是否安裝
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤: Node.js 未安裝
    echo 請先安裝 Node.js ^(https://nodejs.org/^)
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node -v
echo ✅ npm 版本: 
npm -v

REM 進入項目目錄
cd healthcare_frontend

REM 檢查是否已安裝依賴
if not exist "node_modules" (
    echo.
    echo 📦 安裝項目依賴...
    echo 注意: 首次運行需要下載依賴包，可能需要幾分鐘時間
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ 依賴安裝失敗
        echo 請檢查網絡連接或嘗試使用 npm cache clean --force
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
) else (
    echo ✅ 依賴已安裝
)

echo.
echo 🚀 啟動開發服務器...
echo 服務器將在 http://localhost:5173 啟動
echo.
echo 測試賬戶:
echo   患者: patient001 / password123
echo   醫護: doctor001 / password123
echo.
echo 按 Ctrl+C 停止服務器
echo.

REM 啟動開發服務器
npm run dev

pause

