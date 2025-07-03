const axios = require('axios');

async function testAPI() {
  try {
    // 簡單的健康檢查
    const healthCheck = await axios.get('http://localhost:7723/api/health');
    console.log('✅ 後端服務運行正常:', healthCheck.data);
    
    // 測試前端服務
    const frontendCheck = await axios.get('http://localhost:5173');
    console.log('✅ 前端服務運行正常');
    
  } catch (error) {
    console.error('❌ 服務檢查失敗:', error.message);
  }
}

testAPI(); 