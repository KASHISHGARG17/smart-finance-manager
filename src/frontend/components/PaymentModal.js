'use client';

import { useState } from 'react';
import styles from './PaymentModal.module.css';

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    method: 'Credit Card',
    category: 'General',
    amount: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const response = await fetch('/api/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isSandbox: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Simulation failed');
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = () => {
    if (formData.type === 'income') return ['Salary', 'Stock Profits', 'Rental Income', 'Gold Profits', 'Bank Transfer', 'External API'];
    return ['General', 'Online Payment', 'Credit Card Bill', 'Debit Card Auth', 'UPI Transfer', 'Withdrawal', 'Rent', 'Shopping'];
  };

  const methods = ['Debit Card', 'Credit Card', 'UPI', 'Net Banking', 'Cash', 'Wire'];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Simulate Transaction</h2>
        <p className={styles.subtitle}>Log an interaction into your FINANCO tracker</p>
        
        {error && <div style={{background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, marginBottom: 16, borderRadius: 4, fontSize: 13}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.formGroup} style={{marginBottom: 0}}>
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="expense">Expense (Out)</option>
                <option value="income">Income (In)</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{marginBottom: 0}}>
              <label>Amount (USD)</label>
              <input type="number" name="amount" step="0.01" required value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup} style={{marginBottom: 0}}>
              <label>Category / Asset</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {getCategories().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formGroup} style={{marginBottom: 0}}>
              <label>Method</label>
              <select name="method" value={formData.method} onChange={handleChange}>
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Description Note</label>
            <input type="text" name="description" required value={formData.description} onChange={handleChange} placeholder="E.g. Apple Stock Dividend" />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnCancel} disabled={isLoading}>Cancel</button>
            <button type="submit" className={styles.btnPay} disabled={isLoading}>
              {isLoading ? 'Processing...' : `Confirm Run`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
