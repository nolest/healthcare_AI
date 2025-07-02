const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_local';

async function fixCovidStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 连接MongoDB成功');
    console.log('📍 数据库URI:', MONGODB_URI);
    
    const collection = mongoose.connection.db.collection('covidassessments');
    
    console.log('\n=== 修复COVID评估状态字段 ===');
    
    // 查找没有status字段或status为null的记录
    const recordsToFix = await collection.find({
      $or: [
        { status: { $exists: false } },
        { status: null }
      ]
    }).toArray();
    
    console.log(`🔍 找到需要修复的记录数: ${recordsToFix.length}`);
    
    if (recordsToFix.length > 0) {
      // 批量更新这些记录，设置status为'pending'
      const result = await collection.updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { status: null }
          ]
        },
        {
          $set: { status: 'pending' }
        }
      );
      
      console.log(`✅ 成功修复 ${result.modifiedCount} 条记录`);
      
      // 显示修复后的统计
      console.log('\n=== 修复后的状态统计 ===');
      const statusStats = await collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      console.log('📈 按状态统计:', statusStats);
      
      const total = await collection.countDocuments();
      const pending = await collection.countDocuments({ status: 'pending' });
      const processed = await collection.countDocuments({ 
        status: { $in: ['processed', 'reviewed'] } 
      });
      
      console.log(`📊 总数: ${total}`);
      console.log(`⏳ 待处理: ${pending}`);
      console.log(`✅ 已处理: ${processed}`);
      
    } else {
      console.log('ℹ️ 没有需要修复的记录');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCovidStatus(); 