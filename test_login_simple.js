const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await axios.post('http://localhost:7723/api/auth/login', {
      username: 'doctor002',
      password: '123456'
    });
    
    console.log('Login response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testLogin(); 