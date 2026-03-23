import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import './Dashboard.css';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '' });

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await api.get('/authors/');
      setAuthors(res.data.results || res.data);
    } catch {
      setError('Failed to load authors.');
    }
  }, []);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ name: '', bio: '' });
    setShowForm(true);
  };

  const openEdit = (author) => {
    clearMessages();
    setEditing(author.id);
    setForm({ name: author.name, bio: author.bio });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      if (editing) {
        await api.put(`/authors/${editing}/`, form);
        setSuccess('Author updated.');
      } else {
        await api.post('/authors/', form);
        setSuccess('Author created.');
      }
      setShowForm(false);
      fetchAuthors();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleDelete = async (id) => {
    clearMessages();
    try {
      await api.delete(`/authors/${id}/`);
      setSuccess('Author deleted.');
      fetchAuthors();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Authors</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Author</button>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Author' : 'New Author'}</h3>
          <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Bio <textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Bio</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.bio || '—'}</td>
              <td className="actions">
                <button className="btn btn-sm" onClick={() => openEdit(a)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {authors.length === 0 && <tr><td colSpan="3" className="empty">No authors found.</td></tr>}
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
