import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !['admin', 'super_admin'].includes(user.role))
    return <Navigate to="/" replace />;
  return <Outlet />;
}
