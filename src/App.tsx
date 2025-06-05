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
import InternActivities from './pages/InternActivities';
import InternReview from './pages/InternReview';
import Notes from './pages/Notes';
import Tickets from './pages/Tickets';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={
                <ProtectedRoute roles={['admin', 'user']}>
                  <Categories />
                </ProtectedRoute>
              } />
              <Route path="products" element={
                <ProtectedRoute roles={['admin', 'user']}>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="calendar" element={<Calendar />} />
              <Route path="reports" element={
                <ProtectedRoute roles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="notes" element={<Notes />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="users" element={
                <ProtectedRoute roles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="intern-activities" element={
                <ProtectedRoute roles={['intern']}>
                  <InternActivities />
                </ProtectedRoute>
              } />
              <Route path="intern-review" element={
                <ProtectedRoute roles={['admin']}>
                  <InternReview />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;