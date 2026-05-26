import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InterviewRoom from './pages/InterviewRoom';
import CodingTest from './pages/CodingTest';
import Report from './pages/Report';
import ProfileSettings from './pages/ProfileSettings';

// Private Route wrapper for Candidates
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center text-slate-400">
        <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
        <span className="tech-mono text-xs uppercase tracking-widest animate-pulse">AUTHORIZING_SESSION...</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Private Route wrapper for Admins
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center text-slate-400">
        <span className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2" />
        <span className="tech-mono text-xs uppercase tracking-widest animate-pulse">AUTHORIZING_ADMIN...</span>
      </div>
    );
  }

  return user && user.role === 'admin' ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Candidate Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <CandidateDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/interview/:id" 
            element={
              <PrivateRoute>
                <InterviewRoom />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/coding" 
            element={
              <PrivateRoute>
                <CodingTest />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/report/:id" 
            element={
              <PrivateRoute>
                <Report />
              </PrivateRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
