import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RegisterForm from '../components/RegisterForm.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import { Heart } from 'lucide-react'
import i18n from '../utils/i18n'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    // 监听语言变化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  const handleRegisterSuccess = (user) => {
    // 注册成功后保存用户信息并跳转
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    // 根据用户角色跳转到相应页面
    if (user.role === 'patient') {
      navigate('/patient')
    } else if (user.role === 'medical_staff') {
      navigate('/medical')
    }
  }

  const navigateToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundPosition: '50% 40%',
          animation: 'backgroundMove 20s ease-in-out infinite',
        }}
      ></div>
      
      {/* 添加背景移动动画的CSS */}
      <style>{`
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
      
      {/* 语言切换器 - 固定在右上角 */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* 主要内容 - 垂直滚动布局 */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 系统名称 - 应用登录页样式 */}
          <div className="text-center mb-8 bg-white/10 backdrop-blur-sm rounded-3xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide mb-3">
              {i18n.t('app.title')}
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-2">
              {i18n.t('app.subtitle')}
            </p>
            <p className="text-lg text-gray-700 font-medium leading-relaxed max-w-3xl mx-auto mb-4">
              {i18n.t('auth.create_account')}
            </p>
            
            {/* 注册须知 - 紧凑描述 */}
            <div className="max-w-3xl mx-auto space-y-1 text-sm text-gray-700">
              <p>{i18n.t('auth.register_note1')}</p>
              <p>{i18n.t('auth.register_note2')}</p>
              <p>{i18n.t('auth.register_note3')}</p>
            </div>
          </div>

          {/* 注册卡片 - 居中 */}
          <div className="flex justify-center mb-16">
            <div className="w-full max-w-4xl">
              <div className="bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-500/20 border-0 p-6 relative overflow-hidden">
                {/* 装饰性背景元素 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {i18n.t('auth.register')}
                    </h3>
                    <p className="text-gray-700/80">
                      {i18n.t('auth.register_or_login')}
                    </p>
                  </div>

                  {/* 注册表单 */}
                  <RegisterForm onRegisterSuccess={handleRegisterSuccess} />

                  {/* 登录链接 */}
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      {i18n.t('auth.have_account')}{' '}
                      <button
                        onClick={navigateToLogin}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
                      >
                        {i18n.t('auth.login')}
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
              <p>© 2024 {i18n.t('app.title')}</p>
              <p>{i18n.t('features.professional_diagnosis')} · {i18n.t('features.secure_reliable')} · {i18n.t('features.smart_measurement')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 