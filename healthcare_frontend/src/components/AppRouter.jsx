import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import PatientMenuPage from '../pages/PatientMenuPage.jsx'
import PatientOverviewPage from '../pages/PatientOverviewPage.jsx'
import PatientMeasurementPage from '../pages/PatientMeasurementPage.jsx'
import PatientMeasurementHistoryPage from '../pages/PatientMeasurementHistoryPage.jsx'
import PatientMeasurementResultPage from '../pages/PatientMeasurementResultPage.jsx'
import PatientDiagnosesPage from '../pages/PatientDiagnosesPage.jsx'
import PatientSymptomPage from '../pages/PatientSymptomPage.jsx'
import MedicalStaffPage from '../pages/MedicalStaffPage.jsx'
import MedicalPatientsPage from '../pages/MedicalPatientsPage.jsx'
import MedicalStatisticsPage from '../pages/MedicalStatisticsPage.jsx'
import DiagnosisPage from '../pages/DiagnosisPage.jsx'
import AbnormalDataSettingsPage from '../pages/AbnormalDataSettingsPage.jsx'
import CovidFluManagementPage from '../pages/CovidFluManagementPage.jsx'
import PatientCovidAssessmentPage from '../pages/PatientCovidAssessmentPage.jsx'
import PatientCovidAssessmentHistoryPage from '../pages/PatientCovidAssessmentHistoryPage.jsx'
import PatientCovidAssessmentResultPage from '../pages/PatientCovidAssessmentResultPage.jsx'
import PatientDiagnosisReportsPage from '../pages/PatientDiagnosisReportsPage.jsx'
import PatientDiagnosisReportDetailPage from '../pages/PatientDiagnosisReportDetailPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import MedicalGuidancePage from '../pages/MedicalGuidancePage.jsx'
import MedicalDiagnosisPage from '../pages/MedicalDiagnosisPage.jsx'
import MedicalDiagnosisFormPage from '../pages/MedicalDiagnosisFormPage.jsx'
import PatientDetailPage from '../pages/PatientDetailPage.jsx'

export default function AppRouter() {
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
        <Route path="/patient/overview" element={<PatientOverviewPage />} />
        <Route path="/patient/measurement" element={<PatientMeasurementPage />} />
        <Route path="/patient/measurement/result" element={<PatientMeasurementResultPage />} />
        <Route path="/patient/measurement/history" element={<PatientMeasurementHistoryPage />} />
        <Route path="/patient/diagnoses" element={<PatientDiagnosesPage />} />
        <Route path="/patient/diagnosis-reports" element={<PatientDiagnosisReportsPage />} />
        <Route path="/patient/diagnosis-reports/:reportId" element={<PatientDiagnosisReportDetailPage />} />
        <Route path="/patient/symptoms" element={<PatientSymptomPage />} />
        <Route path="/patient/covid-assessment" element={<PatientCovidAssessmentPage />} />
        <Route path="/patient/covid-assessment/result" element={<PatientCovidAssessmentResultPage />} />
        <Route path="/patient/covid-assessment/history" element={<PatientCovidAssessmentHistoryPage />} />
        
        {/* 医护人员页面 */}
        <Route path="/medical" element={<MedicalStaffPage />} />
        <Route path="/medical/covid-management" element={<CovidFluManagementPage />} />
        <Route path="/medical/patients-management" element={<MedicalPatientsPage />} />
        <Route path="/medical/patients-management/:patientId" element={<PatientDetailPage />} />
        <Route path="/medical/statistics" element={<MedicalStatisticsPage />} />
        <Route path="/medical/guidance" element={<MedicalGuidancePage />} />
        <Route path="/medical/diagnosis" element={<MedicalDiagnosisPage />} />
        <Route path="/medical/diagnosis/form" element={<MedicalDiagnosisFormPage />} />
        <Route path="/medical/abnormal-settings" element={<AbnormalDataSettingsPage />} />
        
        {/* 诊断页面 */}
        <Route path="/diagnosis/:patientId" element={<DiagnosisPage />} />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
} 