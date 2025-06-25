const { MongoClient } = require('mongodb');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

async function simpleDbCheck() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 连接MongoDB成功');
    
    const db = client.db(DATABASE_NAME);
    
    // 检查集合
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`\n📋 数据库 ${DATABASE_NAME} 中的集合:`);
    console.log(collectionNames.join(', '));
    
    const expectedCollections = ['users', 'measurements', 'diagnoses', 'covidassessments'];
    const missing = expectedCollections.filter(name => !collectionNames.includes(name));
    
    if (missing.length > 0) {
      console.log(`\n❌ 缺少集合: ${missing.join(', ')}`);
      return false;
    }
    
    // 检查每个集合的数据量
    console.log('\n📊 数据统计:');
    for (const collectionName of expectedCollections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} 条记录`);
    }
    
    console.log('\n✅ 数据库结构完整！');
    return true;
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    return false;
  } finally {
    await client.close();
  }
}

simpleDbCheck()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 