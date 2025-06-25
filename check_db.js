const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  
  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ 成功连接到 MongoDB!');
    
    // 选择 healcare 数据库
    const db = client.db('healcare');
    
    // 列出所有 collections
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 healcare 数据库中的 Collections:');
    console.log('=====================================');
    
    if (collections.length === 0) {
      console.log('  📝 暂无 collections');
      console.log('  💡 提示：你可能需要在 Compass 中创建一些 collections');
    } else {
      collections.forEach((col, index) => {
        console.log(`  ${index + 1}. 📁 ${col.name}`);
      });
      
      // 显示每个 collection 的文档数量
      console.log('\n📈 每个 Collection 的文档数量:');
      console.log('=====================================');
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  📄 ${col.name}: ${count} 个文档`);
      }
    }
    
  } catch (error) {
    console.error('❌ 连接错误:', error.message);
  } finally {
    // 关闭连接
    await client.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

checkDatabase(); 