const { MongoClient } = require('mongodb');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';

console.log('🗑️ 医疗 AI 项目 - 数据库重置脚本');
console.log('===================================');
console.log('⚠️ 警告: 此操作将删除所有数据！');

async function resetDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    
    // 获取所有集合
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 发现 ${collections.length} 个集合`);
    
    // 删除所有集合
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`🗑️ 已删除集合: ${collection.name}`);
    }
    
    console.log('\n✅ 数据库重置完成！');
    console.log('💡 提示: 运行 npm run init-db 重新初始化数据库');
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行重置
resetDatabase().catch(console.error); 