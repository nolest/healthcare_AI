const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testDiagnosisAPI() {
  try {
    // 1. 先登录医护人员账号
    console.log('1. 登录医护人员账号...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'doctor123'
    });

    const token = loginResponse.data.access_token;
    console.log('登录成功，获取到token');

    // 2. 获取测量记录
    console.log('\n2. 获取测量记录...');
    const measurementsResponse = await axios.get(`${API_BASE_URL}/measurements`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const measurements = measurementsResponse.data;
    console.log(`找到 ${measurements.length} 条测量记录`);

    if (measurements.length === 0) {
      console.log('没有测量记录，无法测试诊断API');
      return;
    }

    const firstMeasurement = measurements[0];
    console.log('第一条测量记录:', {
      id: firstMeasurement._id,
      userId: firstMeasurement.userId,
      systolic: firstMeasurement.systolic,
      diastolic: firstMeasurement.diastolic
    });

    // 3. 创建诊断记录
    console.log('\n3. 创建诊断记录...');
    const diagnosisData = {
      measurementId: firstMeasurement._id,
      diagnosis: '血压偏高，建议注意饮食和运动',
      treatment: '定期监测血压；保持适量运动；注意饮食均衡',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
      notes: '風險等級: medium；需要後續追蹤'
    };

    console.log('发送诊断数据:', diagnosisData);

    const diagnosisResponse = await axios.post(`${API_BASE_URL}/diagnoses`, diagnosisData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('诊断记录创建成功:', {
      id: diagnosisResponse.data._id,
      patientId: diagnosisResponse.data.patientId,
      diagnosis: diagnosisResponse.data.diagnosis,
      treatment: diagnosisResponse.data.treatment
    });

    // 4. 验证诊断记录
    console.log('\n4. 验证诊断记录...');
    const allDiagnosesResponse = await axios.get(`${API_BASE_URL}/diagnoses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`总共有 ${allDiagnosesResponse.data.length} 条诊断记录`);

    console.log('\n✅ 诊断API测试成功！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('详细错误信息:', error.response.data.message);
    }
  }
}

testDiagnosisAPI(); 