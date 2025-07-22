import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Companies from './pages/Companies';
import Sectors from './pages/Sectors';
import TicketTypes from './pages/TicketTypes';
import TicketHistory from './pages/TicketHistory';
import Notes from './pages/Notes';
import PasswordManager from './pages/PasswordManager';
import Tickets from './pages/Tickets';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.funcao)) {
    return <Navigate to="/tickets" replace />;
  }
  
  return <>{children}</>;
};

const SupervisorRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user?.funcao === 'supervisor') {
    return <Navigate to="/tickets" replace />;
  }
  
  return <Dashboard />;
};

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route index element={<SupervisorRedirect />} />
          <Route path="categories" element={
            <ProtectedRoute roles={['administrador', 'usuario']}>
              <Categories />
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute roles={['administrador', 'usuario']}>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="calendar" element={
            <ProtectedRoute roles={['administrador', 'usuario', 'estagiario']}>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute roles={['administrador']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="notes" element={
            <ProtectedRoute roles={['administrador', 'usuario', 'estagiario']}>
              <Notes />
            </ProtectedRoute>
          } />
          <Route path="password-manager" element={
            <ProtectedRoute roles={['administrador', 'usuario', 'estagiario']}>
              <PasswordManager />
            </ProtectedRoute>
          } />
          <Route path="tickets" element={<Tickets />} />
          <Route path="users" element={
            <ProtectedRoute roles={['administrador']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="companies" element={
            <ProtectedRoute roles={['administrador']}>
              <Companies />
            </ProtectedRoute>
          } />
          <Route path="sectors" element={
            <ProtectedRoute roles={['administrador']}>
              <Sectors />
            </ProtectedRoute>
          } />
          <Route path="ticket-types" element={
            <ProtectedRoute roles={['administrador']}>
              <TicketTypes />
            </ProtectedRoute>
          } />
          <Route path="ticket-history" element={
            <ProtectedRoute roles={['administrador']}>
              <TicketHistory />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
};

const PublicApp = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicApp />} />
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;