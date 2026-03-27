'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, Calendar, TrendingUp, TrendingDown, 
  Wallet, LayoutList, ArrowRight 
} from 'lucide-react';
import PaymentModal from '@/frontend/components/PaymentModal';
import styles from './page.module.css';

export default function Dashboard() {
  const [data, setData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counts, setCounts] = useState({ cards: 0, dues: 0 });

  const fetchData = async () => {
    try {
      const txRes = await fetch('/api/transactions?t=' + Date.now(), { cache: 'no-store' });
      const txJson = await txRes.json();
      setData(txJson);

      const cardRes = await fetch('/api/cards?t=' + Date.now(), { cache: 'no-store' });
      const cardJson = await cardRes.json();
      
      const dueRes = await fetch('/api/dues?t=' + Date.now(), { cache: 'no-store' });
      const dueJson = await dueRes.json();

      setCounts({
        cards: cardJson.length,
        dues: dueJson.filter(d => d.status === 'Pending').length
      });
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className={styles.loading}>Loading Engine...</div>;

  const income = data.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = data.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const isNegative = data.balance < 0;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>Dashboard</h1>
          </div>
          <p className={styles.subTitle}>Financial summary for this month</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
            <CreditCard size={16} /> Make Payment
          </button>
          <Link href="/dashboard/transactions" className={styles.btnSecondary} style={{textDecoration: 'none'}}>
            Manage Transactions
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>Total Income</p>
            <h2>₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className={styles.iconGreen}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>Total Expense</p>
            <h2>₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className={styles.iconRed}>
            <TrendingDown size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>Net Balance</p>
            <h2>₹{data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className={styles.iconPurple}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      <div className={styles.middleGrid} style={{ marginBottom: 24 }}>
        <div className={styles.summaryPanel}>
          <div className={styles.panelHeader}>
            <LayoutList size={18} color="var(--accent-color)" /> Quick Summary
          </div>
          
          <Link href="/dashboard/cards" style={{ textDecoration: 'none' }}>
            <div className={styles.summaryWidget}>
              <div className={styles.iconPurple}>
                <CreditCard size={20} />
              </div>
              <p>Total Cards: {counts.cards}</p>
            </div>
          </Link>

          <Link href="/dashboard/dues" style={{ textDecoration: 'none' }}>
            <div className={styles.summaryWidget}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: 10, borderRadius: 8 }}>
                <Calendar size={20} />
              </div>
              <p>Upcoming Dues: {counts.dues}</p>
            </div>
          </Link>
        </div>

        <div className={styles.healthPanel}>
          <div className={styles.panelHeader}>
            <TrendingUp size={18} color="var(--accent-color)" /> Financial Health
          </div>

          <p className={styles.healthText}>
            "Your net balance for this month is {isNegative ? 'negative' : 'positive'}."
          </p>

          <div className={styles.tipBox}>
            <h4>Tip</h4>
            <p>Track your expenses daily to stay on top of your financial goals and avoid over-spending on Dues.</p>
            <Link href="/dashboard/profile" className={styles.tipLink}>View detailed analytics <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>

      <div className={styles.summaryPanel} style={{ marginBottom: 24 }}>
        <div className={styles.panelHeader} style={{ marginBottom: 16 }}>
          <LayoutList size={18} color="var(--accent-color)" /> Recent Activity (Updated)
        </div>
        {data.transactions.length === 0 ? (
          <p className={styles.healthText}>No records. Simulate a payment to start.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.transactions.slice(0, 5).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: tx.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)', padding: 8, borderRadius: 8, color: tx.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </main>
  );
}
