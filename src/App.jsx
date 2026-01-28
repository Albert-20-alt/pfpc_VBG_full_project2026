import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const FormPage = React.lazy(() => import('@/pages/FormPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));
const UsersPage = React.lazy(() => import('@/pages/UsersPage'));
const CalendarPage = React.lazy(() => import('@/pages/CalendarPage'));
const CaseManagementPage = React.lazy(() => import('@/pages/Agent/CaseManagementPage'));
const DocumentUploadPage = React.lazy(() => import('@/pages/DocumentUploadPage'));
const SystemSettingsPage = React.lazy(() => import('@/pages/SuperAdmin/SystemSettingsPage'));

const AgentPerformancePage = React.lazy(() => import('@/pages/Admin/AgentPerformancePage'));
const InteractiveMapPage = React.lazy(() => import('@/pages/Admin/InteractiveMapPage'));
const ResourceCenterPage = React.lazy(() => import('@/pages/ResourceCenterPage'));
const AllCasesPage = React.lazy(() => import('@/pages/SuperAdmin/AllCasesPage'));
const RegionalCasesPage = React.lazy(() => import('@/pages/Admin/RegionalCasesPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('@/pages/TermsPage'));
const ContactPage = React.lazy(() => import('@/pages/ContactPage'));
const EditPrivacyPage = React.lazy(() => import('@/pages/SuperAdmin/EditPrivacyPage'));
const EditTermsPage = React.lazy(() => import('@/pages/SuperAdmin/EditTermsPage'));
const TaskManagementPage = React.lazy(() => import('@/pages/SuperAdmin/TaskManagementPage'));
const ContentManagement = React.lazy(() => import('@/pages/SuperAdmin/ContentManagement'));
const MessagesPage = React.lazy(() => import('@/pages/SuperAdmin/MessagesPage'));

const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SettingsProvider>
          <Router>
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>}>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/form" element={
                    <ProtectedRoute>
                      <FormPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/form/upload" element={
                    <ProtectedRoute>
                      <DocumentUploadPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute requiredRole={['super-admin', 'admin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <ResourceCenterPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/agent/cases" element={
                    <ProtectedRoute requiredRole={['agent', 'super-admin', 'admin']}>
                      <CaseManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/all-cases" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <AllCasesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/agents" element={
                    <ProtectedRoute requiredRole="admin">
                      <AgentPerformancePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/map" element={
                    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
                      <InteractiveMapPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/cases" element={
                    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
                      <RegionalCasesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/all-cases" element={
                    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
                      <RegionalCasesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/settings" element={
                    <ProtectedRoute requiredRole={['admin', 'super-admin']}>
                      <SystemSettingsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/superadmin/privacy" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <EditPrivacyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/tasks" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <TaskManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/terms" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <EditTermsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/content" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <ContentManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin/messages" element={
                    <ProtectedRoute requiredRole="super-admin">
                      <MessagesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-white">404 - Page non trouvée</div>} />
                </Routes>
                <Toaster />
              </div>
            </React.Suspense>
          </Router>
        </SettingsProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
