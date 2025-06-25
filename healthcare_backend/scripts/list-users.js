const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';

async function listUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    const users = await db.collection('users').find({}).toArray();
    
    console.log('\n👥 数据库中的用户列表:');
    console.log(`总用户数: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ 数据库中没有用户！');
      console.log('💡 请运行: npm run db:init 来创建默认用户');
    } else {
      console.log('\n📋 用户详情:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. 用户名: ${user.username}`);
        console.log(`   姓名: ${user.fullName}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   部门: ${user.department || 'N/A'}`);
        console.log(`   创建时间: ${user.createdAt}`);
      });
      
      console.log('\n🔑 默认密码信息:');
      console.log('- admin: admin123');
      console.log('- doctor001: doctor123');
      console.log('- doctor002: doctor123');
      console.log('- patient001: patient123');
      console.log('- 其他用户: patient123 或 doctor123');
    }
    
  } catch (error) {
    console.error('❌ 查询用户失败:', error.message);
  } finally {
    await client.close();
  }
}

listUsers(); 