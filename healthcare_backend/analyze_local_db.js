const { MongoClient } = require('mongodb');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

// 前端实际使用的API功能分析
const REQUIRED_APIS = {
  auth: [
    'login', 'register', 'getCurrentUser', 'logout'
  ],
  measurements: [
    'submitMeasurement', 'getMyMeasurements', 'getAbnormalMeasurements',
    'getUserMeasurements', 'processPatientMeasurements', 'updateMeasurementStatus',
    'getMeasurementStats'
  ],
  users: [
    'getPatients'
  ],
  diagnoses: [
    'getMyDiagnoses', 'getAllDiagnoses', 'createDiagnosis', 'getDiagnosisStats'
  ],
  covidAssessments: [
    'getMyCovidAssessments', 'getAllCovidAssessments', 'submitCovidAssessment'
  ]
};

// 必需的集合
const REQUIRED_COLLECTIONS = [
  'users',          // 用户认证和管理
  'measurements',   // 测量数据
  'diagnoses',      // 诊断记录
  'covidassessments' // COVID评估
];

async function analyzeLocalDb() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 连接MongoDB成功');
    
    const db = client.db(DATABASE_NAME);
    
    // 检查数据库是否存在
    const adminDb = client.db('admin');
    const dbList = await adminDb.listDatabases();
    const dbExists = dbList.databases.some(database => database.name === DATABASE_NAME);
    
    if (!dbExists) {
      console.log(`❌ 数据库 ${DATABASE_NAME} 不存在，需要创建`);
      return {
        exists: false,
        collections: [],
        requiredCollections: REQUIRED_COLLECTIONS,
        unnecessaryCollections: []
      };
    }
    
    console.log(`✅ 数据库 ${DATABASE_NAME} 存在`);
    
    // 获取所有集合
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`\n📋 当前集合 (${collectionNames.length}个):`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    
    // 分析必需和多余的集合
    const missingCollections = REQUIRED_COLLECTIONS.filter(name => !collectionNames.includes(name));
    const unnecessaryCollections = collectionNames.filter(name => !REQUIRED_COLLECTIONS.includes(name));
    
    console.log(`\n🔍 集合分析:`);
    
    if (missingCollections.length > 0) {
      console.log(`❌ 缺少必需集合 (${missingCollections.length}个):`);
      missingCollections.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log(`✅ 所有必需集合都存在`);
    }
    
    if (unnecessaryCollections.length > 0) {
      console.log(`⚠️  多余集合 (${unnecessaryCollections.length}个):`);
      unnecessaryCollections.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log(`✅ 没有多余集合`);
    }
    
    // 检查每个必需集合的详细信息
    console.log(`\n📊 必需集合详细信息:`);
    for (const collectionName of REQUIRED_COLLECTIONS) {
      if (collectionNames.includes(collectionName)) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`\n🔍 ${collectionName}:`);
        console.log(`   文档数量: ${count}`);
        
        if (count > 0) {
          // 获取示例文档结构
          const sampleDoc = await collection.findOne();
          const fields = Object.keys(sampleDoc).filter(key => key !== '_id');
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 检查索引
          const indexes = await collection.indexes();
          const indexNames = indexes.map(idx => idx.name).filter(name => name !== '_id_');
          if (indexNames.length > 0) {
            console.log(`   索引: ${indexNames.join(', ')}`);
          }
          
          // 特殊检查
          if (collectionName === 'users') {
            const roleStats = await collection.aggregate([
              { $group: { _id: '$role', count: { $sum: 1 } } }
            ]).toArray();
            console.log(`   用户角色分布: ${roleStats.map(r => `${r._id}(${r.count})`).join(', ')}`);
          }
          
          if (collectionName === 'measurements') {
            const abnormalStats = await collection.aggregate([
              { $group: { _id: '$isAbnormal', count: { $sum: 1 } } }
            ]).toArray();
            console.log(`   异常数据分布: ${abnormalStats.map(s => `${s._id ? '异常' : '正常'}(${s.count})`).join(', ')}`);
          }
        }
      } else {
        console.log(`\n❌ ${collectionName}: 不存在`);
      }
    }
    
    // 检查多余集合的内容
    if (unnecessaryCollections.length > 0) {
      console.log(`\n🗑️  多余集合内容分析:`);
      for (const collectionName of unnecessaryCollections) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`\n📋 ${collectionName}:`);
        console.log(`   文档数量: ${count}`);
        
        if (count > 0) {
          const sampleDoc = await collection.findOne();
          const fields = Object.keys(sampleDoc).filter(key => key !== '_id');
          console.log(`   字段: ${fields.join(', ')}`);
        }
      }
    }
    
    // 生成建议
    console.log(`\n💡 建议操作:`);
    
    if (missingCollections.length > 0) {
      console.log(`1. 创建缺少的集合并建立索引:`);
      missingCollections.forEach(name => console.log(`   - 创建 ${name} 集合`));
    }
    
    if (unnecessaryCollections.length > 0) {
      console.log(`2. 删除多余的集合 (可选):`);
      unnecessaryCollections.forEach(name => console.log(`   - 删除 ${name} 集合`));
    }
    
    console.log(`3. 运行数据库初始化脚本确保结构完整`);
    
    return {
      exists: true,
      collections: collectionNames,
      requiredCollections: REQUIRED_COLLECTIONS,
      missingCollections,
      unnecessaryCollections
    };
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    return null;
  } finally {
    await client.close();
  }
}

// 运行分析
analyzeLocalDb()
  .then(result => {
    if (result) {
      console.log('\n✅ 分析完成');
    }
  })
  .catch(error => {
    console.error('❌ 脚本执行失败:', error);
  }); 