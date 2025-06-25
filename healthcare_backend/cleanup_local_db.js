const { MongoClient } = require('mongodb');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

// 必需的集合（基于前端实际使用的功能）
const REQUIRED_COLLECTIONS = [
  'users',          // 用户认证和管理
  'measurements',   // 测量数据
  'diagnoses',      // 诊断记录
  'covidassessments' // COVID评估
];

async function cleanupLocalDb() {
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
      console.log(`❌ 数据库 ${DATABASE_NAME} 不存在`);
      return;
    }
    
    // 获取所有集合
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`\n📋 当前集合 (${collectionNames.length}个):`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    
    // 找出多余的集合
    const unnecessaryCollections = collectionNames.filter(name => !REQUIRED_COLLECTIONS.includes(name));
    
    if (unnecessaryCollections.length === 0) {
      console.log('\n✅ 没有多余的集合需要清理');
      return;
    }
    
    console.log(`\n⚠️  发现 ${unnecessaryCollections.length} 个多余集合:`);
    unnecessaryCollections.forEach(name => console.log(`   - ${name}`));
    
    // 显示每个多余集合的内容信息
    console.log(`\n📊 多余集合详细信息:`);
    for (const collectionName of unnecessaryCollections) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`\n🔍 ${collectionName}:`);
      console.log(`   文档数量: ${count}`);
      
      if (count > 0) {
        const sampleDoc = await collection.findOne();
        const fields = Object.keys(sampleDoc).filter(key => key !== '_id');
        console.log(`   字段: ${fields.join(', ')}`);
      }
    }
    
    // 询问是否删除（在实际环境中可以添加交互式确认）
    console.log(`\n🗑️  准备删除多余集合...`);
    
    let deletedCount = 0;
    for (const collectionName of unnecessaryCollections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`   ✅ 已删除: ${collectionName}`);
        deletedCount++;
      } catch (error) {
        console.log(`   ❌ 删除失败: ${collectionName} - ${error.message}`);
      }
    }
    
    console.log(`\n📈 清理结果:`);
    console.log(`   删除成功: ${deletedCount} 个集合`);
    console.log(`   删除失败: ${unnecessaryCollections.length - deletedCount} 个集合`);
    
    // 验证清理后的状态
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name);
    
    console.log(`\n📋 清理后的集合 (${finalCollectionNames.length}个):`);
    finalCollectionNames.forEach(name => console.log(`   - ${name}`));
    
    // 检查是否还有缺失的必需集合
    const missingCollections = REQUIRED_COLLECTIONS.filter(name => !finalCollectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.log(`\n⚠️  仍缺少必需集合:`);
      missingCollections.forEach(name => console.log(`   - ${name}`));
      console.log(`\n💡 建议运行: node scripts/init-complete-database.js`);
    } else {
      console.log(`\n✅ 所有必需集合都存在`);
    }
    
    console.log(`\n🎉 数据库清理完成！`);
    
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  } finally {
    await client.close();
  }
}

// 运行清理
cleanupLocalDb(); 