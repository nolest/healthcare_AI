const axios = require('axios');

// 测试7723端口的API
async function testApi() {
  try {
    console.log('🔍 测试API: http://localhost:7723/api/measurement-diagnoses/measurement/686779c9f1788652789019d6');
    
    // 首先尝试登录获取token
    const loginResponse = await axios.post('http://localhost:7723/api/auth/login', {
      username: 'doctor002',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    console.log('✅ 登录成功');
    const token = loginResponse.data.access_token;
    
    // 测试诊断API
    const diagnosisResponse = await axios.get(
      'http://localhost:7723/api/measurement-diagnoses/measurement/686779c9f1788652789019d6',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('✅ API调用成功');
    console.log('响应状态:', diagnosisResponse.status);
    console.log('响应数据:', JSON.stringify(diagnosisResponse.data, null, 2));
    
    if (diagnosisResponse.data && diagnosisResponse.data.length > 0) {
      const diagnosis = diagnosisResponse.data[0];
      console.log('\n📋 诊断详情:');
      console.log('ID:', diagnosis._id);
      console.log('诊断结果:', diagnosis.diagnosis);
      console.log('风险等级:', diagnosis.riskLevel);
      console.log('用药建议:', diagnosis.medications);
      console.log('生活方式建议:', diagnosis.lifestyle);
      console.log('复查建议:', diagnosis.followUp);
      console.log('其他备注:', diagnosis.notes);
      console.log('创建时间:', diagnosis.createdAt);
    } else {
      console.log('⚠️ 没有找到诊断记录');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
    console.error('状态码:', error.response?.status);
  }
}

testApi(); 