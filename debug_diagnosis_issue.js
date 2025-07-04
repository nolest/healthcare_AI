const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 调试诊断加载问题
async function debugDiagnosisIssue() {
  try {
    console.log('🔐 步骤1: 医生登录...');
    
    // 1. 登录医生账号
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor002',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    console.log('✅ 登录成功');
    const token = loginResponse.data.access_token;
    
    const measurementId = '686779c9f1788652789019d6';
    
    console.log('\n🔍 步骤2: 检查测量记录是否存在...');
    
    try {
      // 检查异常测量记录
      const abnormalResponse = await axios.get(`${API_BASE_URL}/measurements/abnormal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('异常测量记录总数:', abnormalResponse.data.data?.length || 0);
      const abnormalMeasurement = abnormalResponse.data.data?.find(m => m._id === measurementId);
      console.log('在异常记录中找到目标记录:', abnormalMeasurement ? '是' : '否');
      
      if (abnormalMeasurement) {
        console.log('异常记录详情:', {
          id: abnormalMeasurement._id,
          status: abnormalMeasurement.status,
          oxygenSaturation: abnormalMeasurement.oxygenSaturation,
          userId: abnormalMeasurement.userId,
          createdAt: abnormalMeasurement.createdAt
        });
      }
      
      // 检查所有测量记录
      const allResponse = await axios.get(`${API_BASE_URL}/measurements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('所有测量记录总数:', allResponse.data.data?.length || 0);
      const allMeasurement = allResponse.data.data?.find(m => m._id === measurementId);
      console.log('在所有记录中找到目标记录:', allMeasurement ? '是' : '否');
      
      if (allMeasurement) {
        console.log('所有记录中的详情:', {
          id: allMeasurement._id,
          status: allMeasurement.status,
          oxygenSaturation: allMeasurement.oxygenSaturation,
          userId: allMeasurement.userId,
          createdAt: allMeasurement.createdAt
        });
      }
      
    } catch (error) {
      console.error('❌ 获取测量记录失败:', error.response?.data || error.message);
    }
    
    console.log('\n🩺 步骤3: 检查诊断记录...');
    
    try {
      // 检查该测量记录的诊断
      const diagnosisResponse = await axios.get(
        `${API_BASE_URL}/measurement-diagnoses/measurement/${measurementId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('✅ 诊断记录API调用成功');
      console.log('诊断记录数量:', diagnosisResponse.data.length);
      
      if (diagnosisResponse.data.length > 0) {
        const diagnosis = diagnosisResponse.data[0];
        console.log('第一条诊断记录详情:', {
          id: diagnosis._id,
          measurementId: diagnosis.measurementId,
          patientId: diagnosis.patientId,
          diagnosis: diagnosis.diagnosis?.substring(0, 50) + '...',
          riskLevel: diagnosis.riskLevel,
          medications: diagnosis.medications?.substring(0, 30) + '...',
          lifestyle: diagnosis.lifestyle?.substring(0, 30) + '...',
          followUp: diagnosis.followUp?.substring(0, 30) + '...',
          notes: diagnosis.notes?.substring(0, 30) + '...',
          createdAt: diagnosis.createdAt,
          doctorId: diagnosis.doctorId
        });
        
        console.log('\n📝 完整诊断内容:');
        console.log('诊断结果:', diagnosis.diagnosis);
        console.log('风险等级:', diagnosis.riskLevel);
        console.log('用药建议:', diagnosis.medications);
        console.log('生活方式建议:', diagnosis.lifestyle);
        console.log('复查建议:', diagnosis.followUp);
        console.log('其他备注:', diagnosis.notes);
      } else {
        console.log('⚠️ 该测量记录没有诊断记录');
      }
      
    } catch (error) {
      console.error('❌ 获取诊断记录失败:', error.response?.data || error.message);
      console.error('错误状态码:', error.response?.status);
      console.error('错误详情:', error.response?.data);
    }
    
    console.log('\n🌐 步骤4: 检查前端页面应该做什么...');
    
    console.log('URL: http://localhost:6886/medical/diagnosis/form?mid=686779c9f1788652789019d6&hasread=1');
    console.log('页面应该：');
    console.log('1. 解析 hasread=1 参数，设置为只读模式');
    console.log('2. 调用 loadMeasurementById("686779c9f1788652789019d6")');
    console.log('3. 在 loadMeasurementById 成功后，调用 loadExistingDiagnosis("686779c9f1788652789019d6")');
    console.log('4. loadExistingDiagnosis 应该调用 getMeasurementDiagnosisByMeasurement API');
    console.log('5. 如果找到诊断记录，填充到表单字段并显示只读内容');
    
    console.log('\n🔧 可能的问题:');
    console.log('1. 前端没有正确调用 loadExistingDiagnosis');
    console.log('2. API调用失败或返回空结果');
    console.log('3. 状态更新没有触发UI重新渲染');
    console.log('4. 只读模式的条件判断有问题');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

// 运行调试
debugDiagnosisIssue(); 