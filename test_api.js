const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('🧪 开始测试后端API...');
    
    // 测试后端是否运行
    const healthCheck = await fetch(`${API_BASE}/`);
    console.log('🌐 后端健康检查状态:', healthCheck.status);
    
    if (healthCheck.status === 200) {
      console.log('✅ 后端服务正常运行');
    } else {
      console.log('❌ 后端服务可能未启动或有问题');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.log('💡 请确保后端服务已启动 (npm start)');
  }
}

testAPI(); 