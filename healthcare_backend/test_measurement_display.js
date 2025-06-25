const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testMeasurementDisplay() {
  try {
    // 1. 登录医护人员账号
    console.log('1. 登录医护人员账号...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'doctor123'
    });

    const token = loginResponse.data.access_token;
    console.log('登录成功');

    // 2. 获取患者列表
    console.log('\n2. 获取患者列表...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/users/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const patients = patientsResponse.data;
    console.log(`找到 ${patients.length} 个患者`);

    if (patients.length === 0) {
      console.log('没有患者数据，创建测试患者...');
      // 这里可以添加创建测试患者的代码
      return;
    }

    const firstPatient = patients[0];
    console.log(`\n选择患者: ${firstPatient.username} (${firstPatient.fullName})`);

    // 3. 获取该患者的测量记录
    console.log('\n3. 获取患者测量记录...');
    const measurementsResponse = await axios.get(`${API_BASE_URL}/measurements/user/${firstPatient._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const measurements = measurementsResponse.data;
    console.log(`找到 ${measurements.length} 条测量记录`);

    if (measurements.length === 0) {
      console.log('该患者没有测量记录');
      
      // 4. 创建一条测试测量记录
      console.log('\n4. 创建测试测量记录...');
      
      // 先登录患者账号
      const patientLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: firstPatient.username,
        password: 'patient123' // 假设患者密码
      });

      const patientToken = patientLoginResponse.data.access_token;
      
      const testMeasurement = {
        systolic: 140,
        diastolic: 90,
        heartRate: 85,
        temperature: 37.1,
        oxygenSaturation: 98,
        measurementTime: new Date().toISOString(),
        notes: '测试测量记录'
      };

      const createResponse = await axios.post(`${API_BASE_URL}/measurements`, testMeasurement, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });

      console.log('创建测试测量记录成功:', createResponse.data);

      // 重新获取测量记录
      const newMeasurementsResponse = await axios.get(`${API_BASE_URL}/measurements/user/${firstPatient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMeasurements = newMeasurementsResponse.data;
      console.log(`\n现在有 ${newMeasurements.length} 条测量记录`);
      
      if (newMeasurements.length > 0) {
        console.log('\n测量记录示例:');
        const measurement = newMeasurements[0];
        console.log('字段:', Object.keys(measurement));
        console.log('详细数据:', {
          _id: measurement._id,
          systolic: measurement.systolic,
          diastolic: measurement.diastolic,
          heartRate: measurement.heartRate,
          temperature: measurement.temperature,
          oxygenSaturation: measurement.oxygenSaturation,
          bloodSugar: measurement.bloodSugar,
          isAbnormal: measurement.isAbnormal,
          abnormalReasons: measurement.abnormalReasons,
          measurementTime: measurement.measurementTime,
          createdAt: measurement.createdAt
        });
      }
    } else {
      console.log('\n测量记录示例:');
      const measurement = measurements[0];
      console.log('字段:', Object.keys(measurement));
      console.log('详细数据:', {
        _id: measurement._id,
        systolic: measurement.systolic,
        diastolic: measurement.diastolic,
        heartRate: measurement.heartRate,
        temperature: measurement.temperature,
        oxygenSaturation: measurement.oxygenSaturation,
        bloodSugar: measurement.bloodSugar,
        isAbnormal: measurement.isAbnormal,
        abnormalReasons: measurement.abnormalReasons,
        measurementTime: measurement.measurementTime,
        createdAt: measurement.createdAt
      });
    }

    console.log('\n✅ 测量数据显示测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('认证失败，请检查用户凭据');
    }
  }
}

testMeasurementDisplay(); 