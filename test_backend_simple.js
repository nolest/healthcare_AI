const http = require('http');

// 简单测试后端是否运行
function testBackend() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const postData = JSON.stringify({
    username: 'doctor002',
    password: '123456'
  });

  const req = http.request(options, (res) => {
    console.log(`✅ 后端服务运行中 - 状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ 登录成功，后端API正常工作');
          console.log('Token:', response.access_token ? '已获取' : '未获取');
        } else {
          console.log('⚠️ 登录失败:', response.message);
        }
      } catch (error) {
        console.error('❌ 响应解析失败:', error.message);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 后端服务未运行或连接失败:', error.message);
    console.log('请确保后端服务在 localhost:3000 上运行');
  });

  req.write(postData);
  req.end();
}

console.log('🔍 测试后端服务连接...');
testBackend(); 