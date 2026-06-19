import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store.js';

import Layout          from './components/layout/Layout.jsx';
import AdminLayout     from './components/layout/AdminLayout.jsx';
import ProtectedRoute  from './components/layout/ProtectedRoute.jsx';

// ── Public pages ──────────────────────────────────────────────────
import HomePage            from './pages/HomePage.jsx';
import SearchPage          from './pages/SearchPage.jsx';
import LoginPage           from './pages/LoginPage.jsx';
import RegisterPage        from './pages/RegisterPage.jsx';
import ForgotPasswordPage  from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage   from './pages/ResetPasswordPage.jsx';
import VerifyEmailPage     from './pages/VerifyEmailPage.jsx';
import PlansPage           from './pages/PlansPage.jsx';
import AboutPage           from './pages/AboutPage.jsx';
import PrivacyPage         from './pages/PrivacyPage.jsx';
import TermsPage           from './pages/TermsPage.jsx';
import ContactPage         from './pages/ContactPage.jsx';
import FAQPage             from './pages/FAQPage.jsx';

// ── Protected user pages ──────────────────────────────────────────
import DashboardPage       from './pages/DashboardPage.jsx';
import MyReportsPage       from './pages/MyReportsPage.jsx';
import NewReportPage       from './pages/NewReportPage.jsx';
import ReportDetailPage    from './pages/ReportDetailPage.jsx';
import NotificationsPage   from './pages/NotificationsPage.jsx';
import ProfilePage         from './pages/ProfilePage.jsx';

// ── Admin pages ───────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/AdminDashboard.jsx';
import AdminReports        from './pages/admin/AdminReports.jsx';
import AdminReportDetail   from './pages/admin/AdminReportDetail.jsx';
import AdminUsers          from './pages/admin/AdminUsers.jsx';
import AdminSearch         from './pages/admin/AdminSearch.jsx';
import AdminAuditLogs      from './pages/admin/AdminAuditLogs.jsx';

function App() {
  const { init, loading } = useAuthStore();
  useEffect(() => { init(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" style={{ width: 44, height: 44 }} />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Cairo, sans-serif', direction: 'rtl', maxWidth: 400 },
          duration: 4000,
          success: { iconTheme: { primary: '#1B4F9B', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ── Public (with Navbar + Footer) ──────────────────── */}
        <Route path="/" element={<Layout />}>
          <Route index                     element={<HomePage />} />
          <Route path="search"             element={<SearchPage />} />
          <Route path="plans"              element={<PlansPage />} />
          <Route path="about"              element={<AboutPage />} />
          <Route path="privacy"            element={<PrivacyPage />} />
          <Route path="terms"              element={<TermsPage />} />
          <Route path="contact"            element={<ContactPage />} />
          <Route path="faq"               element={<FAQPage />} />

          {/* Auth */}
          <Route path="login"              element={<LoginPage />} />
          <Route path="register"           element={<RegisterPage />} />
          <Route path="forgot-password"    element={<ForgotPasswordPage />} />
          <Route path="reset-password"     element={<ResetPasswordPage />} />
          <Route path="verify-email"       element={<VerifyEmailPage />} />

          {/* ── Protected user routes ─────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard"        element={<DashboardPage />} />
            <Route path="reports"          element={<MyReportsPage />} />
            <Route path="reports/new"      element={<NewReportPage />} />
            <Route path="reports/:id"      element={<ReportDetailPage />} />
            <Route path="notifications"    element={<NotificationsPage />} />
            <Route path="profile"          element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── Admin routes (no public Layout) ────────────────── */}
        <Route path="/admin" element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route index                   element={<AdminDashboard />} />
            <Route path="reports"          element={<AdminReports />} />
            <Route path="reports/:id"      element={<AdminReportDetail />} />
            <Route path="users"            element={<AdminUsers />} />
            <Route path="search"           element={<AdminSearch />} />
            <Route path="audit-logs"       element={<AdminAuditLogs />} />
            <Route path="profile"          element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
