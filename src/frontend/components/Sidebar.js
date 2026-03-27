'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Building2, LayoutDashboard, BarChart2, ArrowRightLeft, 
  CreditCard, CalendarClock, PieChart, Target, LogIn, Sun, Moon, LogOut
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'));
  }, []);

  const toggleLightMode = () => {
    if (isLight) {
      document.body.classList.remove('light-mode');
      setIsLight(false);
    } else {
      document.body.classList.add('light-mode');
      setIsLight(true);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Building2 color="var(--text-primary)" size={24} />
        <h2>FinTrack</h2>
      </div>

      <div className={styles.navGroup}>
        <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link href="/dashboard/profile" className={`${styles.navItem} ${pathname === '/dashboard/profile' ? styles.active : ''}`}>
          <BarChart2 size={18} /> Analytics
        </Link>
        <Link href="/dashboard/transactions" className={`${styles.navItem} ${pathname === '/dashboard/transactions' ? styles.active : ''}`}>
          <ArrowRightLeft size={18} /> Transactions
        </Link>
        <Link href="/dashboard/cards" className={`${styles.navItem} ${pathname === '/dashboard/cards' ? styles.active : ''}`}>
          <CreditCard size={18} /> Cards
        </Link>
        <Link href="/dashboard/dues" className={`${styles.navItem} ${pathname === '/dashboard/dues' ? styles.active : ''}`}>
          <CalendarClock size={18} /> Dues
        </Link>
        <Link href="/dashboard/budgets" className={`${styles.navItem} ${pathname === '/dashboard/budgets' ? styles.active : ''}`}>
          <PieChart size={18} /> Budgets
        </Link>
        <Link href="/dashboard/goals" className={`${styles.navItem} ${pathname === '/dashboard/goals' ? styles.active : ''}`}>
          <Target size={18} /> Goals
        </Link>
        {role === 'admin' && (
          <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}>
            <LogIn size={18} /> Login (Admin)
          </Link>
        )}
      </div>

      <div className={styles.bottomGroup}>
        <button onClick={toggleLightMode} className={styles.navItem} style={{background: 'transparent', border:'none', width:'100%', textAlign:'left', justifyContent:'flex-start'}}>
          {isLight ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
        </button>
        <button onClick={logout} className={`${styles.navItem} ${styles.signOut}`} style={{background: 'transparent', border:'none', width:'100%', textAlign:'left', justifyContent:'flex-start'}}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
