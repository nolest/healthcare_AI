const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testPatientData() {
  try {
    // 1. 先登录医护人员账号
    console.log('1. 登录医护人员账号...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'doctor123'
    });

    const token = loginResponse.data.access_token;
    console.log('登录成功，获取到token');

    // 2. 获取患者列表
    console.log('\n2. 获取患者列表...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/users/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const patients = patientsResponse.data;
    console.log(`找到 ${patients.length} 个患者`);

    if (patients.length > 0) {
      console.log('\n患者数据结构示例:');
      const firstPatient = patients[0];
      console.log('患者字段:', Object.keys(firstPatient));
      console.log('患者详细信息:', {
        _id: firstPatient._id,
        id: firstPatient.id,
        username: firstPatient.username,
        fullName: firstPatient.fullName,
        email: firstPatient.email,
        role: firstPatient.role
      });

      // 3. 测试用患者ID获取测量记录
      console.log('\n3. 测试获取患者测量记录...');
      try {
        const measurementsResponse = await axios.get(`${API_BASE_URL}/measurements/user/${firstPatient._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`患者 ${firstPatient.username} 有 ${measurementsResponse.data.length} 条测量记录`);
      } catch (error) {
        console.log('获取测量记录失败:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n✅ 患者数据测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
  }
}

testPatientData(); 