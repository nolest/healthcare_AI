// 测试异常数据API
async function testAbnormalAPI() {
  try {
    console.log('🔍 测试异常数据API...\n');
    
    // 首先尝试登录获取token
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'medical_staff',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.access_token) {
      console.error('❌ 登录失败，无法获取token');
      console.log('登录响应:', loginData);
      return;
    }
    
    const token = loginData.access_token;
    console.log('✅ 登录成功，获取到token');
    
    // 测试获取异常数据API
    const abnormalResponse = await fetch('http://localhost:3001/measurements/abnormal', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const abnormalData = await abnormalResponse.json();
    
    console.log('📊 API响应结构:');
    console.log('- success:', abnormalData.success);
    console.log('- data length:', abnormalData.data?.length || 0);
    console.log('- count:', abnormalData.count);
    
    if (abnormalData.data && abnormalData.data.length > 0) {
      console.log('\n🔥 异常记录列表:');
      abnormalData.data.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record._id}`);
        console.log(`   用户ID: ${record.userId?._id || record.userId}`);
        console.log(`   用户名: ${record.userId?.username || '未知'}`);
        console.log(`   收缩压: ${record.systolic || '无'}`);
        console.log(`   舒张压: ${record.diastolic || '无'}`);
        console.log(`   状态: ${record.status}`);
        console.log(`   异常: ${record.isAbnormal}`);
        console.log(`   创建时间: ${record.createdAt}`);
        console.log('');
      });
      
      // 检查是否包含您提到的特定记录
      const specificRecord = abnormalData.data.find(r => r._id === '68641799340a6d50d55a6922');
      if (specificRecord) {
        console.log('✅ 找到特定记录 68641799340a6d50d55a6922');
        console.log('详情:', JSON.stringify(specificRecord, null, 2));
      } else {
        console.log('❌ 未在异常列表中找到记录 68641799340a6d50d55a6922');
        console.log('可能原因:');
        console.log('1. 记录不存在');
        console.log('2. 记录不是异常状态 (isAbnormal: false)');
        console.log('3. 记录不是待处理状态 (status 不是 "pending")');
      }
    } else {
      console.log('❌ 没有找到任何异常记录');
      console.log('完整响应:', JSON.stringify(abnormalData, null, 2));
    }
    
    // 测试获取所有测量数据
    console.log('\n📋 测试获取所有测量数据...');
    const allMeasurementsResponse = await fetch('http://localhost:3001/measurements', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const allMeasurementsData = await allMeasurementsResponse.json();
    
    console.log('所有测量记录数:', allMeasurementsData.count);
    
    // 在所有记录中查找特定记录
    const allRecords = allMeasurementsData.data || [];
    const specificInAll = allRecords.find(r => r._id === '68641799340a6d50d55a6922');
    
    if (specificInAll) {
      console.log('✅ 在所有记录中找到特定记录:');
      console.log(`   ID: ${specificInAll._id}`);
      console.log(`   用户ID: ${specificInAll.userId?._id || specificInAll.userId}`);
      console.log(`   收缩压: ${specificInAll.systolic}`);
      console.log(`   舒张压: ${specificInAll.diastolic}`);
      console.log(`   状态: ${specificInAll.status}`);
      console.log(`   异常: ${specificInAll.isAbnormal}`);
      console.log(`   异常原因: ${specificInAll.abnormalReasons?.join(', ') || '无'}`);
      console.log(`   创建时间: ${specificInAll.createdAt}`);
      
      // 分析为什么没有出现在异常列表中
      if (!specificInAll.isAbnormal) {
        console.log('❌ 记录未标记为异常 (isAbnormal: false)');
        console.log('💡 建议: 检查异常值检测逻辑');
      } else if (specificInAll.status !== 'pending') {
        console.log(`❌ 记录状态不是pending (当前状态: ${specificInAll.status})`);
        console.log('💡 建议: 将记录状态改为pending');
      } else {
        console.log('✅ 记录符合异常条件，应该出现在异常列表中');
      }
    } else {
      console.log('❌ 在所有记录中也未找到特定记录');
      console.log('💡 建议: 检查记录ID是否正确');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.cause) {
      console.error('详细错误:', error.cause);
    }
  }
}

// 运行测试
testAbnormalAPI(); 