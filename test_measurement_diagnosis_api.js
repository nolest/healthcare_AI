const axios = require('axios');

const BASE_URL = 'http://localhost:7723/api';

// 医生登录信息
const DOCTOR_CREDENTIALS = {
  username: 'doctor002',
  password: '123456'
};

// 测量记录ID
const MEASUREMENT_IDS = [
  '68676fc9b82ed5a51d300ecd',
  '68676ffab82ed5a51d300ed1'
];

// 患者ID
const PATIENT_ID = '685c3c147e21318b24b0c3a4';

let authToken = '';

async function login() {
  try {
    console.log('🔐 正在登录医生账户...');
    const response = await axios.post(`${BASE_URL}/auth/login`, DOCTOR_CREDENTIALS);
    
    if (response.data.success) {
      authToken = response.data.access_token;
      console.log('✅ 登录成功');
      return true;
    } else {
      console.error('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录出错:', error.response?.data || error.message);
    return false;
  }
}

async function createMeasurementDiagnosis(measurementId) {
  try {
    console.log(`\n📋 正在为测量记录 ${measurementId} 创建诊断...`);
    
    const diagnosisData = {
      patientId: PATIENT_ID,
      measurementId: measurementId,
      diagnosis: `测量记录 ${measurementId} 的诊断结果：血氧饱和度轻微异常，建议观察。`,
      riskLevel: 'low',
      medications: '无需特殊用药',
      lifestyle: '建议适当运动，保持良好作息',
      followUp: '一周后复查',
      treatmentPlan: '观察治疗',
      notes: '患者整体状况良好，无需担心'
    };

    const response = await axios.post(`${BASE_URL}/measurement-diagnoses`, diagnosisData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ 诊断创建成功');
      console.log('📄 诊断ID:', response.data.data._id);
      return response.data.data;
    } else {
      console.error('❌ 诊断创建失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 创建诊断出错:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('🔍 服务器错误详情:', error.response.data);
    }
    return null;
  }
}

async function getMeasurementDiagnosis(measurementId) {
  try {
    console.log(`\n🔍 正在查询测量记录 ${measurementId} 的诊断...`);
    
    const response = await axios.get(`${BASE_URL}/measurement-diagnoses/measurement/${measurementId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success && response.data.data) {
      console.log('✅ 找到诊断记录');
      console.log('📋 诊断内容:', response.data.data.diagnosis);
      console.log('⚠️ 风险等级:', response.data.data.riskLevel);
      return response.data.data;
    } else {
      console.log('ℹ️ 未找到诊断记录');
      return null;
    }
  } catch (error) {
    console.error('❌ 查询诊断出错:', error.response?.data || error.message);
    return null;
  }
}

async function getAllMeasurementDiagnoses() {
  try {
    console.log('\n📊 正在获取所有测量诊断记录...');
    
    const response = await axios.get(`${BASE_URL}/measurement-diagnoses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log(`✅ 获取成功，共 ${response.data.data.length} 条记录`);
      response.data.data.forEach((diagnosis, index) => {
        console.log(`${index + 1}. 诊断ID: ${diagnosis._id}`);
        console.log(`   测量ID: ${diagnosis.measurementId}`);
        console.log(`   患者ID: ${diagnosis.patientId}`);
        console.log(`   诊断: ${diagnosis.diagnosis}`);
        console.log(`   风险等级: ${diagnosis.riskLevel}`);
        console.log(`   创建时间: ${diagnosis.createdAt}`);
        console.log('');
      });
      return response.data.data;
    } else {
      console.error('❌ 获取失败:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ 获取诊断记录出错:', error.response?.data || error.message);
    return [];
  }
}

async function testMeasurementDiagnosisAPI() {
  console.log('🧪 开始测试 Measurement Diagnosis API...\n');
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ 登录失败，测试终止');
    return;
  }

  // 2. 为每个测量记录创建诊断
  const createdDiagnoses = [];
  for (const measurementId of MEASUREMENT_IDS) {
    const diagnosis = await createMeasurementDiagnosis(measurementId);
    if (diagnosis) {
      createdDiagnoses.push(diagnosis);
    }
    
    // 等待一秒避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 3. 查询刚创建的诊断记录
  console.log('\n=== 验证诊断记录 ===');
  for (const measurementId of MEASUREMENT_IDS) {
    await getMeasurementDiagnosis(measurementId);
  }

  // 4. 获取所有诊断记录
  await getAllMeasurementDiagnoses();

  console.log('\n🎉 测试完成！');
  console.log(`✅ 成功创建 ${createdDiagnoses.length} 条诊断记录`);
}

// 运行测试
testMeasurementDiagnosisAPI().catch(console.error); 