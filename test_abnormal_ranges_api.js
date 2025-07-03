const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODVjM2MxNDdlMjEzMThiMjRiMGMzYTQiLCJ1c2VybmFtZSI6Im5vbGVzIiwicm9sZSI6Im1lZGljYWxfc3RhZmYiLCJpYXQiOjE3MzU5MjMzMjIsImV4cCI6MTczNTkyNjkyMn0.example'; // 需要有效的token

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }
});

// 測試創建異常範圍
async function testCreateAbnormalRange() {
  console.log('🧪 測試創建異常範圍...');
  
  const testData = {
    measurementType: 'blood_pressure',
    name: '血壓',
    normalRange: {
      systolic: {
        min: 90,
        max: 140
      },
      diastolic: {
        min: 60,
        max: 90
      }
    },
    unit: 'mmHg',
    description: '血壓的異常範圍設定',
    isActive: true
  };
  
  try {
    const response = await api.post('/abnormal-ranges', testData);
    console.log('✅ 創建成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 創建失敗:', error.response?.data || error.message);
    return null;
  }
}

// 測試獲取所有異常範圍
async function testGetAbnormalRanges() {
  console.log('🧪 測試獲取異常範圍...');
  
  try {
    const response = await api.get('/abnormal-ranges');
    console.log('✅ 獲取成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 獲取失敗:', error.response?.data || error.message);
    return null;
  }
}

// 測試更新異常範圍
async function testUpdateAbnormalRange(id) {
  console.log('🧪 測試更新異常範圍...');
  
  const updateData = {
    name: '血壓 (更新)',
    normalRange: {
      systolic: {
        min: 85,
        max: 135
      },
      diastolic: {
        min: 55,
        max: 85
      }
    },
    unit: 'mmHg',
    description: '血壓的異常範圍設定 (更新)',
    isActive: true
  };
  
  try {
    const response = await api.patch(`/abnormal-ranges/${id}`, updateData);
    console.log('✅ 更新成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 更新失敗:', error.response?.data || error.message);
    return null;
  }
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始測試異常範圍API...\n');
  
  // 1. 獲取現有的異常範圍
  const existingRanges = await testGetAbnormalRanges();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. 創建新的異常範圍
  const newRange = await testCreateAbnormalRange();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 3. 如果創建成功，測試更新
  if (newRange && newRange._id) {
    await testUpdateAbnormalRange(newRange._id);
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // 4. 再次獲取所有異常範圍
  await testGetAbnormalRanges();
  
  console.log('\n✅ 測試完成！');
}

// 運行測試
runTests().catch(console.error); 