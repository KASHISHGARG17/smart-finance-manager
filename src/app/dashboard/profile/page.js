import { cookies } from 'next/headers';
import { verifyAuth } from '@/backend/lib/auth';
import { getCollection } from '@/backend/lib/db';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sfm_token')?.value;
  const userPayload = await verifyAuth(token);
  
  const users = await getCollection('users');
  const user = users.find(u => u.id === userPayload.id);

  if (!user) return <div className={styles.loading}>User not found.</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div className={styles.headerTitle}>
            <h1>User Profile & Analytics</h1>
          </div>
          <p className={styles.subTitle}>Manage your account identity and security</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        <section className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ 
            width: 100, 
            height: 100, 
            background: 'var(--purple-bg)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 40, 
            fontWeight: 800, 
            color: 'var(--purple-color)',
            marginBottom: 24,
            border: '2px solid var(--border-color)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>User Registry: {user.id.split('-')[0]}...</p>
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-color)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <Mail size={18} color="var(--text-secondary)" />
              <span style={{ fontSize: 14 }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-color)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <Shield size={18} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, textTransform: 'capitalize' }}>Access Level: <strong>{user.role}</strong></span>
            </div>
          </div>
        </section>

        <section className={styles.healthPanel} style={{ padding: 32 }}>
          <div className={styles.panelHeader}>
             Security & Sessions
          </div>
          <p className={styles.healthText}>
            Your account is currently protected by JWT-based session management and isolated database collections.
          </p>
          
          <div className={styles.tipBox} style={{ marginTop: 24 }}>
            <h4>Pro Privacy Tip</h4>
            <p>FinTrack never stores your actual bank passwords. We only use simulated identifiers to keep your data structure safe and clean.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
