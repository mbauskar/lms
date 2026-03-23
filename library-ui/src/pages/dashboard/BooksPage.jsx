import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import './Dashboard.css';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', total_copies: 0, available_copies: 0 });

  const fetchBooks = useCallback(async () => {
    try {
      const res = await api.get('/books/');
      setBooks(res.data.results || res.data);
    } catch {
      setError('Failed to load books.');
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await api.get('/authors/');
      setAuthors(res.data.results || res.data);
    } catch {
      /* ignore – author dropdown just won't populate */
    }
  }, []);

  useEffect(() => { fetchBooks(); fetchAuthors(); }, [fetchBooks, fetchAuthors]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ title: '', author: '', isbn: '', total_copies: 0, available_copies: 0 });
    setShowForm(true);
  };

  const openEdit = (book) => {
    clearMessages();
    setEditing(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      if (editing) {
        await api.put(`/books/${editing}/`, form);
        setSuccess('Book updated.');
      } else {
        await api.post('/books/', form);
        setSuccess('Book created.');
      }
      setShowForm(false);
      fetchBooks();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleDelete = async (id) => {
    clearMessages();
    try {
      await api.delete(`/books/${id}/`);
      setSuccess('Book deleted.');
      fetchBooks();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Books</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Book</button>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Book' : 'New Book'}</h3>
          <label>Title <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label>Author
            <select value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required>
              <option value="">Select author</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>ISBN <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required /></label>
          <label>Total Copies <input type="number" min="0" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: +e.target.value })} /></label>
          <label>Available Copies <input type="number" min="0" value={form.available_copies} onChange={(e) => setForm({ ...form, available_copies: +e.target.value })} /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Total</th><th>Available</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author_name}</td>
              <td>{b.isbn}</td>
              <td>{b.total_copies}</td>
              <td>{b.available_copies}</td>
              <td className="actions">
                <button className="btn btn-sm" onClick={() => openEdit(b)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {books.length === 0 && <tr><td colSpan="6" className="empty">No books found.</td></tr>}
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
