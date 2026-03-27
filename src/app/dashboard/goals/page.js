'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Trophy, TrendingUp, Trash2 } from 'lucide-react';
import styles from '../page.module.css';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: ''
  });
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();
      setGoals(json);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', targetAmount: '', currentAmount: '' });
        fetchGoals();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchGoals();
    } catch (err) { }
  };

  if (loading) return <div className={styles.loading}>Loading Goals...</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>Financial Saving Goals</h1>
          </div>
          <p className={styles.subTitle}>Set and track your long-term wealth objectives</p>
        </div>
      </header>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>New Saving Goal</h3>
        <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className={styles.formGroup}>
            <label>Goal Name</label>
            <input 
              type="text" 
              placeholder="e.g. New Tesla Model 3" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Target Amount (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              required 
              value={formData.targetAmount}
              onChange={e => setFormData({...formData, targetAmount: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Initial Savings (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={formData.currentAmount}
              onChange={e => setFormData({...formData, currentAmount: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Establish Goal
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger-color)', fontSize: 13 }}>{error}</p>}
      </section>

      <section>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Your Objectives</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {goals.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No goals established yet.</p>
          ) : goals.map(goal => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isCompleted = percent >= 100;
            
            return (
              <div key={goal.id} className={styles.statCard} style={{ display: 'block', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isCompleted ? <Trophy size={22} color="#EAB308" /> : <Target size={22} color="var(--accent-color)" />}
                    <span style={{ fontWeight: 700, fontSize: 18 }}>{goal.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isCompleted ? '#EAB308' : 'var(--accent-color)', background: isCompleted ? 'rgba(234, 179, 8, 0.1)' : 'var(--purple-bg)', padding: '4px 10px', borderRadius: 20 }}>
                      {percent}%
                    </span>
                    <button onClick={() => handleDelete(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ 
                    width: `${percent}%`, 
                    height: '100%', 
                    background: isCompleted ? '#EAB308' : 'linear-gradient(90deg, var(--accent-color), var(--purple-color))',
                    transition: 'width 1s ease'
                  }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Saved</p>
                    <p style={{ fontWeight: 700 }}>₹{goal.currentAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Target</p>
                    <p style={{ fontWeight: 700 }}>₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
