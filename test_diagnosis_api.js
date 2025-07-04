const axios = require('axios');

const API_BASE_URL = 'http://localhost:7723/api';

async function testLogin() {
  try {
    console.log(' 测试用户登录...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'patient001',
      password: '123456'
    });
    
    console.log(' 登录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error(' 登录失败:', error.response?.data || error.message);
    return null;
  }
}

async function testMeasurementDiagnoses(token, userId) {
  try {
    console.log(` 测试测量诊断API (用户ID: ${userId})...`);
    const response = await axios.get(`${API_BASE_URL}/diagnoses/patient/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(' 测量诊断API成功:', response.data);
    return response.data;
  } catch (error) {
    console.error(' 测量诊断API失败:', error.response?.data || error.message);
    return null;
  }
}

async function testCovidDiagnoses(token, userId) {
  try {
    console.log(` 测试COVID诊断API (用户ID: ${userId})...`);
    const response = await axios.get(`${API_BASE_URL}/covid-diagnoses/patient/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(' COVID诊断API成功:', response.data);
    return response.data;
  } catch (error) {
    console.error(' COVID诊断API失败:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log(' 开始API测试...\n');
  
  const loginResult = await testLogin();
  if (!loginResult || !loginResult.success) {
    console.log(' 登录失败，无法继续测试');
    return;
  }
  
  const token = loginResult.access_token;
  const userId = loginResult.user.id || loginResult.user.userId;
  
  console.log(`\n 获取到的用户信息:`);
  console.log(`- ID: ${userId}`);
  console.log(`- 用户名: ${loginResult.user.username}`);
  console.log(`- 角色: ${loginResult.user.role}`);
  
  console.log('\n 测试测量诊断API...');
  await testMeasurementDiagnoses(token, userId);
  
  console.log('\n 测试COVID诊断API...');
  await testCovidDiagnoses(token, userId);
  
  console.log('\n 所有测试完成！');
}

runTests().catch(console.error);
