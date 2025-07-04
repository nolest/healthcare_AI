const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 测试患者登录和菜单页面API调用
async function testPatientMenuAPI() {
  try {
    console.log('🔐 测试患者登录...');
    
    // 1. 登录患者账号
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'p001',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    console.log('✅ 登录成功');
    console.log('用户信息:', JSON.stringify(loginResponse.data.user, null, 2));
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id; // 注意这里是 id，不是 userId
    
    console.log('🆔 用户ID:', userId);
    
    // 2. 测试获取未读诊断报告数量
    console.log('\n📊 测试获取未读诊断报告数量...');
    
    try {
      const unreadCountResponse = await axios.get(
        `${API_BASE_URL}/diagnosis-reports/patient/${userId}/unread-count`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ 未读诊断报告数量:', unreadCountResponse.data);
    } catch (error) {
      console.log('❌ 获取未读诊断报告数量失败:', error.response?.data || error.message);
    }
    
    // 3. 测试获取患者诊断报告
    console.log('\n📋 测试获取患者诊断报告...');
    
    try {
      const reportsResponse = await axios.get(
        `${API_BASE_URL}/diagnosis-reports/patient/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ 患者诊断报告:', reportsResponse.data.length, '条');
      if (reportsResponse.data.length > 0) {
        console.log('第一条报告:', JSON.stringify(reportsResponse.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ 获取患者诊断报告失败:', error.response?.data || error.message);
    }
    
    // 4. 测试获取患者测量诊断 (新的API)
    console.log('\n🩺 测试获取患者测量诊断...');
    
    try {
      const measurementDiagnosesResponse = await axios.get(
        `${API_BASE_URL}/measurement-diagnoses/patient/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ 患者测量诊断:', measurementDiagnosesResponse.data.length, '条');
      if (measurementDiagnosesResponse.data.length > 0) {
        console.log('第一条测量诊断:', JSON.stringify(measurementDiagnosesResponse.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ 获取患者测量诊断失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testPatientMenuAPI(); 