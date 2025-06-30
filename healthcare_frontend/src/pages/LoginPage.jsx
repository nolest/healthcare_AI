import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { Monitor, Users, Shield } from 'lucide-react'

export default function LoginPage() {
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

  const navigateToRegister = () => {
    navigate('/register')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat animate-pulse"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundPosition: '50% 40%',
          animation: 'backgroundMove 20s ease-in-out infinite',
        }}
      ></div>
      
      {/* 添加背景移动动画的CSS */}
      <style jsx>{`
        @keyframes backgroundMove {
          0% { 
            background-position: 50% 40%;
            transform: scale(1);
          }
          25% { 
            background-position: 52% 38%;
            transform: scale(1.02);
          }
          50% { 
            background-position: 48% 42%;
            transform: scale(1.01);
          }
          75% { 
            background-position: 51% 39%;
            transform: scale(1.03);
          }
          100% { 
            background-position: 50% 40%;
            transform: scale(1);
          }
        }
      `}</style>
      


      {/* 主要内容 - 垂直滚动布局 */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 系统介绍 - 合并标题和描述 */}
          <div className="text-center mb-4 bg-white/10 backdrop-blur-sm rounded-3xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide mb-4">
              Remote Health Care
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-3">
              智能健康管理系統
            </p>
            <p className="text-lg text-gray-700 font-medium leading-relaxed max-w-3xl mx-auto">
              為辦公大樓、機構等場所提供便捷的健康監測服務，結合專業醫護團隊的遠程診斷
            </p>
          </div>

          {/* 特色功能描述 - 移到上方 */}
          <div className="text-center mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                <div className="flex justify-center mb-3">
                  <Monitor className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">智能測量設備</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  配備先進的生命體徵監測設備，支持血壓、心率、體溫、血氧等多項重要指標的精準測量
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                <div className="flex justify-center mb-3">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">專業醫護團隊</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  由經驗豐富的註冊醫護人員組成的專業團隊，提供24小時遠程診斷和健康指導服務
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                <div className="flex justify-center mb-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">數據安全保障</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  採用銀行級加密技術和嚴格的隱私保護措施，確保您的健康數據安全無憂
                </p>
              </div>
            </div>
          </div>

          {/* 登录卡片 - 居中 */}
          <div className="flex justify-center" style={{ marginBottom: '40px' }}>
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-white/90 via-white/85 to-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-500/20 border-0 p-6 relative overflow-hidden">
                {/* 装饰性背景元素 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      歡迎回來
                    </h3>
                    <p className="text-gray-700/80">
                      登錄您的賬戶以繼續使用
                    </p>
                  </div>

                  {/* 登录表单 */}
                  <LoginForm onLogin={handleLogin} />

                  {/* 注册链接 */}
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      還沒有賬戶？{' '}
                      <button
                        onClick={navigateToRegister}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
                      >
                        立即註冊
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center text-sm" style={{ marginTop: '0' }}>
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-white">
              <p>© 2024 Remote Health Care System</p>
              <p>專業 · 安全 · 便捷</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 