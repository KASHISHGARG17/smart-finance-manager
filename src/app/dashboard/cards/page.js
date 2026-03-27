'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Landmark, Trash2 } from 'lucide-react';
import styles from '../page.module.css';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bankName: '',
    cardHolder: '',
    lastFour: '',
    type: 'Debit'
  });
  const [error, setError] = useState('');

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();
      setCards(json);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ bankName: '', cardHolder: '', lastFour: '', type: 'Debit' });
        fetchCards();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    try {
      const res = await fetch('/api/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchCards();
    } catch (err) { }
  };

  if (loading) return <div className={styles.loading}>Loading Accounts...</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>Cards & Bank Accounts</h1>
          </div>
          <p className={styles.subTitle}>Manage your linked financial sources</p>
        </div>
      </header>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18 }}>Add New Source</h3>
        <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className={styles.formGroup}>
            <label>Bank/Entity Name</label>
            <input 
              type="text" 
              placeholder="e.g. HDFC Bank" 
              required 
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Cardholder Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={formData.cardHolder}
              onChange={e => setFormData({...formData, cardHolder: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Last 4 Digits</label>
            <input 
              type="text" 
              placeholder="1234" 
              maxLength="4" 
              required 
              value={formData.lastFour}
              onChange={e => setFormData({...formData, lastFour: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Source Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="Debit">Debit Card</option>
              <option value="Credit">Credit Card</option>
              <option value="Bank Account">Bank Account</option>
              <option value="UPI">UPI Handle</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Add Source
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger-color)', fontSize: 13 }}>{error}</p>}
      </section>

      <section>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Your Linked Accounts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {cards.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No sources linked yet.</p>
          ) : cards.map(card => (
            <div key={card.id} className={styles.statCard} style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                {card.type === 'Bank Account' ? <Landmark size={24} color="var(--accent-color)" /> : <CreditCard size={24} color="var(--accent-color)" />}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                    {card.type}
                  </span>
                  <button onClick={() => handleDelete(card.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: 18, marginBottom: 4 }}>{card.bankName}</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  **** **** **** {card.lastFour}
                </p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{card.cardHolder}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
