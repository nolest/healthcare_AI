const axios = require('axios');

async function testDiagnosisReportAPI() {
  try {
    // 测试登录
    const loginResponse = await axios.post('http://localhost:7723/auth/login', {
      username: 'patient',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    
    console.log('登录成功，用户ID:', userId);
    
    // 获取诊断报告详情
    const reportId = '686c0b9f7f6499d83832b9ad';
    const reportResponse = await axios.get(`http://localhost:7723/diagnosis-reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('诊断报告详情:');
    console.log(JSON.stringify(reportResponse.data, null, 2));
    
    // 检查是否有medications字段
    if (reportResponse.data.medications) {
      console.log('✓ 找到medications字段:', reportResponse.data.medications);
    } else {
      console.log('✗ 未找到medications字段');
    }
    
    // 检查是否有medicationPrescription字段
    if (reportResponse.data.medicationPrescription) {
      console.log('✓ 找到medicationPrescription字段:', reportResponse.data.medicationPrescription);
    } else {
      console.log('✗ 未找到medicationPrescription字段');
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testDiagnosisReportAPI(); 