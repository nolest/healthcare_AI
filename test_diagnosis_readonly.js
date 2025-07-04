const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 测试诊断页面只读模式
async function testDiagnosisReadOnly() {
  try {
    console.log('🔐 测试医生登录...');
    
    // 1. 登录医生账号
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor002',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    console.log('✅ 登录成功');
    console.log('医生信息:', JSON.stringify(loginResponse.data.user, null, 2));
    
    const token = loginResponse.data.access_token;
    
    // 2. 获取已诊断的测量记录
    console.log('\n📋 获取已诊断的测量记录...');
    
    const measurementId = '686779c9f1788652789019d6'; // 从URL中获取的测量记录ID
    
    // 3. 测试获取测量记录详情
    console.log('\n🔍 测试获取测量记录详情...');
    
    try {
      const measurementResponse = await axios.get(
        `${API_BASE_URL}/measurements`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ 获取测量记录成功，总数:', measurementResponse.data.data?.length || 0);
      
      // 查找指定的测量记录
      const targetMeasurement = measurementResponse.data.data?.find(m => m._id === measurementId);
      if (targetMeasurement) {
        console.log('✅ 找到目标测量记录:', {
          id: targetMeasurement._id,
          status: targetMeasurement.status,
          oxygenSaturation: targetMeasurement.oxygenSaturation,
          patientId: targetMeasurement.userId
        });
      } else {
        console.log('❌ 未找到目标测量记录');
      }
      
    } catch (error) {
      console.log('❌ 获取测量记录失败:', error.response?.data || error.message);
    }
    
    // 4. 测试获取该测量记录的诊断
    console.log('\n🩺 测试获取测量记录的诊断...');
    
    try {
      const diagnosisResponse = await axios.get(
        `${API_BASE_URL}/measurement-diagnoses/measurement/${measurementId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ 获取诊断记录成功:', diagnosisResponse.data.length, '条');
      if (diagnosisResponse.data.length > 0) {
        const diagnosis = diagnosisResponse.data[0];
        console.log('诊断详情:', {
          id: diagnosis._id,
          diagnosis: diagnosis.diagnosis,
          riskLevel: diagnosis.riskLevel,
          medications: diagnosis.medications,
          lifestyle: diagnosis.lifestyle,
          followUp: diagnosis.followUp,
          notes: diagnosis.notes,
          createdAt: diagnosis.createdAt,
          doctorId: diagnosis.doctorId
        });
      }
    } catch (error) {
      console.log('❌ 获取诊断记录失败:', error.response?.data || error.message);
    }
    
    // 5. 测试URL构造
    console.log('\n🔗 测试URL构造...');
    
    const readOnlyUrl = `http://localhost:6886/medical/diagnosis/form?mid=${measurementId}&hasread=1`;
    const editUrl = `http://localhost:6886/medical/diagnosis/form?mid=${measurementId}&hasread=0`;
    
    console.log('只读模式URL:', readOnlyUrl);
    console.log('编辑模式URL:', editUrl);
    
    console.log('\n✅ 测试完成！');
    console.log('📝 使用说明：');
    console.log('- 当 hasread=1 时，页面应显示为只读模式，显示已有诊断内容');
    console.log('- 当 hasread=0 时，页面应显示为编辑模式，允许创建新诊断');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDiagnosisReadOnly(); 