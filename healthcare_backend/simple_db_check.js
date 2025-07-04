const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/healthcare_local')
  .then(async () => {
    console.log('Connected to MongoDB (healthcare_local)');
    const db = mongoose.connection.db;
    
    // 获取所有集合
    const collections = await db.listCollections().toArray();
    console.log('All collections:');
    collections.forEach(col => console.log(' -', col.name));
    
    // 检查measurementdiagnoses集合
    const count = await db.collection('measurementdiagnoses').countDocuments();
    console.log('\nmeasurementdiagnoses count:', count);
    
    if (count > 0) {
      const docs = await db.collection('measurementdiagnoses').find().limit(5).toArray();
      console.log('Sample documents:');
      docs.forEach((doc, i) => {
        console.log(`${i + 1}. ID: ${doc._id}`);
        console.log(`   measurementId: ${doc.measurementId}`);
        console.log(`   patientId: ${doc.patientId}`);
        console.log(`   doctorId: ${doc.doctorId}`);
        console.log(`   diagnosis: ${doc.diagnosis}`);
        console.log(`   riskLevel: ${doc.riskLevel}`);
        console.log(`   createdAt: ${doc.createdAt}`);
        console.log('');
      });
    }
    
    // 检查指定的测量记录诊断
    const measurementIds = [
      '68676fc9b82ed5a51d300ecd',
      '68676ffab82ed5a51d300ed1'
    ];
    
    console.log('=== 检查指定测量记录的诊断 ===');
    for (const measurementId of measurementIds) {
      const diagnosis = await db.collection('measurementdiagnoses').findOne({
        measurementId: new mongoose.Types.ObjectId(measurementId)
      });
      console.log(`测量记录 ${measurementId} 的诊断:`, diagnosis ? '找到' : '未找到');
      if (diagnosis) {
        console.log(`  诊断ID: ${diagnosis._id}`);
        console.log(`  诊断内容: ${diagnosis.diagnosis}`);
        console.log(`  风险等级: ${diagnosis.riskLevel}`);
        console.log(`  创建时间: ${diagnosis.createdAt}`);
      }
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  }); 