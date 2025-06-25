const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';

console.log('🏥 医疗 AI 项目 - 数据库初始化脚本');
console.log('=====================================');

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    
    // 1. 创建用户表并添加索引
    console.log('\n📋 创建数据库表和索引...');
    
    // 创建 users 集合
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    console.log('✅ users 表创建完成');
    
    // 创建 measurements 集合
    const measurementsCollection = db.collection('measurements');
    await measurementsCollection.createIndex({ userId: 1 });
    await measurementsCollection.createIndex({ createdAt: -1 });
    await measurementsCollection.createIndex({ status: 1 });
    await measurementsCollection.createIndex({ isAbnormal: 1 });
    console.log('✅ measurements 表创建完成');
    
    // 创建 diagnoses 集合
    const diagnosesCollection = db.collection('diagnoses');
    await diagnosesCollection.createIndex({ patientId: 1 });
    await diagnosesCollection.createIndex({ doctorId: 1 });
    await diagnosesCollection.createIndex({ measurementId: 1 });
    await diagnosesCollection.createIndex({ createdAt: -1 });
    await diagnosesCollection.createIndex({ status: 1 });
    console.log('✅ diagnoses 表创建完成');
    
    // 创建 covidassessments 集合
    const covidAssessmentsCollection = db.collection('covidassessments');
    await covidAssessmentsCollection.createIndex({ userId: 1 });
    await covidAssessmentsCollection.createIndex({ riskLevel: 1 });
    await covidAssessmentsCollection.createIndex({ createdAt: -1 });
    console.log('✅ covidassessments 表创建完成');
    
    // 创建 medical_records 集合
    const medicalRecordsCollection = db.collection('medical_records');
    await medicalRecordsCollection.createIndex({ patientId: 1 });
    await medicalRecordsCollection.createIndex({ doctorId: 1 });
    await medicalRecordsCollection.createIndex({ recordType: 1 });
    await medicalRecordsCollection.createIndex({ createdAt: -1 });
    console.log('✅ medical_records 表创建完成');
    
    // 创建 prescriptions 集合
    const prescriptionsCollection = db.collection('prescriptions');
    await prescriptionsCollection.createIndex({ patientId: 1 });
    await prescriptionsCollection.createIndex({ doctorId: 1 });
    await prescriptionsCollection.createIndex({ diagnosisId: 1 });
    await prescriptionsCollection.createIndex({ status: 1 });
    console.log('✅ prescriptions 表创建完成');
    
    // 创建 appointments 集合
    const appointmentsCollection = db.collection('appointments');
    await appointmentsCollection.createIndex({ patientId: 1 });
    await appointmentsCollection.createIndex({ doctorId: 1 });
    await appointmentsCollection.createIndex({ appointmentDate: 1 });
    await appointmentsCollection.createIndex({ status: 1 });
    console.log('✅ appointments 表创建完成');
    
    // 2. 插入初始数据
    console.log('\n👤 创建初始用户数据...');
    
    // 检查是否已有用户数据
    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers === 0) {
      // 创建默认管理员医生
      const adminPassword = await bcrypt.hash('admin123', 10);
      const adminDoctor = {
        username: 'admin',
        password: adminPassword,
        fullName: '系统管理员',
        email: 'admin@healthcare.com',
        role: 'medical_staff',
        phone: '13800138000',
        birthDate: '1980-01-01',
        gender: 'male',
        department: '管理科',
        license_number: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(adminDoctor);
      console.log('✅ 默认管理员账户创建完成');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      
      // 创建示例医生
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      const sampleDoctor = {
        username: 'doctor001',
        password: doctorPassword,
        fullName: '张医生',
        email: 'doctor@healthcare.com',
        role: 'medical_staff',
        phone: '13800138001',
        birthDate: '1985-03-15',
        gender: 'male',
        department: '内科',
        license_number: 'DOC001',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(sampleDoctor);
      console.log('✅ 示例医生账户创建完成');
      console.log('   用户名: doctor001');
      console.log('   密码: doctor123');
      
      // 创建示例患者
      const patientPassword = await bcrypt.hash('patient123', 10);
      const samplePatient = {
        username: 'patient001',
        password: patientPassword,
        fullName: '李患者',
        email: 'patient@healthcare.com',
        role: 'patient',
        phone: '13800138002',
        birthDate: '1990-06-20',
        gender: 'female',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(samplePatient);
      console.log('✅ 示例患者账户创建完成');
      console.log('   用户名: patient001');
      console.log('   密码: patient123');
      
    } else {
      console.log('ℹ️ 用户数据已存在，跳过初始用户创建');
    }
    
    // 3. 显示数据库统计信息
    console.log('\n📊 数据库统计信息:');
    const collections = await db.listCollections().toArray();
    console.log(`   总集合数: ${collections.length}`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} 条记录`);
    }
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n📝 下一步操作:');
    console.log('1. 启动后端服务: npm run start:dev');
    console.log('2. 访问 API 文档: http://localhost:3000/api');
    console.log('3. 使用上述账户登录测试系统');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行初始化
initializeDatabase().catch(console.error); 