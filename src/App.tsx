import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { UserDashboard } from './pages/UserDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { NewTicketPage } from './pages/NewTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { AllTicketsPage } from './pages/AllTicketsPage';

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'agent')[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
        <style>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: var(--space-4);
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user.role === 'agent' ? '/agent' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

// Auth Route - Redirect if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
        <style>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: var(--space-4);
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'agent' ? '/agent' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/new-ticket"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <NewTicketPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-tickets"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <MyTicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <Layout>
              <AgentDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tickets"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <Layout>
              <AllTicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketProvider>
          <AppRoutes />
        </TicketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
