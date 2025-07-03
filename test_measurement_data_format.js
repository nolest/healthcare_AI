const axios = require('axios');

const API_BASE_URL = 'http://localhost:7723/api';

// 獲取身份驗證token
async function getAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'password123'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ 登錄失敗:', error.message);
    throw error;
  }
}

// 測試測量記錄數據格式
async function testMeasurementDataFormat() {
  console.log('🔍 測試測量記錄數據格式...\n');
  
  try {
    // 1. 獲取身份驗證token
    console.log('🔐 正在登錄...');
    const token = await getAuthToken();
    console.log('✅ 登錄成功\n');
    
    // 2. 獲取特定患者的測量記錄
    const patientId = '685c3c147e21318b24b0c3a4';
    console.log(`📊 獲取患者 ${patientId} 的測量記錄...`);
    
    const response = await axios.get(`${API_BASE_URL}/measurements/user/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const measurements = response.data;
    console.log(`📋 找到 ${measurements.length} 條測量記錄\n`);
    
    // 3. 分析數據格式
    measurements.forEach((measurement, index) => {
      console.log(`${index + 1}. 測量記錄 ID: ${measurement._id}`);
      console.log(`   創建時間: ${measurement.createdAt}`);
      console.log(`   測量時間: ${measurement.measurementTime}`);
      console.log(`   是否異常: ${measurement.isAbnormal}`);
      console.log(`   嚴重程度: ${measurement.severity}`);
      console.log(`   異常原因: ${JSON.stringify(measurement.abnormalReasons)}`);
      console.log(`   狀態: ${measurement.status}`);
      
      // 測量數據
      if (measurement.systolic || measurement.diastolic) {
        console.log(`   血壓: ${measurement.systolic}/${measurement.diastolic} mmHg`);
      }
      if (measurement.heartRate) {
        console.log(`   心率: ${measurement.heartRate} bpm`);
      }
      if (measurement.temperature) {
        console.log(`   體溫: ${measurement.temperature}°C`);
      }
      if (measurement.oxygenSaturation) {
        console.log(`   血氧: ${measurement.oxygenSaturation}%`);
      }
      
      console.log(''); // 空行分隔
    });
    
    // 4. 檢查數據完整性
    console.log('🔍 數據完整性檢查:');
    const hasAbnormalData = measurements.some(m => m.isAbnormal);
    const hasSeverityData = measurements.some(m => m.severity && m.severity !== 'normal');
    const hasAbnormalReasons = measurements.some(m => m.abnormalReasons && m.abnormalReasons.length > 0);
    
    console.log(`   有異常記錄: ${hasAbnormalData ? '✅' : '❌'}`);
    console.log(`   有嚴重程度數據: ${hasSeverityData ? '✅' : '❌'}`);
    console.log(`   有異常原因數據: ${hasAbnormalReasons ? '✅' : '❌'}`);
    
    console.log('\n✅ 測量記錄數據格式檢查完成');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    if (error.response) {
      console.error('   狀態碼:', error.response.status);
      console.error('   錯誤詳情:', error.response.data);
    }
  }
}

// 執行測試
testMeasurementDataFormat(); 