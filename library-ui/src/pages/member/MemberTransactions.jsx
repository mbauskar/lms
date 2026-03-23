import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api';
import '../dashboard/Dashboard.css';

export default function MemberTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returning, setReturning] = useState(null);
  const confirmRef = useRef(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions/');
      setTransactions(res.data.results || res.data);
    } catch {
      setError('Failed to load your transactions.');
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleReturn = async () => {
    clearMessages();
    try {
      await api.patch(`/transactions/${returning.id}/`, { status: 'returned' });
      setSuccess('Book returned successfully!');
      setReturning(null);
      fetchTransactions();
    } catch (err) {
      setError(formatError(err));
      setReturning(null);
    }
  };

  const openReturnModal = (tx) => {
    clearMessages();
    setReturning(tx);
    setTimeout(() => confirmRef.current?.focus(), 0);
  };

  return (
    <>
      <div className="page-header">
        <h1>My Transactions</h1>
      </div>
      <div className="page-body">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {returning && (
        <div className="modal-overlay" onClick={() => setReturning(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Return Book</h3>
            <p>Are you sure you want to return <strong>Book</strong>?</p>
            <div className="form-actions">
              <button ref={confirmRef} type="button" className="btn btn-primary" onClick={handleReturn}>Confirm Return</button>
              <button type="button" className="btn" onClick={() => setReturning(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.book}</td>
              <td>{t.borrow_date}</td>
              <td>{t.due_date}</td>
              <td>{t.return_date || '—'}</td>
              <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
              <td>{t.fine_amount}</td>
              <td>
                {t.status === 'borrowed' && (
                  <button className="btn btn-sm btn-primary" onClick={() => openReturnModal(t)}>
                    Return
                  </button>
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && <tr><td colSpan="7" className="empty">No transactions yet.</td></tr>}
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
