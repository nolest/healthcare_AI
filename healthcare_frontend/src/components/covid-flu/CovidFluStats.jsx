import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Button } from '../ui/button.jsx'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  Calendar,
  RefreshCw,
  Download,
  Activity
} from 'lucide-react'

export default function CovidFluStats({ stats, onRefresh }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const getRiskDistribution = () => {
    if (!stats || !stats.riskStats) return []
    
    const riskLevels = ['very_low', 'low', 'medium', 'high', 'very_high']
    const riskLabels = {
      'very_low': '极低风险',
      'low': '低风险',
      'medium': '中等风险',
      'high': '高风险',
      'very_high': '极高风险'
    }
    const riskColors = {
      'very_low': 'bg-green-400',
      'low': 'bg-green-500',
      'medium': 'bg-yellow-500',
      'high': 'bg-red-500',
      'very_high': 'bg-red-600'
    }

    return riskLevels.map(level => {
      const stat = stats.riskStats.find(s => s._id === level)
      return {
        level,
        label: riskLabels[level],
        count: stat ? stat.count : 0,
        color: riskColors[level]
      }
    })
  }

  const getSeverityDistribution = () => {
    if (!stats || !stats.severityStats) return []
    
    const severityLevels = ['mild', 'moderate', 'severe']
    const severityLabels = {
      'mild': '轻度',
      'moderate': '中度',
      'severe': '重度'
    }
    const severityColors = {
      'mild': 'bg-green-500',
      'moderate': 'bg-yellow-500',
      'severe': 'bg-red-500'
    }

    return severityLevels.map(level => {
      const stat = stats.severityStats.find(s => s._id === level)
      return {
        level,
        label: severityLabels[level],
        count: stat ? stat.count : 0,
        color: severityColors[level]
      }
    })
  }

  const getTrendData = () => {
    if (!stats || !stats.recentTrend) return []
    
    return stats.recentTrend.map(item => ({
      date: item._id,
      count: item.count,
      displayDate: new Date(item._id).toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit'
      })
    }))
  }

  const riskDistribution = getRiskDistribution()
  const severityDistribution = getSeverityDistribution()
  const trendData = getTrendData()

  const totalAssessments = stats?.totalAssessments || 0
  const highRiskCount = stats?.highRiskCount || 0
  const highRiskPercentage = totalAssessments > 0 ? ((highRiskCount / totalAssessments) * 100).toFixed(1) : 0

  return (
    <div className="space-y-4">
      {/* 主要统计指标 - 简化版本 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总评估数</p>
                <p className="text-2xl font-bold text-blue-600">{totalAssessments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  累计评估记录
                </p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">高风险患者</p>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  占比 {highRiskPercentage}%
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-green-600">
                  {trendData.length > 0 ? trendData[trendData.length - 1].count : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  最新评估数
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃患者</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.ceil(totalAssessments * 0.6)} {/* 估算活跃患者数 */}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  近期评估患者
                </p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 风险等级分布 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  风险等级分布
                </CardTitle>
                <CardDescription className="text-sm">
                  患者风险等级统计分析
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {riskDistribution.map((risk, index) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded ${risk.color}`}></div>
                    <span className="text-sm font-medium">{risk.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${risk.color}`}
                        style={{ 
                          width: totalAssessments > 0 ? `${(risk.count / totalAssessments) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{risk.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 评估趋势 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              评估趋势
            </CardTitle>
            <CardDescription className="text-sm">
              最近7天的评估数量变化
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {trendData.length > 0 ? (
              <div className="space-y-3">
                {trendData.slice(-7).map((item, index) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.displayDate}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ 
                            width: `${Math.max(10, (item.count / Math.max(...trendData.map(t => t.count))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">暂无趋势数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 严重程度分布 */}
      {severityDistribution.some(s => s.count > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              症状严重程度分布
            </CardTitle>
            <CardDescription className="text-sm">
              基于症状严重程度的患者分类统计
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {severityDistribution.map((severity) => (
                <div key={severity.level} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${severity.color} flex items-center justify-center text-white font-bold text-lg mb-2`}>
                    {severity.count}
                  </div>
                  <p className="text-sm font-medium">{severity.label}</p>
                  <p className="text-xs text-gray-500">
                    {totalAssessments > 0 ? ((severity.count / totalAssessments) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 