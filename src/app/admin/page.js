import { getAllUsers, getAllTransactions, initDB } from '@/backend/lib/db';
import { Users, Activity, BarChart3, Database } from 'lucide-react';
import styles from '../dashboard/page.module.css'; 

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await initDB();
  const users = await getAllUsers();
  const transactions = await getAllTransactions();


  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <Database color="var(--accent-color)" size={28} />
            <h1>Admin Control Node</h1>
          </div>
          <p className={styles.subTitle}>Platform-wide operational metrics and registration dataset</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>Total Registrations</p>
            <h2>{users.length.toLocaleString()}</h2>
          </div>
          <div className={styles.iconPurple}>
            <Users size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>System Traffic</p>
            <h2>{transactions.length.toLocaleString()} <span style={{fontSize: 14, color: '#888', fontWeight: 500}}>Events</span></h2>
          </div>
          <div className={styles.iconGreen}>
            <Activity size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p>Platform Valuation Processed</p>
            <h2>₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className={styles.iconRed}>
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      <div className={styles.summaryPanel} style={{ width: '100%', gridColumn: '1 / -1', marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, color: '#fff' }}>Global Registrations Dataset</h3>
        {users.length === 0 ? <p className={styles.healthText}>No users found.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>UUID</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Email Contact</th>
                  <th style={{ padding: '12px 16px' }}>Authority Level</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {u.id.split('-')[0]}***
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: u.role === 'admin' ? 'var(--purple-bg)' : 'transparent',
                        color: u.role === 'admin' ? 'var(--purple-color)' : 'var(--text-secondary)',
                        border: u.role !== 'admin' ? '1px solid var(--border-color)' : 'none',
                        padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
