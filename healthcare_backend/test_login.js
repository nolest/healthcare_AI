const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

async function testLogin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 连接MongoDB成功');
    
    const db = client.db(DATABASE_NAME);
    
    // 检查数据库和集合
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`\n📋 数据库集合: ${collectionNames.join(', ')}`);
    
    // 检查用户集合
    if (collectionNames.includes('users')) {
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`👥 用户总数: ${userCount}`);
      
      // 检查doctor003用户
      const doctor003 = await usersCollection.findOne({ username: 'doctor003' });
      if (doctor003) {
        console.log(`✅ doctor003 用户存在`);
        console.log(`   角色: ${doctor003.role}`);
        console.log(`   姓名: ${doctor003.fullName}`);
        
        // 测试密码验证
        const passwordMatch = await bcrypt.compare('123456', doctor003.password);
        console.log(`🔐 密码验证: ${passwordMatch ? '✅ 正确' : '❌ 错误'}`);
      } else {
        console.log(`❌ doctor003 用户不存在，正在创建...`);
        
        // 创建doctor003用户
        const hashedPassword = await bcrypt.hash('123456', 10);
        const newUser = {
          username: 'doctor003',
          password: hashedPassword,
          fullName: '李医生',
          email: 'doctor003@example.com',
          role: 'medical_staff',
          phone: '13800138003',
          birthDate: '1980-06-15',
          gender: 'male',
          department: '内科',
          license_number: 'DOC003',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await usersCollection.insertOne(newUser);
        console.log(`✅ doctor003 用户创建成功`);
      }
    } else {
      console.log(`❌ users 集合不存在`);
    }
    
    // 检查其他集合的数据量
    const requiredCollections = ['measurements', 'diagnoses', 'covidassessments'];
    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📊 ${collectionName}: ${count} 条记录`);
      } else {
        console.log(`❌ ${collectionName} 集合不存在`);
      }
    }
    
    console.log(`\n💡 如果数据库为空或集合缺失，请运行: node scripts/init-complete-database.js`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await client.close();
  }
}

testLogin(); 