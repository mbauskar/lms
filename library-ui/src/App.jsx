import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import BooksPage from './pages/dashboard/BooksPage';
import AuthorsPage from './pages/dashboard/AuthorsPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import UsersPage from './pages/dashboard/UsersPage';
import MemberBooks from './pages/member/MemberBooks';
import MemberTransactions from './pages/member/MemberTransactions';
import './App.css';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'member'
    ? <Navigate to="/member" replace />
    : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin / Librarian routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <Layout><BooksPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/authors" element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <Layout><AuthorsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/transactions" element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <Layout><TransactionsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/users" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><UsersPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Member routes */}
          <Route path="/member" element={
            <ProtectedRoute roles={['member']}>
              <Layout><MemberBooks /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/member/transactions" element={
            <ProtectedRoute roles={['member']}>
              <Layout><MemberTransactions /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
