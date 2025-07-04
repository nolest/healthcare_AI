const axios = require('axios');

const API_BASE = 'http://localhost:7723/api';

// 测试用户登录
async function testLogin() {
  try {
    console.log('🔐 测试患者登录...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'p001',
      password: '123456'
    });
    
    console.log('✅ 登录成功:', response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取用户信息
async function testGetProfile(token) {
  try {
    console.log('\n👤 获取用户信息...');
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ 用户信息:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取普通诊断记录
async function testGetMeasurementDiagnoses(token, userId) {
  try {
    console.log('\n🩺 测试获取普通诊断记录...');
    const response = await axios.get(`${API_BASE}/measurement-diagnoses/patient/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ 普通诊断记录:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 获取普通诊断记录失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取COVID诊断记录
async function testGetCovidDiagnoses(token, userId) {
  try {
    console.log('\n🦠 测试获取COVID诊断记录...');
    console.log('请求URL:', `${API_BASE}/covid-diagnoses/patient/${userId}`);
    console.log('患者ID:', userId);
    
    const response = await axios.get(`${API_BASE}/covid-diagnoses/patient/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ COVID诊断记录响应状态:', response.status);
    console.log('✅ COVID诊断记录响应头:', response.headers['content-type']);
    console.log('✅ COVID诊断记录响应数据:', response.data);
    
    if (Array.isArray(response.data)) {
      console.log('📊 COVID诊断记录数量:', response.data.length);
      if (response.data.length > 0) {
        console.log('📝 第一条记录:', JSON.stringify(response.data[0], null, 2));
      }
    } else {
      console.log('⚠️ 响应不是数组格式:', typeof response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 获取COVID诊断记录失败:', error.response?.status, error.response?.statusText);
    console.error('❌ 错误详情:', error.response?.data || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试诊断API...\n');
  
  // 1. 登录
  const token = await testLogin();
  if (!token) {
    console.log('❌ 无法获取token，测试终止');
    return;
  }
  
  // 2. 获取用户信息
  const userResponse = await testGetProfile(token);
  if (!userResponse) {
    console.log('❌ 无法获取用户信息，测试终止');
    return;
  }
  
  const user = userResponse.user || userResponse;
  const userId = user._id || user.id;
  console.log('🔍 完整用户信息:', user);
  console.log('🔍 使用用户ID:', userId);
  
  if (!userId) {
    console.log('❌ 无法获取用户ID，测试终止');
    return;
  }
  
  // 3. 测试获取诊断记录
  await testGetMeasurementDiagnoses(token, userId);
  await testGetCovidDiagnoses(token, userId);
  
  console.log('\n🎉 测试完成！');
}

runTests().catch(console.error); 