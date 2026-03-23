import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import './Dashboard.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user: '', book: '', borrow_date: '', due_date: '', return_date: '', status: 'borrowed' });

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions/');
      setTransactions(res.data.results || res.data);
    } catch {
      setError('Failed to load transactions.');
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const [bRes, uRes] = await Promise.all([api.get('/books/'), api.get('/users/')]);
      setBooks(bRes.data.results || bRes.data);
      setUsers(uRes.data.results || uRes.data);
    } catch { /* best effort */ }
  }, []);

  useEffect(() => { fetchTransactions(); fetchMeta(); }, [fetchTransactions, fetchMeta]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openCreate = () => {
    clearMessages();
    const today = new Date().toISOString().slice(0, 10);
    setForm({ user: '', book: '', borrow_date: today, due_date: '', return_date: '', status: 'borrowed' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    const payload = { ...form };
    if (!payload.return_date) delete payload.return_date;
    try {
      await api.post('/transactions/', payload);
      setSuccess('Transaction created.');
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const markReturned = async (tx) => {
    clearMessages();
    try {
      await api.patch(`/transactions/${tx.id}/`, { status: 'returned', return_date: new Date().toISOString().slice(0, 10) });
      setSuccess('Book marked as returned.');
      fetchTransactions();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Transaction</button>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>New Transaction</h3>
          <label>User
            <select value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} required>
              <option value="">Select user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </label>
          <label>Book
            <select value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} required>
              <option value="">Select book</option>
              {books.map((b) => <option key={b.id} value={b.id}>{b.title} (avail: {b.available_copies})</option>)}
            </select>
          </label>
          <label>Borrow Date <input type="date" value={form.borrow_date} onChange={(e) => setForm({ ...form, borrow_date: e.target.value })} required /></label>
          <label>Due Date <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>User</th><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.user}</td>
              <td>{t.book}</td>
              <td>{t.borrow_date}</td>
              <td>{t.due_date}</td>
              <td>{t.return_date || '—'}</td>
              <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
              <td>{t.fine_amount}</td>
              <td className="actions">
                {t.status === 'borrowed' && (
                  <button className="btn btn-sm btn-primary" onClick={() => markReturned(t)}>Return</button>
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && <tr><td colSpan="8" className="empty">No transactions found.</td></tr>}
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
