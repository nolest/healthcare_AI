#!/bin/bash

# Remote Health Care System - 快速啟動腳本

echo "🏥 Remote Health Care System - 快速啟動"
echo "========================================"

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: Node.js 未安裝"
    echo "請先安裝 Node.js (https://nodejs.org/)"
    exit 1
fi

# 檢查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  警告: Node.js 版本過低 (當前: $(node -v), 需要: v18+)"
    echo "建議升級到最新版本"
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"

# 進入項目目錄
cd healthcare_frontend

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 安裝項目依賴..."
    echo "注意: 首次運行需要下載依賴包，可能需要幾分鐘時間"
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        echo "請檢查網絡連接或嘗試使用 npm cache clean --force"
        exit 1
    fi
    echo "✅ 依賴安裝完成"
else
    echo "✅ 依賴已安裝"
fi

echo ""
echo "🚀 啟動開發服務器..."
echo "服務器將在 http://localhost:5173 啟動"
echo ""
echo "測試賬戶:"
echo "  患者: patient001 / password123"
echo "  醫護: doctor001 / password123"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

# 啟動開發服務器
npm run dev

