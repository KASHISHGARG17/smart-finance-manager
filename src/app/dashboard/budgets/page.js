'use client';

import { useState, useEffect } from 'react';
import { PieChart, Plus, Target, BarChart3, Trash2 } from 'lucide-react';
import styles from '../page.module.css';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: 'Food & Dining',
    limit: ''
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const budgetRes = await fetch('/api/budgets?t=' + Date.now(), { cache: 'no-store' });
      const budgetJson = await budgetRes.json();
      setBudgets(budgetJson);

      const txRes = await fetch('/api/transactions?t=' + Date.now(), { cache: 'no-store' });
      const txJson = await txRes.json();
      setTransactions(txJson.transactions);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ category: 'Food & Dining', limit: '' });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      const res = await fetch('/api/budgets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData();
    } catch (err) { }
  };

  const getSpent = (category) => {
    return transactions
      .filter(tx => tx.category === category && tx.type === 'expense')
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  };

  if (loading) return <div className={styles.loading}>Loading Budgets...</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>Categorical Budgets</h1>
          </div>
          <p className={styles.subTitle}>Set spending limits for each category</p>
        </div>
      </header>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Set New Limit</h3>
        <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Food & Dining">Food & Dining</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Monthly Limit (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              required 
              value={formData.limit}
              onChange={e => setFormData({...formData, limit: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Set Budget
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger-color)', fontSize: 13 }}>{error}</p>}
      </section>

      <section>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Active Budget Tracks</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {budgets.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No budgets set yet.</p>
          ) : budgets.map(budget => {
            const spent = getSpent(budget.category);
            const percent = Math.min(Math.round((spent / budget.limit) * 100), 100);
            const isOver = spent > budget.limit;
            
            return (
              <div key={budget.id} className={styles.statCard} style={{ display: 'block', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BarChart3 size={20} color="var(--accent-color)" />
                    <span style={{ fontWeight: 600 }}>{budget.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isOver ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                      {percent}% Spent
                    </span>
                    <button onClick={() => handleDelete(budget.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ 
                    width: `${percent}%`, 
                    height: '100%', 
                    background: isOver ? 'var(--danger-color)' : 'var(--accent-color)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 600 }}>Limit: ₹{budget.limit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
