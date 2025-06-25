const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 数据库集合统计:');
    console.log(`数据库名称: ${DB_NAME}`);
    console.log(`总集合数: ${collections.length}`);
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} 条记录`);
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabase(); 