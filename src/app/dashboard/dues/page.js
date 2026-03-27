'use client';

import { useState, useEffect } from 'react';
import { CalendarClock, Plus, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import styles from '../page.module.css';

export default function DuesPage() {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dueDate: '',
    category: 'Utility'
  });
  const [error, setError] = useState('');

  const fetchDues = async () => {
    try {
      const res = await fetch('/api/dues?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();
      setDues(json);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchDues(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', amount: '', dueDate: '', category: 'Utility' });
        fetchDues();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      const res = await fetch('/api/dues', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchDues();
    } catch (err) { }
  };

  if (loading) return <div className={styles.loading}>Loading Dues...</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>Pending Dues & Bills</h1>
          </div>
          <p className={styles.subTitle}>Track and pay your upcoming obligations</p>
        </div>
      </header>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Schedule New Bill</h3>
        <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className={styles.formGroup}>
            <label>Bill Title</label>
            <input 
              type="text" 
              placeholder="e.g. Electricity Bill" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Amount (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              required 
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Due Date</label>
            <input 
              type="date" 
              required 
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Utility">Utility</option>
              <option value="Rent">Rent</option>
              <option value="Subscription">Subscription</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Loan/EMI">Loan/EMI</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Add Bill
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger-color)', fontSize: 13 }}>{error}</p>}
      </section>

      <section className={styles.tableContainer}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Upcoming Obligations</h3>
        {dues.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No pending dues found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {dues.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map(due => (
                <tr key={due.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <CalendarClock size={14} />
                      {new Date(due.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{due.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{due.category}</td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4,
                      fontSize: 12, 
                      fontWeight: 600,
                      color: 'var(--danger-color)',
                      background: 'var(--danger-bg)',
                      padding: '4px 8px',
                      borderRadius: 6
                    }}>
                      <AlertCircle size={12} /> Pending
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{due.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(due.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
