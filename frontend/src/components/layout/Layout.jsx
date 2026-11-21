import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Search, Bell, User, LogOut,
  Menu, X, ChevronDown, Settings, FileText,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';
import EmailVerificationNotice from './EmailVerificationNotice.jsx';

const NAV_LINKS = [
  { to: '/search', label: 'فحص جهاز', icon: Search },
  { to: '/plans',  label: 'الخطط' },
  { to: '/about',  label: 'من نحن' },
  { to: '/faq',    label: 'مساعدة' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };
  const isActive = (path) =>
    location.pathname === path
      ? 'text-primary-700 font-semibold'
      : 'text-gray-600 hover:text-primary-700';

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#e7e4dc] bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/Logo.png" alt="CheckMyDevice" className="w-9 h-9 object-contain rounded-xl" />
              <span className="font-bold text-primary-700 text-lg hidden sm:block">CheckMyDevice</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1 text-sm transition-colors ${isActive(to)}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop right section */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {/* Admin badge */}
                  {isAdmin() && (
                    <Link to="/admin"
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold hover:bg-red-200 transition-colors">
                      لوحة الإدارة
                    </Link>
                  )}

                  {/* Notifications */}
                  <Link to="/notifications"
                    className={`p-2 rounded-xl hover:bg-gray-100 transition-colors relative ${isActive('/notifications')}`}>
                    <Bell className="w-5 h-5" />
                  </Link>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(p => !p)}
                      aria-expanded={userMenuOpen}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-700" />
                      </div>
                      <span className="hidden lg:block max-w-[120px] truncate">
                        {user.full_name || user.email}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <>
                        {/* backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-400">مسجل كـ</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          </div>
                          {[
                            { to: '/dashboard',  label: 'لوحة التحكم',   icon: User },
                            { to: '/reports',    label: 'بلاغاتي',        icon: FileText },
                            { to: '/profile',    label: 'الإعدادات',      icon: Settings },
                          ].map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Icon className="w-4 h-4 text-gray-400" />
                              {label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut className="w-4 h-4" />
                              تسجيل الخروج
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"    className="btn-outline py-2 px-4 text-sm">دخول</Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm">تسجيل مجاني</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 rounded-xl hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div id="mobile-navigation" role="navigation" aria-label="القائمة الرئيسية"
              className="fade-in mb-3 mt-2 space-y-1 rounded-2xl border border-[#e7e4dc] bg-[#f7f6f2] p-2 shadow-sm md:hidden">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
                    ${location.pathname === to ? 'bg-white font-semibold text-primary-700' : 'text-gray-700 hover:bg-white hover:text-primary-700'}`}
                  onClick={() => setMenuOpen(false)}>
                  {Icon && <Icon className="h-4 w-4 text-primary-700" aria-hidden="true" />}
                  {label}
                </Link>
              ))}
              <div className="mt-2 border-t border-[#e7e4dc] pt-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-white" onClick={() => setMenuOpen(false)}>لوحة التحكم</Link>
                    <Link to="/reports" className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-white" onClick={() => setMenuOpen(false)}>بلاغاتي</Link>
                    <Link to="/profile" className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-white" onClick={() => setMenuOpen(false)}>الإعدادات</Link>
                    {isAdmin() && <Link to="/admin" className="block min-h-11 rounded-xl px-3 py-2.5 text-sm text-primary-700 transition-colors hover:bg-white" onClick={() => setMenuOpen(false)}>لوحة الإدارة</Link>}
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 text-right text-sm text-red-600 transition-colors hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link to="/login"    className="btn-outline py-2 px-4 text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>دخول</Link>
                    <Link to="/register" className="btn-primary py-2 px-4 text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>تسجيل</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Page content ───────────────────────────────────────── */}
      <main className="flex-1 bg-[#f7f6f2]">
        <EmailVerificationNotice />
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-[#e7e4dc] bg-[#f0eee7] text-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">

          {/* Main row: brand + 3 link columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <img src="/Logo.png" alt="CheckMyDevice" className="h-7 w-7 rounded-lg object-contain" />
                <span className="text-lg font-bold text-primary-900">CheckMyDevice</span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-gray-600">
                منصة عربية تساعدك على مراجعة معلومات الجهاز والبلاغات المتاحة قبل الشراء.
              </p>
              <a href="mailto:support@checkmydevice.online"
                className="text-xs text-primary-700 transition-colors hover:text-accent-500" dir="ltr">
                support@checkmydevice.online
              </a>
            </div>

            {/* خدمات */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-primary-900">الخدمات</h4>
              <ul className="space-y-2">
                {[
                  { to: '/search',      label: 'فحص جهاز' },
                  { to: '/reports/new', label: 'الإبلاغ عن جهاز' },
                  { to: '/plans',       label: 'الخطط والأسعار' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-600 transition-colors hover:text-primary-700">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* الشركة */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-primary-900">الشركة</h4>
              <ul className="space-y-2">
                {[
                  { to: '/about',   label: 'من نحن' },
                  { to: '/contact', label: 'تواصل معنا' },
                  { to: '/faq',     label: 'الأسئلة الشائعة' },
                  { to: '/blog',    label: 'المدونة' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-600 transition-colors hover:text-primary-700">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* قانوني */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-primary-900">قانوني</h4>
              <ul className="space-y-2">
                {[
                  { to: '/privacy', label: 'سياسة الخصوصية' },
                  { to: '/terms',   label: 'شروط الاستخدام' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-600 transition-colors hover:text-primary-700">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Blog strip — compact horizontal row */}
          <div className="mb-6 border-t border-[#dedbd2] pt-6">
            <p className="mb-3 text-xs font-medium text-accent-500">من المدونة</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { to: '/blog/free-imei-check',            label: 'فحص IMEI مجاني' },
                { to: '/blog/how-to-check-stolen-phone',  label: 'كيف أعرف أن الهاتف مسروق؟' },
                { to: '/blog/what-to-do-if-phone-stolen', label: 'سُرق هاتفي — ماذا أفعل؟' },
                { to: '/blog/what-to-do-if-phone-lost',   label: 'ضاع هاتفي — ماذا أفعل؟' },
                { to: '/blog/how-to-report-stolen-phone', label: 'كيف أبلغ عن هاتف مسروق؟' },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="text-xs text-gray-600 transition-colors hover:text-primary-700">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#dedbd2] pt-5 text-xs text-gray-500 sm:flex-row">
            <span>© 2026 CheckMyDevice — جميع الحقوق محفوظة</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="transition-colors hover:text-primary-700">الخصوصية</Link>
              <Link to="/terms"   className="transition-colors hover:text-primary-700">الشروط</Link>
              <Link to="/contact" className="transition-colors hover:text-primary-700">تواصل</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
