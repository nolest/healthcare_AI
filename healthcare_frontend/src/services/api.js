// API服务层 - 替换mockDataStore
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:7723/api';
    this.token = localStorage.getItem('auth_token');
  }

  // 设置认证token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // 获取认证头
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 认证相关API
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // 测量数据相关API
  async submitMeasurement(measurementData) {
    return this.request('/measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  async getMyMeasurements() {
    return this.request('/measurements/my');
  }

  async getMyAbnormalMeasurements() {
    return this.request('/measurements/abnormal/my');
  }

  async getAllMeasurements() {
    return this.request('/measurements');
  }

  async getAbnormalMeasurements() {
    return this.request('/measurements/abnormal');
  }

  async getUserMeasurements(userId) {
    return this.request(`/measurements/user/${userId}`);
  }

  async updateMeasurementStatus(measurementId, status, isAbnormal) {
    return this.request(`/measurements/${measurementId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, isAbnormal }),
    });
  }

  async processPatientMeasurements(patientId) {
    return this.request(`/measurements/patient/${patientId}/process`, {
      method: 'PATCH',
    });
  }

  async getMeasurementStats() {
    return this.request('/measurements/stats');
  }

  // 用户管理相关API
  async getUsers() {
    return this.request('/users');
  }

  async getPatients() {
    return this.request('/users/patients');
  }

  async getMedicalStaff() {
    return this.request('/users/medical-staff');
  }

  // COVID评估相关API
  async submitCovidAssessment(assessmentData) {
    return this.request('/covid-assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  async getMyCovidAssessments() {
    return this.request('/covid-assessments/my');
  }

  async getAllCovidAssessments() {
    return this.request('/covid-assessments');
  }

  async getHighRiskCovidAssessments() {
    return this.request('/covid-assessments/high-risk');
  }

  async getUserCovidAssessments(userId) {
    return this.request(`/covid-assessments/user/${userId}`);
  }

  async getCovidAssessmentStats() {
    return this.request('/covid-assessments/stats');
  }

  async getCovidAssessmentById(id) {
    return this.request(`/covid-assessments/${id}`);
  }

  async updateCovidAssessment(id, updateData) {
    return this.request(`/covid-assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // 诊断相关API
  async createDiagnosis(diagnosisData) {
    return this.request('/diagnoses', {
      method: 'POST',
      body: JSON.stringify(diagnosisData),
    });
  }

  async getMyDiagnoses() {
    return this.request('/diagnoses/my');
  }

  async getAllDiagnoses() {
    return this.request('/diagnoses');
  }

  async getPatientDiagnoses(patientId) {
    return this.request(`/diagnoses/patient/${patientId}`);
  }

  async getDiagnosisById(id) {
    return this.request(`/diagnoses/${id}`);
  }

  async updateDiagnosis(id, updateData) {
    return this.request(`/diagnoses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async getDiagnosisStats() {
    return this.request('/diagnoses/stats');
  }

  // 检查token是否有效
  isAuthenticated() {
    return !!this.token;
  }

  // 获取当前用户信息（从token中解析或缓存）
  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 设置当前用户信息
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }
}

// 创建全局API实例
const apiService = new ApiService();

export default apiService; 