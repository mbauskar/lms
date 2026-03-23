import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import '../dashboard/Dashboard.css';

export default function MemberBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [borrowing, setBorrowing] = useState(null);
  const [borrowingTitle, setBorrowingTitle] = useState('');
  const confirmRef = useRef(null);

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

  const handleBorrow = async () => {
    clearMessages();
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api.post('/transactions/', {
        user: user.id,
        book: borrowing,
        borrow_date: today,
        status: 'borrowed',
      });
      setSuccess('Book borrowed successfully!');
      setBorrowing(null);
      setBorrowingTitle('');
      fetchBooks();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const openBorrowModal = (book) => {
    clearMessages();
    setBorrowing(book.id);
    setBorrowingTitle(book.title);
    setTimeout(() => confirmRef.current?.focus(), 0);
  };

  const closeBorrowModal = () => {
    setBorrowing(null);
    setBorrowingTitle('');
  };

  return (
    <>
      <div className="page-header">
        <h1>Available Books</h1>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {borrowing && (
        <div className="modal-overlay" onClick={closeBorrowModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Borrow Book</h3>
            <p>Are you sure you want to borrow <strong>{borrowingTitle}</strong>?</p>
            <p>The book will be due 7 days after borrowing.</p>
            <div className="form-actions">
              <button ref={confirmRef} type="button" className="btn btn-primary" onClick={handleBorrow}>Confirm Borrow</button>
              <button type="button" className="btn" onClick={closeBorrowModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Author</th><th>ISBN</th><th></th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author_name}</td>
              <td>{b.isbn}</td>
              <td>
                <button className="btn btn-sm btn-primary" onClick={() => openBorrowModal(b)}>
                  Borrow
                </button>
              </td>
            </tr>
          ))}
          {books.length === 0 && <tr><td colSpan="4" className="empty">No books available.</td></tr>}
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
