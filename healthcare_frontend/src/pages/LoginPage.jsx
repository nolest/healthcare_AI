import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import RegisterForm from '../components/RegisterForm.jsx'
import { Button } from '@/components/ui/button.jsx'

export default function LoginPage() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register'
  const navigate = useNavigate()

  const handleLogin = (user) => {
    // 保存用户信息到localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    // 根据用户角色跳转到相应页面
    if (user.role === 'patient') {
      navigate('/patient')
    } else if (user.role === 'medical_staff') {
      navigate('/medical')
    }
  }

  const handleRegisterSuccess = (user) => {
    // 注册成功后自动登录
    handleLogin(user)
  }

  const switchToRegister = () => {
    setCurrentView('register')
  }

  const switchToLogin = () => {
    setCurrentView('login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  🏥 Remote Health Care System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>繁體中文</option>
              </select>
              <Button
                onClick={currentView === 'login' ? switchToRegister : switchToLogin}
                variant="ghost"
                className="text-blue-600 hover:text-blue-500"
              >
                {currentView === 'login' ? '註冊' : '登錄'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 英雄区域 */}
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              智能診斷點 遠程醫療服務
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              在辦公大樓、機構、保險公司等場所，患者可獨立進行基本生命體徵測量，並通過遠程醫療平台由專業醫護人員進行評估和診斷。
            </p>
          </div>

          {/* 功能特色 */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">智能測量</h3>
              <p className="text-gray-600">
                支持血壓、心率、體溫、血氧等多項生命體徵的自動測量和記錄
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-green-600 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">專業診斷</h3>
              <p className="text-gray-600">
                經驗豐富的醫護人員遠程評估測量結果，提供專業的診斷建議
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-purple-600 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">安全可靠</h3>
              <p className="text-gray-600">
                採用先進的數據加密技術，確保患者隱私和醫療數據的安全性
              </p>
            </div>
          </div>

          {/* 登錄/註冊區域 */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentView === 'login' ? '開始使用' : '創建賬戶'}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentView === 'login' ? '登錄或註冊您的賬戶' : '註冊新的用戶賬戶'}
                </p>
              </div>

              <div className="flex mb-6">
                <button
                  onClick={switchToLogin}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                    currentView === 'login'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  登錄
                </button>
                <button
                  onClick={switchToRegister}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    currentView === 'register'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  註冊
                </button>
              </div>

              {currentView === 'login' ? (
                <div>
                  <LoginForm onLogin={handleLogin} />
                </div>
              ) : (
                <div>
                  <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 