import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import i18n from '../utils/i18n'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import PatientMenuPage from '../pages/PatientMenuPage.jsx'
import PatientMeasurementPage from '../pages/PatientMeasurementPage.jsx'
import PatientMeasurementHistoryPage from '../pages/PatientMeasurementHistoryPage.jsx'
import PatientMeasurementResultPage from '../pages/PatientMeasurementResultPage.jsx'
import PatientDiagnosesPage from '../pages/PatientDiagnosesPage.jsx'
import MedicalStaffPage from '../pages/MedicalStaffPage.jsx'
import MedicalPatientsPage from '../pages/MedicalPatientsPage.jsx'
import DiagnosisPage from '../pages/DiagnosisPage.jsx'
import AbnormalDataSettingsPage from '../pages/AbnormalDataSettingsPage.jsx'
import CovidManagementPage from '../pages/CovidManagementPage.jsx'
import CovidDiagnosisFormPage from '../pages/CovidDiagnosisFormPage.jsx'

import PatientCovidAssessmentPage from '../pages/PatientCovidAssessmentPage.jsx'
import PatientCovidAssessmentHistoryPage from '../pages/PatientCovidAssessmentHistoryPage.jsx'
import PatientCovidAssessmentResultPage from '../pages/PatientCovidAssessmentResultPage.jsx'
import PatientDiagnosisReportsPage from '../pages/PatientDiagnosisReportsPage.jsx'
import PatientDiagnosisReportDetailPage from '../pages/PatientDiagnosisReportDetailPage.jsx'
import PatientCovidDiagnosisReportDetailPage from '../pages/PatientCovidDiagnosisReportDetailPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import MedicalGuidancePage from '../pages/MedicalGuidancePage.jsx'
import MedicalDiagnosisPage from '../pages/MedicalDiagnosisPage.jsx'
import MedicalDiagnosisFormPage from '../pages/MedicalDiagnosisFormPage.jsx'
import PatientDetailPage from '../pages/PatientDetailPage.jsx'
import ConfirmDialogTestPage from '../pages/ConfirmDialogTestPage.jsx'
import ImagePreviewTestPage from '../pages/ImagePreviewTestPage.jsx'

export default function AppRouter() {
  // 监听语言变化并更新页面标题
  useEffect(() => {
    const updatePageTitle = () => {
      document.title = i18n.t('app.page_title')
    }
    
    // 初始设置标题
    updatePageTitle()
    
    // 监听语言变化
    i18n.addListener(updatePageTitle)
    
    // 清理监听器
    return () => {
      i18n.removeListener(updatePageTitle)
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* 默认路由重定向到登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 注册页面 */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 患者页面 */}
        <Route path="/patient" element={<PatientMenuPage />} />
        <Route path="/patient/measurement" element={<PatientMeasurementPage />} />
        <Route path="/patient/measurement/result" element={<PatientMeasurementResultPage />} />
        <Route path="/patient/measurement/history" element={<PatientMeasurementHistoryPage />} />
        <Route path="/patient/diagnoses" element={<PatientDiagnosesPage />} />
        <Route path="/patient/diagnosis-reports" element={<PatientDiagnosisReportsPage />} />
        <Route path="/patient/diagnosis-reports/:reportId" element={<PatientDiagnosisReportDetailPage />} />
        <Route path="/patient/coviddiagnosis-reports/:reportId" element={<PatientCovidDiagnosisReportDetailPage />} />
        <Route path="/patient/covid-assessment" element={<PatientCovidAssessmentPage />} />
        <Route path="/patient/covid-assessment/result" element={<PatientCovidAssessmentResultPage />} />
        <Route path="/patient/covid-assessment/history" element={<PatientCovidAssessmentHistoryPage />} />
        
        {/* 医护人员页面 */}
        <Route path="/medical" element={<MedicalStaffPage />} />
                                              <Route path="/medical/covid-management" element={<CovidManagementPage />} />
              <Route path="/medical/covid-management/details" element={<CovidDiagnosisFormPage />} />
              <Route path="/medical/patients-management" element={<MedicalPatientsPage />} />
        <Route path="/medical/patients-management/details" element={<PatientDetailPage />} />
        <Route path="/medical/guidance" element={<MedicalGuidancePage />} />
        <Route path="/medical/diagnosis" element={<MedicalDiagnosisPage />} />
        <Route path="/medical/diagnosis/form" element={<MedicalDiagnosisFormPage />} />
        <Route path="/medical/abnormal-settings" element={<AbnormalDataSettingsPage />} />
        
        {/* 诊断页面 */}
        <Route path="/diagnosis/:patientId" element={<DiagnosisPage />} />
        
        {/* 测试页面 */}
        <Route path="/test/confirm-dialog" element={<ConfirmDialogTestPage />} />
        <Route path="/test/image-preview" element={<ImagePreviewTestPage />} />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
} 