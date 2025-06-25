const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';
const NEW_PASSWORD = '123456';

console.log('🔐 医疗 AI 项目 - 批量更新用户密码脚本');
console.log('==========================================');

async function updateAllPasswords() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // 获取所有用户
    const users = await usersCollection.find({}).toArray();
    console.log(`\n📋 找到 ${users.length} 个用户账户`);
    
    if (users.length === 0) {
      console.log('❌ 没有找到用户数据');
      return;
    }
    
    // 加密新密码
    console.log(`\n🔒 正在加密新密码: ${NEW_PASSWORD}`);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log('✅ 密码加密完成');
    
    // 批量更新所有用户密码
    console.log('\n🔄 开始更新用户密码...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedPassword,
              updatedAt: new Date()
            }
          }
        );
        
        console.log(`✅ 用户 "${user.username}" (${user.fullName}) 密码更新成功`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ 用户 "${user.username}" 密码更新失败:`, error.message);
        errorCount++;
      }
    }
    
    // 显示更新结果
    console.log('\n📊 密码更新结果统计:');
    console.log(`   成功更新: ${successCount} 个用户`);
    console.log(`   更新失败: ${errorCount} 个用户`);
    console.log(`   新密码: ${NEW_PASSWORD}`);
    
    if (successCount > 0) {
      console.log('\n🎉 密码批量更新完成！');
      console.log('\n📝 更新后的账户信息:');
      
      // 显示所有用户的登录信息
      const updatedUsers = await usersCollection.find({}, { 
        projection: { username: 1, fullName: 1, role: 1, email: 1 } 
      }).toArray();
      
      updatedUsers.forEach((user, index) => {
        console.log(`${index + 1}. 用户名: ${user.username}`);
        console.log(`   姓名: ${user.fullName}`);
        console.log(`   角色: ${user.role === 'medical_staff' ? '医护人员' : '患者'}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   密码: ${NEW_PASSWORD}`);
        console.log('   ---');
      });
      
      console.log('\n💡 提示: 所有用户现在都可以使用新密码登录系统');
    }
    
  } catch (error) {
    console.error('❌ 密码更新失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行密码更新
updateAllPasswords().catch(console.error); 