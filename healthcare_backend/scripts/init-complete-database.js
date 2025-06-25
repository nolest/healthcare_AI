const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const DATABASE_NAME = 'healthcare_local';
const MONGODB_URI = 'mongodb://127.0.0.1:27017';

async function initCompleteDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ 连接到MongoDB成功');
    
    const db = client.db(DATABASE_NAME);
    
    // 1. 删除现有集合（如果存在）
    console.log('\n🗑️  清理现有数据...');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`   删除集合: ${collection.name}`);
    }
    
    // 2. 创建用户集合和索引
    console.log('\n👥 创建用户集合...');
    const usersCollection = db.collection('users');
    
    // 创建唯一索引
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    console.log('   ✅ 用户集合索引创建完成');
    
    // 3. 创建测量数据集合和索引
    console.log('\n📊 创建测量数据集合...');
    const measurementsCollection = db.collection('measurements');
    
    await measurementsCollection.createIndex({ userId: 1 });
    await measurementsCollection.createIndex({ createdAt: -1 });
    await measurementsCollection.createIndex({ isAbnormal: 1 });
    await measurementsCollection.createIndex({ status: 1 });
    await measurementsCollection.createIndex({ userId: 1, createdAt: -1 });
    console.log('   ✅ 测量数据集合索引创建完成');
    
    // 4. 创建诊断集合和索引
    console.log('\n🏥 创建诊断集合...');
    const diagnosesCollection = db.collection('diagnoses');
    
    await diagnosesCollection.createIndex({ patientId: 1 });
    await diagnosesCollection.createIndex({ doctorId: 1 });
    await diagnosesCollection.createIndex({ measurementId: 1 });
    await diagnosesCollection.createIndex({ createdAt: -1 });
    await diagnosesCollection.createIndex({ status: 1 });
    await diagnosesCollection.createIndex({ patientId: 1, createdAt: -1 });
    console.log('   ✅ 诊断集合索引创建完成');
    
    // 5. 创建COVID评估集合和索引
    console.log('\n🦠 创建COVID评估集合...');
    const covidAssessmentsCollection = db.collection('covidassessments');
    
    await covidAssessmentsCollection.createIndex({ userId: 1 });
    await covidAssessmentsCollection.createIndex({ createdAt: -1 });
    await covidAssessmentsCollection.createIndex({ riskLevel: 1 });
    await covidAssessmentsCollection.createIndex({ severity: 1 });
    await covidAssessmentsCollection.createIndex({ userId: 1, createdAt: -1 });
    console.log('   ✅ COVID评估集合索引创建完成');
    
    // 6. 插入初始用户数据
    console.log('\n👤 插入初始用户数据...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const initialUsers = [
      {
        username: 'patient1',
        password: hashedPassword,
        fullName: '张三',
        email: 'patient1@example.com',
        role: 'patient',
        phone: '13800138001',
        birthDate: '1990-01-01',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'patient2',
        password: hashedPassword,
        fullName: '李四',
        email: 'patient2@example.com',
        role: 'patient',
        phone: '13800138002',
        birthDate: '1985-05-15',
        gender: 'female',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'doctor1',
        password: hashedPassword,
        fullName: '王医生',
        email: 'doctor1@example.com',
        role: 'medical_staff',
        phone: '13800138003',
        birthDate: '1975-03-20',
        gender: 'male',
        department: '内科',
        license_number: 'DOC001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'nurse1',
        password: hashedPassword,
        fullName: '陈护士',
        email: 'nurse1@example.com',
        role: 'medical_staff',
        phone: '13800138004',
        birthDate: '1985-08-10',
        gender: 'female',
        department: '护理部',
        license_number: 'NUR001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const userResult = await usersCollection.insertMany(initialUsers);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`   ✅ 插入 ${userIds.length} 个初始用户`);
    
    // 7. 插入示例测量数据
    console.log('\n📈 插入示例测量数据...');
    const patientIds = userIds.slice(0, 2); // 前两个是患者
    
    const sampleMeasurements = [];
    for (let i = 0; i < 10; i++) {
      const patientId = patientIds[i % 2];
      const isAbnormal = Math.random() > 0.7; // 30% 概率异常
      
      sampleMeasurements.push({
        userId: patientId,
        systolic: isAbnormal ? 160 + Math.floor(Math.random() * 20) : 110 + Math.floor(Math.random() * 20),
        diastolic: isAbnormal ? 100 + Math.floor(Math.random() * 15) : 70 + Math.floor(Math.random() * 15),
        heartRate: isAbnormal ? 100 + Math.floor(Math.random() * 20) : 60 + Math.floor(Math.random() * 30),
        temperature: isAbnormal ? 38.5 + Math.random() * 2 : 36.5 + Math.random() * 1,
        oxygenSaturation: isAbnormal ? 90 + Math.random() * 5 : 95 + Math.random() * 5,
        notes: i % 3 === 0 ? '感觉有些不适' : '',
        status: 'pending',
        isAbnormal: isAbnormal,
        measurementTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // 过去7天内随机时间
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const measurementResult = await measurementsCollection.insertMany(sampleMeasurements);
    const measurementIds = Object.values(measurementResult.insertedIds);
    console.log(`   ✅ 插入 ${measurementIds.length} 条示例测量数据`);
    
    // 8. 插入示例诊断数据
    console.log('\n🩺 插入示例诊断数据...');
    const doctorId = userIds[2]; // 医生ID
    
    const sampleDiagnoses = [];
    for (let i = 0; i < 5; i++) {
      const patientId = patientIds[i % 2];
      const measurementId = measurementIds[i];
      
      sampleDiagnoses.push({
        patientId: patientId,
        doctorId: doctorId,
        measurementId: measurementId,
        diagnosis: i % 2 === 0 ? '高血压' : '心律不齐',
        treatment: i % 2 === 0 ? '降压药物治疗，控制饮食' : '心律调节药物，定期复查',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后复查
        notes: '请按时服药，注意休息',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const diagnosisResult = await diagnosesCollection.insertMany(sampleDiagnoses);
    console.log(`   ✅ 插入 ${sampleDiagnoses.length} 条示例诊断数据`);
    
    // 9. 插入示例COVID评估数据
    console.log('\n🦠 插入示例COVID评估数据...');
    const sampleCovidAssessments = [];
    
    for (let i = 0; i < 6; i++) {
      const patientId = patientIds[i % 2];
      const riskLevel = ['低风险', '中风险', '高风险'][i % 3];
      const severity = ['轻微', '中等', '严重'][i % 3];
      
      sampleCovidAssessments.push({
        userId: patientId,
        symptoms: i % 2 === 0 ? ['发热', '咳嗽'] : ['头痛', '乏力', '咽痛'],
        severity: severity,
        riskLevel: riskLevel,
        recommendations: riskLevel === '高风险' ? 
          ['立即就医', '居家隔离', '密切监测症状'] : 
          ['居家休息', '多喝水', '观察症状变化'],
        exposureHistory: i % 3 === 0,
        travelHistory: i % 4 === 0,
        contactHistory: i % 2 === 0,
        vaccinationStatus: ['未接种', '已接种1针', '已接种2针', '已接种加强针'][i % 4],
        testResults: ['阴性', '阳性', '未检测'][i % 3],
        notes: i % 2 === 0 ? '症状较轻' : '需要密切观察',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)), // 过去14天内随机时间
        updatedAt: new Date()
      });
    }
    
    const covidResult = await covidAssessmentsCollection.insertMany(sampleCovidAssessments);
    console.log(`   ✅ 插入 ${sampleCovidAssessments.length} 条示例COVID评估数据`);
    
    // 10. 验证数据完整性
    console.log('\n✅ 验证数据完整性...');
    const userCount = await usersCollection.countDocuments();
    const measurementCount = await measurementsCollection.countDocuments();
    const diagnosisCount = await diagnosesCollection.countDocuments();
    const covidCount = await covidAssessmentsCollection.countDocuments();
    
    console.log(`   用户数量: ${userCount}`);
    console.log(`   测量记录数量: ${measurementCount}`);
    console.log(`   诊断记录数量: ${diagnosisCount}`);
    console.log(`   COVID评估数量: ${covidCount}`);
    
    // 11. 显示测试账号信息
    console.log('\n🔑 测试账号信息:');
    console.log('   患者账号1: patient1 / 123456');
    console.log('   患者账号2: patient2 / 123456');  
    console.log('   医生账号: doctor1 / 123456');
    console.log('   护士账号: nurse1 / 123456');
    
    console.log('\n🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// 运行初始化
if (require.main === module) {
  initCompleteDatabase()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initCompleteDatabase }; 