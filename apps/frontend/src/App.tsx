
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { GroupsPage } from "./features/dashboard/pages/GroupsPage";
import { RefreshmentPage } from "./features/dashboard/pages/RefreshmentPage";
import { SessionsPage } from "./features/dashboard/pages/SessionsPage";
import { StudyPage } from "./features/dashboard/pages/StudyPage";
import { AIFeaturesPage } from "./features/study/AIFeaturesPage";
import TimetablePage from "./features/schedule/TimetablePage";
import { MockInterviewPage } from "./features/interview/pages/MockInterviewPage";
import { InterviewHistoryPage } from "./features/interview/pages/InterviewHistoryPage";
import CareerAnalyzerPage from "./features/career/CareerAnalyzerPage";
import SkillAssessmentPage from "./features/career/SkillAssessmentPage";
import { StudyMatcherPage } from "./features/study/StudyMatcherPage";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/study"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sessions"
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-tools"
          element={
            <ProtectedRoute>
              <AIFeaturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/refreshment"
          element={
            <ProtectedRoute>
              <RefreshmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/timetable"
          element={
            <ProtectedRoute>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/interview"
          element={
            <ProtectedRoute>
              <MockInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/interview/history"
          element={
            <ProtectedRoute>
              <InterviewHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/career"
          element={
            <ProtectedRoute>
              <CareerAnalyzerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/career/assessment"
          element={
            <ProtectedRoute>
              <SkillAssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/study-matcher"
          element={
            <ProtectedRoute>
              <StudyMatcherPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
