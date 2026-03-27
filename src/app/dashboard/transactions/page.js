'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Calendar } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/transactions?t=' + Date.now(), { cache: 'no-store' });
        const json = await res.json();
        setTransactions(json.transactions);
      } catch (err) { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: 40}}>Loading Ledger...</div>;

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <ArrowRightLeft size={28} color="var(--accent-color)" />
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Transaction Ledger</h1>
      </header>

      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No transactions found. Synthesize one from the Dashboard!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 16px' }}>Date</th>
                <th style={{ padding: '16px 16px' }}>Description</th>
                <th style={{ padding: '16px 16px' }}>Category</th>
                <th style={{ padding: '16px 16px' }}>Method</th>
                <th style={{ padding: '16px 16px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{tx.description}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{tx.category}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{tx.method}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                    {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
