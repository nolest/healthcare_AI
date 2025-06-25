const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
const DB_NAME = 'healthcare_local';

console.log('🌱 医疗 AI 项目 - 示例数据生成脚本');
console.log('=====================================');

async function seedSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');
    
    const db = client.db(DB_NAME);
    
    // 获取集合
    const usersCollection = db.collection('users');
    const measurementsCollection = db.collection('measurements');
    const diagnosesCollection = db.collection('diagnoses');
    const covidAssessmentsCollection = db.collection('covidassessments');
    
    console.log('\n👥 创建示例用户...');
    
    // 创建更多示例医生
    const doctors = [
      {
        username: 'doctor002',
        password: await bcrypt.hash('doctor123', 10),
        fullName: '王医生',
        email: 'wang.doctor@healthcare.com',
        role: 'medical_staff',
        phone: '13800138010',
        birthDate: '1982-08-10',
        gender: 'female',
        department: '心内科',
        license_number: 'DOC002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'doctor003',
        password: await bcrypt.hash('doctor123', 10),
        fullName: '李医生',
        email: 'li.doctor@healthcare.com',
        role: 'medical_staff',
        phone: '13800138011',
        birthDate: '1978-12-05',
        gender: 'male',
        department: '呼吸科',
        license_number: 'DOC003',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 创建更多示例患者
    const patients = [
      {
        username: 'patient002',
        password: await bcrypt.hash('patient123', 10),
        fullName: '张三',
        email: 'zhangsan@example.com',
        role: 'patient',
        phone: '13800138020',
        birthDate: '1985-03-15',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'patient003',
        password: await bcrypt.hash('patient123', 10),
        fullName: '李四',
        email: 'lisi@example.com',
        role: 'patient',
        phone: '13800138021',
        birthDate: '1992-07-22',
        gender: 'female',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'patient004',
        password: await bcrypt.hash('patient123', 10),
        fullName: '王五',
        email: 'wangwu@example.com',
        role: 'patient',
        phone: '13800138022',
        birthDate: '1988-11-30',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 插入医生数据
    for (const doctor of doctors) {
      try {
        await usersCollection.insertOne(doctor);
        console.log(`✅ 创建医生: ${doctor.fullName}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ 医生 ${doctor.fullName} 已存在`);
        }
      }
    }
    
    // 插入患者数据
    for (const patient of patients) {
      try {
        await usersCollection.insertOne(patient);
        console.log(`✅ 创建患者: ${patient.fullName}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ 患者 ${patient.fullName} 已存在`);
        }
      }
    }
    
    // 获取已创建的用户
    const allUsers = await usersCollection.find().toArray();
    const patientUsers = allUsers.filter(u => u.role === 'patient');
    const doctorUsers = allUsers.filter(u => u.role === 'medical_staff');
    
    console.log('\n📊 创建示例测量数据...');
    
    // 为每个患者创建一些测量数据
    const sampleMeasurements = [];
    for (const patient of patientUsers) {
      // 为每个患者创建 3-5 条测量记录
      const measurementCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < measurementCount; i++) {
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30)); // 过去30天内的随机日期
        
        const measurement = {
          userId: patient._id,
          systolic: Math.floor(Math.random() * 40) + 110, // 110-150
          diastolic: Math.floor(Math.random() * 30) + 70,  // 70-100
          heartRate: Math.floor(Math.random() * 40) + 60,  // 60-100
          temperature: (Math.random() * 2 + 36).toFixed(1), // 36.0-38.0
          oxygenSaturation: Math.floor(Math.random() * 5) + 95, // 95-100
          notes: ['感觉良好', '有些疲劳', '头痛', '胸闷', ''][Math.floor(Math.random() * 5)],
          status: ['pending', 'processed', 'reviewed'][Math.floor(Math.random() * 3)],
          isAbnormal: Math.random() > 0.7, // 30% 概率异常
          measurementTime: baseDate,
          createdAt: baseDate,
          updatedAt: baseDate
        };
        
        sampleMeasurements.push(measurement);
      }
    }
    
    if (sampleMeasurements.length > 0) {
      await measurementsCollection.insertMany(sampleMeasurements);
      console.log(`✅ 创建了 ${sampleMeasurements.length} 条测量记录`);
    }
    
    console.log('\n🦠 创建示例 COVID 评估...');
    
    // 为一些患者创建 COVID 评估
    const sampleCovidAssessments = [];
    const symptoms = ['发热', '咳嗽', '乏力', '头痛', '肌肉疼痛', '嗅觉丧失', '味觉丧失'];
    const vaccinationStatuses = ['unvaccinated', 'partially_vaccinated', 'fully_vaccinated', 'booster'];
    
    for (let i = 0; i < Math.min(patientUsers.length, 3); i++) {
      const patient = patientUsers[i];
      const selectedSymptoms = symptoms.slice(0, Math.floor(Math.random() * 4) + 1);
      const hasRisk = Math.random() > 0.5;
      
      const assessment = {
        userId: patient._id,
        symptoms: selectedSymptoms,
        severity: selectedSymptoms.includes('发热') ? 'moderate' : 'mild',
        riskLevel: hasRisk ? 'medium' : 'low',
        recommendations: ['佩戴口罩', '居家休息', '多喝水'],
        exposureHistory: hasRisk,
        travelHistory: Math.random() > 0.8,
        contactHistory: hasRisk,
        vaccinationStatus: vaccinationStatuses[Math.floor(Math.random() * vaccinationStatuses.length)],
        testResults: Math.random() > 0.7 ? 'positive' : 'negative',
        notes: '定期评估',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 过去7天内
        updatedAt: new Date()
      };
      
      sampleCovidAssessments.push(assessment);
    }
    
    if (sampleCovidAssessments.length > 0) {
      await covidAssessmentsCollection.insertMany(sampleCovidAssessments);
      console.log(`✅ 创建了 ${sampleCovidAssessments.length} 条 COVID 评估记录`);
    }
    
    console.log('\n🩺 创建示例诊断记录...');
    
    // 获取一些测量记录来创建诊断
    const measurements = await measurementsCollection.find().limit(5).toArray();
    const sampleDiagnoses = [];
    
    for (let i = 0; i < Math.min(measurements.length, 3); i++) {
      const measurement = measurements[i];
      const doctor = doctorUsers[Math.floor(Math.random() * doctorUsers.length)];
      
      const diagnosis = {
        patientId: measurement.userId,
        doctorId: doctor._id,
        measurementId: measurement._id,
        diagnosis: ['高血压前期', '正常血压', '轻度高血压', '心率不齐'][Math.floor(Math.random() * 4)],
        treatment: ['建议低盐饮食', '适量运动', '定期监测', '药物治疗'][Math.floor(Math.random() * 4)],
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后复诊
        notes: '患者配合度良好',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      sampleDiagnoses.push(diagnosis);
    }
    
    if (sampleDiagnoses.length > 0) {
      await diagnosesCollection.insertMany(sampleDiagnoses);
      console.log(`✅ 创建了 ${sampleDiagnoses.length} 条诊断记录`);
    }
    
    // 显示最终统计
    console.log('\n📊 示例数据统计:');
    console.log(`   用户总数: ${await usersCollection.countDocuments()}`);
    console.log(`   - 患者: ${await usersCollection.countDocuments({ role: 'patient' })}`);
    console.log(`   - 医护人员: ${await usersCollection.countDocuments({ role: 'medical_staff' })}`);
    console.log(`   测量记录: ${await measurementsCollection.countDocuments()}`);
    console.log(`   诊断记录: ${await diagnosesCollection.countDocuments()}`);
    console.log(`   COVID评估: ${await covidAssessmentsCollection.countDocuments()}`);
    
    console.log('\n🎉 示例数据生成完成！');
    
  } catch (error) {
    console.error('❌ 示例数据生成失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行示例数据生成
seedSampleData().catch(console.error); 