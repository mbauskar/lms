import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>LMS</h2>
          <span className="role-badge">{user?.role}</span>
        </div>
        <ul className="nav-links">
          {isStaff ? (
            <>
              <li><NavLink to="/dashboard">Books</NavLink></li>
              <li><NavLink to="/dashboard/authors">Authors</NavLink></li>
              <li><NavLink to="/dashboard/transactions">Transactions</NavLink></li>
              {user?.role === 'admin' && (
                <li><NavLink to="/dashboard/users">Users</NavLink></li>
              )}
            </>
          ) : (
            <>
              <li><NavLink to="/member">Books</NavLink></li>
              <li><NavLink to="/member/transactions">My Transactions</NavLink></li>
            </>
          )}
        </ul>
        <div className="sidebar-footer">
          <span className="username">{user?.username}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
