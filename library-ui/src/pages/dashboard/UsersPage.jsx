import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', role: 'member', status: 'active' });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data.results || res.data);
    } catch {
      setError('Failed to load users.');
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ username: '', email: '', first_name: '', last_name: '', password: '', role: 'member', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (u) => {
    clearMessages();
    setEditing(u.id);
    setForm({ username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name, password: '', role: u.role, status: u.status });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      if (editing) {
        const payload = { ...form };
        delete payload.password; // don't send password on edit
        await api.put(`/users/${editing}/`, payload);
        setSuccess('User updated.');
      } else {
        await api.post('/users/', form);
        setSuccess('User created.');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleDelete = async (id) => {
    clearMessages();
    try {
      await api.delete(`/users/${id}/`);
      setSuccess('User deleted.');
      fetchUsers();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit User' : 'New User'}</h3>
          <label>Username <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
          <label>Email <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>First Name <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
          <label>Last Name <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
          {!editing && <label>Password <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>}
          <label>Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Username</th><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
              <td>{u.status}</td>
              <td className="actions">
                <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                {u.id !== currentUser?.id && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan="6" className="empty">No users found.</td></tr>}
        </tbody>
      </table>
      </div>
    </>
  );
}

function formatError(err) {
  const d = err.response?.data?.details || err.response?.data;
  if (typeof d === 'string') return d;
  if (d?.detail) return d.detail;
  if (typeof d === 'object') {
    return Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
  }
  return 'An error occurred.';
}
