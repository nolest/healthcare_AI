import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Alert, AlertDescription } from '../ui/alert.jsx'
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Heart,
  Thermometer,
  TestTube,
  Home,
  Phone,
  Info
} from 'lucide-react'

export default function CovidFluRecommendations() {
  const covidGuidelines = {
    testing: [
      '出现症状后立即进行PCR检测',
      '高风险接触者应在接触后第5-7天检测',
      '快速抗原检测可作为初步筛查',
      '检测结果阴性但症状持续应重复检测'
    ],
    isolation: [
      '确诊患者应立即隔离至少5天',
      '症状消失且连续24小时无发热方可解除隔离',
      '隔离期间避免与他人共处一室',
      '佩戴N95口罩，保持房间通风'
    ],
    treatment: [
      '轻症患者居家休息，多喝水',
      '发热可使用对乙酰氨基酚或布洛芬',
      '避免使用阿司匹林（18岁以下）',
      '出现呼吸困难立即就医'
    ],
    prevention: [
      '接种COVID-19疫苗和加强针',
      '在公共场所佩戴口罩',
      '保持社交距离，避免聚集',
      '勤洗手，使用酒精消毒剂'
    ]
  }

  const fluGuidelines = {
    testing: [
      '症状出现48小时内进行流感检测',
      '快速流感检测可在诊所进行',
      'PCR检测用于确诊复杂病例',
      '高风险人群应优先检测'
    ],
    isolation: [
      '发热期间应居家隔离',
      '症状消失后24小时方可外出',
      '避免与婴幼儿和老人接触',
      '咳嗽和打喷嚏时遮掩口鼻'
    ],
    treatment: [
      '抗病毒药物在症状开始48小时内最有效',
      '充足休息和水分补充',
      '使用加湿器缓解呼吸道症状',
      '严重症状应及时就医'
    ],
    prevention: [
      '每年接种流感疫苗',
      '流感季节避免拥挤场所',
      '保持良好个人卫生习惯',
      '增强免疫力，均衡饮食'
    ]
  }

  const riskFactorGuidance = {
    high_risk: [
      '65岁以上老年人',
      '慢性心肺疾病患者',
      '糖尿病患者',
      '免疫功能低下者',
      '孕妇'
    ],
    special_care: [
      '密切监测症状变化',
      '及时联系医疗提供者',
      '考虑预防性治疗',
      '避免延误就医时机'
    ]
  }

  return (
    <div className="space-y-6">
      {/* 概述 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            COVID-19 和流感管理指导
          </CardTitle>
          <CardDescription>
            为医护人员提供标准化的评估、诊断和治疗指导方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              以下指导基于WHO、CDC等权威机构的最新建议，请结合实际情况和当地卫生政策执行。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* COVID-19 指导 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            COVID-19 管理指导
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 检测指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <TestTube className="h-4 w-4 text-blue-500" />
              检测建议
            </h4>
            <ul className="space-y-2">
              {covidGuidelines.testing.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 隔离指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Home className="h-4 w-4 text-orange-500" />
              隔离措施
            </h4>
            <ul className="space-y-2">
              {covidGuidelines.isolation.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 治疗指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Heart className="h-4 w-4 text-green-500" />
              治疗建议
            </h4>
            <ul className="space-y-2">
              {covidGuidelines.treatment.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 预防措施 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Shield className="h-4 w-4 text-purple-500" />
              预防措施
            </h4>
            <ul className="space-y-2">
              {covidGuidelines.prevention.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 流感指导 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            流感管理指导
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 检测指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <TestTube className="h-4 w-4 text-blue-500" />
              检测建议
            </h4>
            <ul className="space-y-2">
              {fluGuidelines.testing.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 隔离指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Home className="h-4 w-4 text-orange-500" />
              隔离措施
            </h4>
            <ul className="space-y-2">
              {fluGuidelines.isolation.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 治疗指导 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Heart className="h-4 w-4 text-green-500" />
              治疗建议
            </h4>
            <ul className="space-y-2">
              {fluGuidelines.treatment.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 预防措施 */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Shield className="h-4 w-4 text-purple-500" />
              预防措施
            </h4>
            <ul className="space-y-2">
              {fluGuidelines.prevention.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 高风险人群特殊指导 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            高风险人群特殊指导
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>高风险人群需要特别关注和护理</strong>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">高风险人群包括：</h4>
              <div className="space-y-2">
                {riskFactorGuidance.high_risk.map((item, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">特殊护理要点：</h4>
              <ul className="space-y-2">
                {riskFactorGuidance.special_care.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 紧急联系信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            紧急联系信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">紧急情况联系：</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>急救电话：</strong> 120</li>
                <li><strong>卫生热线：</strong> 12320</li>
                <li><strong>疾控中心：</strong> 当地疾控部门</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">需要立即就医的症状：</h4>
              <ul className="space-y-1 text-sm">
                <li>• 呼吸困难或气促</li>
                <li>• 胸痛或胸闷</li>
                <li>• 意识模糊</li>
                <li>• 持续高热不退</li>
                <li>• 严重脱水</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 