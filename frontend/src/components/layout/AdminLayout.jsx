import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, Menu, X, ChevronRight, Settings, Search, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';

const NAV = [
  { to: '/admin',            label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/admin/reports',    label: 'البلاغات',     icon: FileText },
  { to: '/admin/users',      label: 'المستخدمون',   icon: Users },
  { to: '/admin/search',     label: 'بحث IMEI',     icon: Search },
  { to: '/admin/audit-logs', label: 'سجل الأحداث',  icon: ClipboardList, superAdminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);
  const handleLogout = () => { logout(); navigate('/'); closeMobileMenu(); };
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir="rtl">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e7e4dc] bg-[#fcfbf8] px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة الجانبية"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-[#f0eee7]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary-700">لوحة الإدارة</span>
          <img src="/Logo.png" alt="" className="h-7 w-7 object-contain" />
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة الجانبية"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-gray-950/35 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="القائمة الجانبية للإدارة"
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-[#e7e4dc] bg-[#fcfbf8] text-gray-800 shadow-xl transition-all duration-300 md:shadow-none
          ${collapsed ? 'md:w-16' : 'md:w-64'}
          ${mobileOpen ? 'translate-x-0' : 'invisible translate-x-full md:visible md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7e4dc] p-4">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="" className="h-7 w-7 rounded-lg object-contain" />
              <span className="font-bold text-primary-900">إدارة الأجهزة</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            aria-expanded={!collapsed}
            className="mr-auto hidden rounded-lg p-1 text-gray-500 transition-colors hover:bg-[#f0eee7] hover:text-primary-800 md:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 rotate-180"/> : <Menu className="w-5 h-5"/>}
          </button>
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="إغلاق القائمة"
            className="mr-auto rounded-lg p-1 text-gray-500 transition-colors hover:bg-[#f0eee7] hover:text-primary-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.filter(item => !item.superAdminOnly || isSuperAdmin()).map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              onClick={closeMobileMenu}
              aria-label={label}
              aria-current={isActive(to) ? 'page' : undefined}
              title={collapsed && !mobileOpen ? label : undefined}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors
                ${isActive(to)
                  ? 'border-primary-100 bg-primary-50 text-primary-800'
                  : 'border-transparent text-gray-600 hover:bg-[#f0eee7] hover:text-primary-800'}
                ${collapsed && !mobileOpen ? 'md:justify-center md:px-2' : ''}`}>
              <Icon className="h-5 w-5 flex-shrink-0"/>
              {(!collapsed || mobileOpen) && label}
            </Link>
          ))}
        </nav>

        {/* User info + settings + logout */}
        <div className="space-y-1 border-t border-[#e7e4dc] p-3">
          {(!collapsed || mobileOpen) && (
            <div className="mb-2 rounded-xl bg-[#f5f3ee] px-3 py-2 text-xs">
              <div className="truncate font-semibold text-gray-800">{user?.full_name || user?.email}</div>
              <div className="mt-0.5 capitalize text-gray-500">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          <Link to="/admin/profile"
            onClick={closeMobileMenu}
            aria-label="إعدادات الحساب"
            title={collapsed && !mobileOpen ? 'إعدادات الحساب' : undefined}
            aria-current={location.pathname === '/admin/profile' ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
              ${location.pathname === '/admin/profile'
                ? 'bg-primary-50 text-primary-800'
                : 'text-gray-600 hover:bg-[#f0eee7] hover:text-primary-800'}
              ${collapsed && !mobileOpen ? 'md:justify-center md:px-2' : ''}`}>
            <Settings className="w-5 h-5 flex-shrink-0"/>
            {(!collapsed || mobileOpen) && 'إعدادات الحساب'}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="تسجيل الخروج"
            title={collapsed && !mobileOpen ? 'تسجيل الخروج' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700
              ${collapsed && !mobileOpen ? 'md:justify-center md:px-2' : ''}`}>
            <LogOut className="w-5 h-5 flex-shrink-0"/>
            {(!collapsed || mobileOpen) && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`min-w-0 min-h-screen md:transition-[margin] md:duration-300 ${collapsed ? 'md:mr-16' : 'md:mr-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
