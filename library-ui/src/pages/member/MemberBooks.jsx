import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import '../dashboard/Dashboard.css';

export default function MemberBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [borrowing, setBorrowing] = useState(null);
  const [dueDate, setDueDate] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
      const res = await api.get('/books/');
      setBooks(res.data.results || res.data);
    } catch {
      setError('Failed to load books.');
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleBorrow = async (e) => {
    e.preventDefault();
    clearMessages();
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api.post('/transactions/', {
        user: user.id,
        book: borrowing,
        borrow_date: today,
        due_date: dueDate,
        status: 'borrowed',
      });
      setSuccess('Book borrowed successfully!');
      setBorrowing(null);
      setDueDate('');
      fetchBooks();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().slice(0, 10);

  return (
    <>
      <div className="page-header">
        <h1>Available Books</h1>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {borrowing && (
        <form className="inline-form" onSubmit={handleBorrow}>
          <h3>Borrow Book</h3>
          <p>Select a due date for returning the book.</p>
          <label>Due Date <input type="date" min={minDueDate} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Confirm Borrow</button>
            <button type="button" className="btn" onClick={() => setBorrowing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Available</th><th></th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author_name}</td>
              <td>{b.isbn}</td>
              <td>{b.available_copies} / {b.total_copies}</td>
              <td>
                {b.available_copies > 0 && (
                  <button className="btn btn-sm btn-primary" onClick={() => { clearMessages(); setBorrowing(b.id); }}>
                    Borrow
                  </button>
                )}
              </td>
            </tr>
          ))}
          {books.length === 0 && <tr><td colSpan="5" className="empty">No books available.</td></tr>}
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
