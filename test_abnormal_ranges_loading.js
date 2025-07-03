const axios = require('axios');

const API_BASE_URL = 'http://localhost:7723/api';

// 獲取身份驗證token
async function getAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'doctor001',
      password: 'password123'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ 登錄失敗:', error.message);
    throw error;
  }
}

// 測試異常範圍加載
async function testAbnormalRangesLoading() {
  console.log('🔍 測試異常範圍數據加載...\n');
  
  try {
    // 1. 獲取身份驗證token
    console.log('🔐 正在登錄...');
    const token = await getAuthToken();
    console.log('✅ 登錄成功\n');
    
    // 2. 獲取現有的異常範圍設定
    const response = await axios.get(`${API_BASE_URL}/abnormal-ranges`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const abnormalRanges = response.data;
    
    console.log(`📊 數據庫中的異常範圍設定 (${abnormalRanges.length} 條):`);
    
    abnormalRanges.forEach((range, index) => {
      console.log(`\n${index + 1}. ${range.measurementType}:`);
      console.log(`   正常範圍:`, range.normalRange);
      
      if (range.abnormalRanges) {
        console.log(`   異常範圍:`, range.abnormalRanges);
        
        // 模擬前端的反推邏輯
        Object.keys(range.abnormalRanges).forEach(param => {
          const abnormalRange = range.abnormalRanges[param];
          const normalRange = range.normalRange[param];
          
          console.log(`\n   📈 ${param} 反推分界點:`);
          
          const boundaries = {};
          
          // 嚴重偏低上限 = severeLow.max
          if (abnormalRange.severeLow?.max !== undefined) {
            boundaries.severe_low_max = abnormalRange.severeLow.max;
          }
          
          // 偏低上限 = low.max = 正常下限
          if (abnormalRange.low?.max !== undefined) {
            boundaries.low_max = abnormalRange.low.max;
          } else if (normalRange.min !== undefined) {
            boundaries.low_max = normalRange.min;
          }
          
          // 正常上限 = normal.max
          if (normalRange.max !== undefined) {
            boundaries.normal_max = normalRange.max;
          }
          
          // 偏高上限 = high.max
          if (abnormalRange.high?.max !== undefined) {
            boundaries.high_max = abnormalRange.high.max;
          } else {
            boundaries.high_max = normalRange.max || boundaries.normal_max;
          }
          
          // 嚴重偏高上限 = severeHigh.max
          if (abnormalRange.severeHigh?.max !== undefined) {
            boundaries.severe_high_max = abnormalRange.severeHigh.max;
          } else {
            boundaries.severe_high_max = boundaries.high_max || boundaries.normal_max;
          }
          
          console.log(`     嚴重偏低上限: ${boundaries.severe_low_max}`);
          console.log(`     偏低上限: ${boundaries.low_max}`);
          console.log(`     正常上限: ${boundaries.normal_max}`);
          console.log(`     偏高上限: ${boundaries.high_max}`);
          console.log(`     嚴重偏高上限: ${boundaries.severe_high_max}`);
          
          // 檢查分界點邏輯
          const boundariesArray = [
            boundaries.severe_low_max,
            boundaries.low_max,
            boundaries.normal_max,
            boundaries.high_max,
            boundaries.severe_high_max
          ];
          
          let isValid = true;
          for (let i = 0; i < boundariesArray.length - 1; i++) {
            if (boundariesArray[i] > boundariesArray[i + 1]) {
              isValid = false;
              break;
            }
          }
          
          console.log(`     ✅ 分界點邏輯: ${isValid ? '正確' : '❌ 錯誤'}`);
        });
      } else {
        console.log(`   ⚠️ 沒有異常範圍數據`);
      }
    });
    
    console.log('\n✅ 異常範圍數據加載測試完成');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    if (error.response) {
      console.error('   狀態碼:', error.response.status);
      console.error('   錯誤詳情:', error.response.data);
    }
  }
}

// 執行測試
testAbnormalRangesLoading(); 