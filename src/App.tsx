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
import { isSupabaseConfigured } from './lib/supabase';
import type { UserRole } from './types';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: UserRole[] }) => {
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

const MissingConfig = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuração necessária</h1>
      <p className="text-gray-600 mb-4">
        As variáveis de ambiente do Supabase não foram encontradas. Crie um arquivo <code className="px-1 bg-gray-100 rounded">.env</code> na
        raiz do projeto (veja <code className="px-1 bg-gray-100 rounded">.env.example</code>) com:
      </p>
      <pre className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 overflow-x-auto">
{`VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave-anon>`}
      </pre>
      <p className="text-gray-500 text-sm mt-4">Depois reinicie o servidor de desenvolvimento.</p>
    </div>
  </div>
);

function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfig />;
  }

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