#!/bin/bash

echo "🏥 測試醫療AI系統部署"
echo "========================="

# 測試前端頁面
echo "🌐 測試前端頁面..."
curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/
if [ $? -eq 0 ]; then
    echo "✅ 前端頁面可訪問"
else
    echo "❌ 前端頁面無法訪問"
fi

# 測試後端API健康檢查
echo "🔧 測試後端API健康檢查..."
curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/hcbe/health
if [ $? -eq 0 ]; then
    echo "✅ 後端API健康檢查通過"
else
    echo "❌ 後端API健康檢查失敗"
fi

# 測試MongoDB管理界面
echo "🗄️ 測試MongoDB管理界面..."
curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/db/
if [ $? -eq 0 ]; then
    echo "✅ MongoDB管理界面可訪問"
else
    echo "❌ MongoDB管理界面無法訪問"
fi

# 測試API登錄接口
echo "🔐 測試API登錄接口..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  http://43.143.141.188:6886/hcbe/auth/login
echo ""

# 檢查Docker容器狀態
echo "🐳 檢查Docker容器狀態..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎯 測試完成！"
echo "📋 訪問地址："
echo "   前端: http://43.143.141.188:6886/"
echo "   API: http://43.143.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.143.141.188:6886/db/"
echo ""
echo "🔑 默認賬戶："
echo "   管理員: admin / admin123"
echo "   醫生: doctor001 / doctor123"
echo "   患者: patient001 / patient123" 