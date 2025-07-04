// 模拟前端API调用和数据处理逻辑
const axios = require('axios');

// 模拟前端的loadExistingDiagnosis函数
async function testLoadExistingDiagnosis() {
  try {
    console.log('🔍 测试前端loadExistingDiagnosis逻辑...');
    
    // 1. 先登录获取token
    const loginResponse = await axios.post('http://localhost:7723/api/auth/login', {
      username: 'doctor002',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }
    
    const token = loginResponse.data.access_token;
    console.log('✅ 登录成功，获取token');
    
    // 2. 调用诊断API
    const measurementId = '686779c9f1788652789019d6';
    console.log('🔍 加载已有诊断记录, measurementId:', measurementId);
    
    const response = await axios.get(
      `http://localhost:7723/api/measurement-diagnoses/measurement/${measurementId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('📡 API响应:', JSON.stringify(response.data, null, 2));
    
    // 3. 模拟前端数据处理逻辑
    let diagnosisData = null;
    let existingDiagnosis = null;
    let diagnosis = '';
    let riskLevel = '';
    let medications = '';
    let lifestyle = '';
    let followUp = '';
    let notes = '';
    
    // 检查响应格式，支持多种格式
    if (response.data && response.data.success && response.data.data) {
      // 格式2: 包装对象
      diagnosisData = response.data.data;
      console.log('✅ 找到已有诊断记录 (包装格式):', diagnosisData);
    } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // 格式1: 数组格式
      diagnosisData = response.data[0];
      console.log('✅ 找到已有诊断记录 (数组格式):', diagnosisData);
    } else if (response.data && response.data._id) {
      // 格式3: 直接返回诊断对象
      diagnosisData = response.data;
      console.log('✅ 找到已有诊断记录 (直接对象):', diagnosisData);
    }
    
    if (diagnosisData) {
      existingDiagnosis = diagnosisData;
      
      // 将诊断数据填充到表单字段中
      diagnosis = diagnosisData.diagnosis || '';
      riskLevel = diagnosisData.riskLevel || '';
      medications = diagnosisData.medications || '';
      lifestyle = diagnosisData.lifestyle || '';
      followUp = diagnosisData.followUp || '';
      notes = diagnosisData.notes || '';
      
      console.log('📋 诊断数据已填充:', {
        diagnosis,
        riskLevel,
        medications,
        lifestyle,
        followUp,
        notes
      });
      
      // 4. 模拟只读模式渲染检查
      console.log('\n🎨 只读模式渲染检查:');
      console.log('existingDiagnosis 不为空:', !!existingDiagnosis);
      console.log('diagnosis 有内容:', !!diagnosis);
      console.log('riskLevel 有内容:', !!riskLevel);
      
      if (existingDiagnosis && diagnosis) {
        console.log('✅ 只读模式应该正常显示诊断内容');
        console.log('显示的诊断结果:', diagnosis);
        console.log('显示的风险等级:', riskLevel);
      } else {
        console.log('❌ 只读模式可能无法正常显示');
      }
      
    } else {
      console.log('⚠️ 未找到已有诊断记录');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testLoadExistingDiagnosis(); 