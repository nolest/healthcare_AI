const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testSpecificPatient() {
  try {
    // 1. 登录医护人员账号
    console.log('1. 登录医护人员账号...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'doctor123'
    });

    const token = loginResponse.data.access_token;
    console.log('登录成功');

    // 2. 根据测量记录的userId查找患者
    const targetUserId = '685c3c147e21318b24b0c3a4';
    console.log(`\n2. 查找患者 ${targetUserId}...`);

    // 获取患者列表
    const patientsResponse = await axios.get(`${API_BASE_URL}/users/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const patients = patientsResponse.data;
    const targetPatient = patients.find(p => p._id === targetUserId);

    if (!targetPatient) {
      console.log('未找到目标患者，显示所有患者:');
      patients.forEach(p => {
        console.log(`- ${p._id}: ${p.username} (${p.fullName})`);
      });
      return;
    }

    console.log('找到目标患者:', {
      _id: targetPatient._id,
      username: targetPatient.username,
      fullName: targetPatient.fullName
    });

    // 3. 获取该患者的测量记录
    console.log('\n3. 获取患者测量记录...');
    const measurementsResponse = await axios.get(`${API_BASE_URL}/measurements/user/${targetUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const measurements = measurementsResponse.data;
    console.log(`找到 ${measurements.length} 条测量记录`);

    if (measurements.length > 0) {
      console.log('\n测量记录详情:');
      measurements.forEach((measurement, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  _id: ${measurement._id}`);
        console.log(`  userId: ${measurement.userId}`);
        console.log(`  收缩压: ${measurement.systolic || '未测量'}`);
        console.log(`  舒张压: ${measurement.diastolic || '未测量'}`);
        console.log(`  心率: ${measurement.heartRate || '未测量'}`);
        console.log(`  体温: ${measurement.temperature || '未测量'}`);
        console.log(`  血氧: ${measurement.oxygenSaturation || '未测量'}`);
        console.log(`  血糖: ${measurement.bloodSugar || '未测量'}`);
        console.log(`  异常: ${measurement.isAbnormal ? '是' : '否'}`);
        console.log(`  异常原因: ${measurement.abnormalReasons ? measurement.abnormalReasons.join(', ') : '无'}`);
        console.log(`  状态: ${measurement.status}`);
        console.log(`  测量时间: ${measurement.measurementTime}`);
        console.log(`  创建时间: ${measurement.createdAt}`);
      });

      // 4. 测试前端格式化函数
      console.log('\n4. 测试前端格式化...');
      const firstMeasurement = measurements[0];
      
      // 模拟前端的formatMeasurementValue函数
      const formatMeasurementValue = (measurement) => {
        const values = []
        
        if (measurement.systolic && measurement.diastolic) {
          values.push(`血壓: ${measurement.systolic}/${measurement.diastolic} mmHg`)
        }
        if (measurement.heartRate) {
          values.push(`心率: ${measurement.heartRate} 次/分`)
        }
        if (measurement.temperature) {
          values.push(`體溫: ${measurement.temperature}°C`)
        }
        if (measurement.oxygenSaturation) {
          values.push(`血氧: ${measurement.oxygenSaturation}%`)
        }
        if (measurement.bloodSugar) {
          values.push(`血糖: ${measurement.bloodSugar} mg/dL`)
        }
        
        return values.join(' | ') || 'N/A'
      }

      console.log('格式化结果:', formatMeasurementValue(firstMeasurement));
    }

    console.log('\n✅ 测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('认证失败，请检查用户凭据');
    }
  }
}

testSpecificPatient(); 