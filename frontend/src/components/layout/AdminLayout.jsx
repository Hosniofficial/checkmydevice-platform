import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, Menu, ChevronRight, Settings, Search, ClipboardList } from 'lucide-react';
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

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-primary-700 text-white flex flex-col transition-all duration-300 fixed h-full z-40`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="CheckMyDevice" className="w-7 h-7 object-contain rounded-lg brightness-0 invert" />
              <span className="font-bold">Admin Panel</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-blue-600 transition-colors mr-auto">
            {collapsed ? <ChevronRight className="w-5 h-5 rotate-180"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.filter(item => !item.superAdminOnly || isSuperAdmin()).map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium
                ${isActive(to) ? 'bg-white text-primary-700' : 'text-blue-100 hover:bg-blue-600'}`}>
              <Icon className="w-5 h-5 flex-shrink-0"/>
              {!collapsed && label}
            </Link>
          ))}
        </nav>

        {/* User info + settings + logout */}
        <div className="p-3 border-t border-blue-600 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 text-xs text-blue-300">
              <div className="font-medium text-white truncate">{user?.full_name || user?.email}</div>
              <div className="capitalize opacity-75">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          <Link to="/admin/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-blue-600 transition-colors text-sm w-full
              ${location.pathname === '/admin/profile' ? 'bg-white/10' : ''}`}>
            <Settings className="w-5 h-5 flex-shrink-0"/>
            {!collapsed && 'إعدادات الحساب'}
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-red-600 transition-colors text-sm w-full">
            <LogOut className="w-5 h-5 flex-shrink-0"/>
            {!collapsed && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${collapsed ? 'mr-16' : 'mr-64'} transition-all duration-300 min-h-screen`}>
        <div className="p-6">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
