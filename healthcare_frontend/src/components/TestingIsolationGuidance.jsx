import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  TestTube, 
  Home, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Heart,
  Info,
  Stethoscope,
  Activity
} from 'lucide-react'

export default function TestingIsolationGuidance({ riskLevel = 'medium', assessmentResult, user }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 页面标题 - 参考医疗人员页面样式 */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
          檢測和隔離指導
        </h2>
        <p className="text-gray-700/80 text-lg">
          基於風險評估的專業建議
        </p>
      </div>

      {/* 1. 检测建议 */}
      <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-blue-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/30">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                檢測建議
              </h3>
              <p className="text-blue-700/70 mt-1">
                根據風險等級提供的檢測建議
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
              <Clock className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800 font-medium">
                建議在48小時內進行檢測
              </AlertDescription>
            </Alert>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-blue-800 mb-4 text-lg">推薦檢測方案</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">立即進行PCR檢測</span>
                    <p className="text-sm text-blue-700/70 mt-1">最準確的檢測方法，適用於確診和接觸者篩查</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">考慮快速抗原檢測作為補充</span>
                    <p className="text-sm text-blue-700/70 mt-1">快速獲得結果，適用於日常篩查</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">建議連續檢測3-5天</span>
                    <p className="text-sm text-blue-700/70 mt-1">確保檢測結果的準確性和及時性</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 隔离指导 */}
      <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-green-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl shadow-green-500/30">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                隔離指導
              </h3>
              <p className="text-green-700/70 mt-1">
                隔離期間的注意事項和預防措施
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                隔離期間
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">標準</Badge>
                  <span className="text-green-800">居家隔離5-7天</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">高風險</Badge>
                  <span className="text-green-800">隔離10-14天</span>
                </div>
                <p className="text-sm text-green-700/70 mt-2">
                  具體隔離期間需根據檢測結果和症狀嚴重程度調整
                </p>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                預防措施
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">減少外出和社交活動</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">必要外出時佩戴N95口罩</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">保持房間通風良好</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">與家人保持適當距離</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 症状监测 */}
      <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-purple-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl shadow-purple-500/30">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                症狀監測
              </h3>
              <p className="text-purple-700/70 mt-1">
                隔離期間需要密切關注的症狀和體徵
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                如出現緊急症狀，請立即就醫或撥打120
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-purple-800 mb-4 text-lg">每日監測項目</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">體溫測量</span>
                      <p className="text-xs text-purple-700/70">每天早晚各一次</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">症狀記錄</span>
                      <p className="text-xs text-purple-700/70">詳細記錄症狀變化</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">血氧監測</span>
                      <p className="text-xs text-purple-700/70">如有血氧儀請每日監測</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-red-800 mb-4 text-lg">緊急就醫指標</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">呼吸困難或胸悶</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">持續高燒超過39°C</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">血氧飽和度低於95%</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">意識模糊或嗜睡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 康复指导 */}
      <div className="bg-gradient-to-br from-teal-50/80 to-teal-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-teal-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl shadow-teal-500/30">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                康復指導
              </h3>
              <p className="text-teal-700/70 mt-1">
                康復期間的注意事項和返回正常生活的建議
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-teal-800 mb-4 text-lg">康復標準</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">無發燒症狀至少24小時</span>
                    <p className="text-xs text-teal-700/70">體溫正常且穩定</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">其他症狀明顯改善</span>
                    <p className="text-xs text-teal-700/70">咳嗽、乏力等症狀減輕</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">連續兩次檢測陰性</span>
                    <p className="text-xs text-teal-700/70">間隔24小時的檢測結果</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-teal-800 mb-4 text-lg">康復建議</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">逐漸恢復日常活動</span>
                    <p className="text-xs text-teal-700/70">避免劇烈運動</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">保持充足休息</span>
                    <p className="text-xs text-teal-700/70">確保充足的睡眠時間</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">繼續佩戴口罩</span>
                    <p className="text-xs text-teal-700/70">外出時至少7天</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">定期複檢</span>
                    <p className="text-xs text-teal-700/70">如有不適及時就醫</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 专业提醒 */}
      <div className="mt-12">
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-emerald-500/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 mr-6 mt-1 flex-shrink-0">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                  專業提醒
                </h3>
                <ul className="text-emerald-800/90 space-y-3">
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      本指導僅供參考，具體治療方案請遵循醫生建議
                    </span>
                  </li>
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      如有任何疑問或緊急情況，請立即聯繫醫療機構
                    </span>
                  </li>
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      請根據最新的衛生部門指導原則調整防護措施
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

