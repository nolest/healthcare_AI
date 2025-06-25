const { MongoClient } = require('mongodb');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

// 期望的集合结构
const EXPECTED_COLLECTIONS = {
  users: {
    indexes: ['username_1', 'email_1', 'role_1'],
    requiredFields: ['username', 'password', 'fullName', 'email', 'role']
  },
  measurements: {
    indexes: ['userId_1', 'createdAt_-1', 'isAbnormal_1', 'status_1'],
    requiredFields: ['userId', 'systolic', 'diastolic', 'heartRate', 'temperature', 'oxygenSaturation']
  },
  diagnoses: {
    indexes: ['patientId_1', 'doctorId_1', 'measurementId_1', 'createdAt_-1', 'status_1'],
    requiredFields: ['patientId', 'doctorId', 'measurementId', 'diagnosis', 'treatment']
  },
  covidassessments: {
    indexes: ['userId_1', 'createdAt_-1', 'riskLevel_1', 'severity_1'],
    requiredFields: ['userId', 'symptoms', 'severity', 'riskLevel', 'recommendations']
  }
};

async function checkDatabaseStructure() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 连接到MongoDB成功');
    
    const db = client.db(DATABASE_NAME);
    
    // 1. 检查数据库是否存在
    const adminDb = client.db('admin');
    const dbList = await adminDb.listDatabases();
    const dbExists = dbList.databases.some(database => database.name === DATABASE_NAME);
    
    if (!dbExists) {
      console.log(`❌ 数据库 ${DATABASE_NAME} 不存在`);
      return false;
    }
    
    console.log(`✅ 数据库 ${DATABASE_NAME} 存在`);
    
    // 2. 检查所有集合
    console.log('\n📋 检查集合结构...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let allGood = true;
    
    for (const [expectedCollection, config] of Object.entries(EXPECTED_COLLECTIONS)) {
      console.log(`\n🔍 检查集合: ${expectedCollection}`);
      
      if (!collectionNames.includes(expectedCollection)) {
        console.log(`   ❌ 集合 ${expectedCollection} 不存在`);
        allGood = false;
        continue;
      }
      
      const collection = db.collection(expectedCollection);
      
      // 检查文档数量
      const count = await collection.countDocuments();
      console.log(`   📊 文档数量: ${count}`);
      
      if (count === 0) {
        console.log(`   ⚠️  集合 ${expectedCollection} 为空`);
      }
      
      // 检查索引
      const indexes = await collection.indexes();
      const indexNames = indexes.map(idx => idx.name).filter(name => name !== '_id_');
      
      console.log(`   🔑 现有索引: ${indexNames.join(', ')}`);
      
      for (const expectedIndex of config.indexes) {
        if (!indexNames.includes(expectedIndex)) {
          console.log(`   ❌ 缺少索引: ${expectedIndex}`);
          allGood = false;
        } else {
          console.log(`   ✅ 索引存在: ${expectedIndex}`);
        }
      }
      
      // 检查字段结构（如果有数据）
      if (count > 0) {
        const sampleDoc = await collection.findOne();
        const actualFields = Object.keys(sampleDoc);
        
        console.log(`   📝 示例文档字段: ${actualFields.join(', ')}`);
        
        for (const requiredField of config.requiredFields) {
          if (!actualFields.includes(requiredField)) {
            console.log(`   ❌ 缺少必需字段: ${requiredField}`);
            allGood = false;
          } else {
            console.log(`   ✅ 字段存在: ${requiredField}`);
          }
        }
      }
    }
    
    // 3. 检查数据关联性
    console.log('\n🔗 检查数据关联性...');
    
    const usersCount = await db.collection('users').countDocuments();
    const measurementsCount = await db.collection('measurements').countDocuments();
    const diagnosesCount = await db.collection('diagnoses').countDocuments();
    const covidCount = await db.collection('covidassessments').countDocuments();
    
    console.log(`   用户: ${usersCount}`);
    console.log(`   测量记录: ${measurementsCount}`);
    console.log(`   诊断记录: ${diagnosesCount}`);
    console.log(`   COVID评估: ${covidCount}`);
    
    // 检查用户角色分布
    if (usersCount > 0) {
      const userRoles = await db.collection('users').aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).toArray();
      
      console.log('\n👥 用户角色分布:');
      userRoles.forEach(role => {
        console.log(`   ${role._id}: ${role.count} 人`);
      });
    }
    
    // 检查异常数据统计
    if (measurementsCount > 0) {
      const abnormalStats = await db.collection('measurements').aggregate([
        { $group: { _id: '$isAbnormal', count: { $sum: 1 } } }
      ]).toArray();
      
      console.log('\n📈 测量数据统计:');
      abnormalStats.forEach(stat => {
        console.log(`   ${stat._id ? '异常' : '正常'}: ${stat.count} 条`);
      });
    }
    
    // 检查COVID风险等级分布
    if (covidCount > 0) {
      const riskStats = await db.collection('covidassessments').aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]).toArray();
      
      console.log('\n🦠 COVID风险等级分布:');
      riskStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count} 条`);
      });
    }
    
    // 4. 最终结果
    console.log('\n' + '='.repeat(50));
    if (allGood) {
      console.log('🎉 数据库结构检查通过！所有必需的集合、索引和字段都存在。');
    } else {
      console.log('⚠️  数据库结构检查发现问题，请运行 init-complete-database.js 重新初始化。');
    }
    
    return allGood;
    
  } catch (error) {
    console.error('❌ 数据库结构检查失败:', error);
    return false;
  } finally {
    await client.close();
  }
}

// 运行检查
if (require.main === module) {
  checkDatabaseStructure()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStructure }; 