#!/bin/bash

echo "🚀 升級 Node.js 從 12.22.9 到 20.x"
echo "===================================="

# 檢查當前版本
echo "📊 當前 Node.js 版本："
node --version
npm --version

# 備份當前全域安裝的 npm 包列表
echo "💾 備份全域 npm 包列表..."
npm list -g --depth=0 > ~/npm-global-packages-backup.txt
echo "✅ 備份保存到: ~/npm-global-packages-backup.txt"

# 方法1：使用 NodeSource 官方倉庫升級（推薦）
echo "📦 添加 NodeSource 官方倉庫..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

echo "🔄 升級 Node.js 到 20.x..."
sudo apt-get install -y nodejs

# 檢查升級結果
echo "✅ 升級完成！新版本："
node --version
npm --version

# 檢查 npm 全域目錄權限
echo "🔧 修復 npm 全域目錄權限..."
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules

# 更新 npm 到最新版本
echo "📦 更新 npm 到最新版本..."
sudo npm install -g npm@latest

# 清理 npm 緩存
echo "🧹 清理 npm 緩存..."
npm cache clean --force

# 驗證安裝
echo "🧪 驗證安裝..."
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "npm 全域目錄: $(npm config get prefix)"

# 檢查是否需要重新安裝全域包
echo "📋 檢查全域 npm 包..."
if [ -f ~/npm-global-packages-backup.txt ]; then
    echo "之前安裝的全域包："
    cat ~/npm-global-packages-backup.txt
    echo ""
    echo "如需重新安裝全域包，請手動執行："
    echo "npm install -g <package-name>"
fi

echo ""
echo "🎉 Node.js 升級完成！"
echo "📋 版本信息："
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo ""
echo "⚠️  重要提醒："
echo "1. 請重新登錄終端或執行 'source ~/.bashrc' 確保環境變量生效"
echo "2. 如果遇到權限問題，請執行: sudo chown -R \$USER:\$USER ~/.npm"
echo "3. 現在可以重新運行部署腳本" 