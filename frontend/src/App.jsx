import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store.js';

import Layout          from './components/layout/Layout.jsx';
import AdminLayout     from './components/layout/AdminLayout.jsx';
import ProtectedRoute  from './components/layout/ProtectedRoute.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage.jsx'));
const PlansPage = lazy(() => import('./pages/PlansPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const FAQPage = lazy(() => import('./pages/FAQPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

const BlogIndexPage = lazy(() => import('./pages/blog/BlogIndexPage.jsx'));
const FreeImeiCheckPage = lazy(() => import('./pages/blog/FreeImeiCheckPage.jsx'));
const HowToCheckStolenPhonePage = lazy(() => import('./pages/blog/HowToCheckStolenPhonePage.jsx'));
const WhatToDoIfPhoneStolenPage = lazy(() => import('./pages/blog/WhatToDoIfPhoneStolenPage.jsx'));
const WhatToDoIfPhoneLostPage = lazy(() => import('./pages/blog/WhatToDoIfPhoneLostPage.jsx'));
const HowToReportStolenPhonePage = lazy(() => import('./pages/blog/HowToReportStolenPhonePage.jsx'));

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage.jsx'));
const NewReportPage = lazy(() => import('./pages/NewReportPage.jsx'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));
const AdminReportDetail = lazy(() => import('./pages/admin/AdminReportDetail.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminSearch = lazy(() => import('./pages/admin/AdminSearch.jsx'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs.jsx'));

function App() {
  const { init, loading } = useAuthStore();
  useEffect(() => { init(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
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
      <Suspense fallback={<div role="status" className="min-h-[40vh] flex items-center justify-center text-gray-500">جاري تحميل الصفحة...</div>}>
        <Routes>
          {/* ── Public (with Navbar + Footer) ──────────────────── */}
          <Route path="/" element={<Layout />}>
            <Route index                      element={<HomePage />} />
            <Route path="search"              element={<SearchPage />} />
            <Route path="plans"               element={<PlansPage />} />
            <Route path="about"               element={<AboutPage />} />
            <Route path="privacy"             element={<PrivacyPage />} />
            <Route path="terms"               element={<TermsPage />} />
            <Route path="contact"             element={<ContactPage />} />
            <Route path="faq"                 element={<FAQPage />} />

            {/* Blog / SEO articles */}
            <Route path="blog"                       element={<BlogIndexPage />} />
            <Route path="blog/free-imei-check"       element={<FreeImeiCheckPage />} />
            <Route path="blog/how-to-check-stolen-phone" element={<HowToCheckStolenPhonePage />} />
            <Route path="blog/what-to-do-if-phone-stolen" element={<WhatToDoIfPhoneStolenPage />} />
            <Route path="blog/what-to-do-if-phone-lost" element={<WhatToDoIfPhoneLostPage />} />
            <Route path="blog/how-to-report-stolen-phone" element={<HowToReportStolenPhonePage />} />

            {/* Auth */}
            <Route path="login"               element={<LoginPage />} />
            <Route path="register"            element={<RegisterPage />} />
            <Route path="forgot-password"     element={<ForgotPasswordPage />} />
            <Route path="reset-password"      element={<ResetPasswordPage />} />
            <Route path="verify-email"        element={<VerifyEmailPage />} />

            {/* ── Protected user routes ─────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard"         element={<DashboardPage />} />
              <Route path="reports"           element={<MyReportsPage />} />
              <Route path="reports/new"       element={<NewReportPage />} />
              <Route path="reports/:id"       element={<ReportDetailPage />} />
              <Route path="notifications"     element={<NotificationsPage />} />
              <Route path="profile"            element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ── Admin routes (no public Layout) ────────────────── */}
          <Route path="/admin" element={<ProtectedRoute adminOnly />}>
            <Route element={<AdminLayout />}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="reports"         element={<AdminReports />} />
              <Route path="reports/:id"     element={<AdminReportDetail />} />
              <Route path="users"           element={<AdminUsers />} />
              <Route path="search"          element={<AdminSearch />} />
              <Route path="audit-logs"      element={<AdminAuditLogs />} />
              <Route path="profile"         element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ── 404 ────────────────────────────────────────────── */}
          <Route path="/_not-found" element={<NotFoundPage />} />
          <Route path="*"           element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
