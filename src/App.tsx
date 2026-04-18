import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import Courses from './pages/Courses';
import Results from './pages/Results';
import Lecturers from './pages/Lecturers';
import AdminDashboard from './pages/AdminDashboard';
import Timetable from './pages/Timetable';
import Announcements from './pages/Announcements';
import Layout from './components/Layout';
import PastPapers from './pages/PastPapers';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply" element={<ProtectedRoute allowedRoles={['applicant']}><Apply /></ProtectedRoute>} />
              <Route path="/timetable" element={<ProtectedRoute allowedRoles={['student', 'admin', 'lecturer']}><Timetable /></ProtectedRoute>} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/courses" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Courses /></ProtectedRoute>} />
              <Route path="/past-papers" element={<ProtectedRoute allowedRoles={['student', 'admin']}><PastPapers /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute allowedRoles={['student', 'admin', 'lecturer']}><Results /></ProtectedRoute>} />
              <Route path="/lecturers" element={<Lecturers />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
