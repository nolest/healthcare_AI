const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

console.log('🚀 医疗 AI API 测试脚本');
console.log('========================');
console.log('请确保后端服务正在运行在', BASE_URL);
console.log('');

// 简单的测试函数
async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    const config = { headers };
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(url, config);
        break;
      case 'POST':
        response = await axios.post(url, data, config);
        break;
      case 'PATCH':
        response = await axios.patch(url, data, config);
        break;
      default:
        throw new Error('Unsupported method');
    }
    
    console.log(`✅ ${name} - 成功`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name} - 失败: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('开始 API 测试...\n');
  
  // 测试数据
  const testUser = {
    username: 'testpatient' + Date.now(),
    password: 'password123',
    fullName: '测试患者',
    email: `patient${Date.now()}@test.com`,
    role: 'patient'
  };
  
  const testDoctor = {
    username: 'testdoctor' + Date.now(),
    password: 'password123',
    fullName: '测试医生',
    email: `doctor${Date.now()}@test.com`,
    role: 'medical_staff',
    department: '内科'
  };

  // 1. 用户注册
  console.log('1. 用户注册测试');
  await testEndpoint('患者注册', 'POST', `${BASE_URL}/auth/register`, testUser);
  await testEndpoint('医生注册', 'POST', `${BASE_URL}/auth/register`, testDoctor);
  
  // 2. 用户登录
  console.log('\n2. 用户登录测试');
  const patientLogin = await testEndpoint('患者登录', 'POST', `${BASE_URL}/auth/login`, {
    username: testUser.username,
    password: testUser.password
  });
  
  const doctorLogin = await testEndpoint('医生登录', 'POST', `${BASE_URL}/auth/login`, {
    username: testDoctor.username,
    password: testDoctor.password
  });
  
  if (!patientLogin || !doctorLogin) {
    console.log('登录失败，停止测试');
    return;
  }
  
  const patientToken = patientLogin.access_token;
  const doctorToken = doctorLogin.access_token;
  const authHeaders = { Authorization: `Bearer ${patientToken}` };
  const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };
  
  // 3. 测量数据测试
  console.log('\n3. 测量数据测试');
  const measurementData = {
    systolic: 140,
    diastolic: 90,
    heartRate: 85,
    temperature: 37.2,
    oxygenSaturation: 98,
    notes: '测试数据'
  };
  
  const measurement = await testEndpoint('提交测量数据', 'POST', `${BASE_URL}/measurements`, measurementData, authHeaders);
  await testEndpoint('获取我的测量数据', 'GET', `${BASE_URL}/measurements/my`, null, authHeaders);
  await testEndpoint('医生获取所有测量数据', 'GET', `${BASE_URL}/measurements`, null, doctorHeaders);
  
  // 4. COVID 评估测试
  console.log('\n4. COVID 评估测试');
  const covidData = {
    symptoms: ['发热', '咳嗽'],
    exposureHistory: false,
    travelHistory: false,
    contactHistory: false,
    vaccinationStatus: 'fully_vaccinated'
  };
  
  await testEndpoint('创建 COVID 评估', 'POST', `${BASE_URL}/covid-assessments`, covidData, authHeaders);
  await testEndpoint('获取我的 COVID 评估', 'GET', `${BASE_URL}/covid-assessments/my`, null, authHeaders);
  
  // 5. 诊断测试（如果有测量数据）
  if (measurement && measurement._id) {
    console.log('\n5. 诊断测试');
    const diagnosisData = {
      measurementId: measurement._id,
      diagnosis: '测试诊断',
      treatment: '测试治疗方案'
    };
    
    await testEndpoint('创建诊断', 'POST', `${BASE_URL}/diagnoses`, diagnosisData, doctorHeaders);
  }
  
  // 6. 用户管理测试
  console.log('\n6. 用户管理测试');
  await testEndpoint('获取患者列表', 'GET', `${BASE_URL}/users/patients`, null, doctorHeaders);
  await testEndpoint('获取用户统计', 'GET', `${BASE_URL}/users/stats`, null, doctorHeaders);
  
  console.log('\n🎉 API 测试完成！');
}

runTests().catch(console.error); 