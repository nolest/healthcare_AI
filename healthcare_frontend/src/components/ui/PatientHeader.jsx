import { Button } from './button.jsx'
import { Badge } from './badge.jsx'
import { ArrowLeft, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../LanguageSwitcher.jsx'
import apiService from '../../services/api.js'
import i18n from '../../utils/i18n.js'

export default function PatientHeader({ 
  title = "患者中心", 
  subtitle = "", 
  icon: IconComponent = null,
  showBackButton = false,
  backPath = '/patient',
  user = null 
}) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiService.logout()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg shadow-blue-500/10 h-[84px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => navigate(backPath)}
                className="mr-4 bg-white/40 backdrop-blur-sm border-0 hover:bg-white/60 text-gray-600 hover:text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {i18n.t('common.back_to_menu')}
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                {IconComponent ? (
                  <IconComponent className="h-8 w-8 text-white" />
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600/80 truncate">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 语言设置 */}
            <div className="h-11 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden flex items-center">
              <LanguageSwitcher textColor="dark" />
            </div>
            
            {/* 用户信息 */}
            {user && (
              <div 
                className="h-11 flex items-center bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md rounded-2xl px-4 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => navigate('/patient')}
              >
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 group-hover:scale-105 transition-transform duration-300">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-300">
                  {user.fullName || user.username}
                </span>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">患者</Badge>
              </div>
            )}
            
            {/* 登出按钮 */}
            <Button 
              variant="ghost" 
              className="h-11 bg-white/40 backdrop-blur-sm border-0 hover:bg-white/60 text-gray-600 hover:text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl px-4"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">{i18n.t('common.logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 