'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Database, ShieldCheck } from 'lucide-react';

export default function Navbar({ role }) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--panel-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Database color="var(--accent-color)" size={20} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>FINANCO</h2>
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {role === 'admin' && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pathname === '/admin' ? '#fff' : 'var(--text-secondary)', fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <ShieldCheck size={16} /> Admin
          </Link>
        )}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pathname === '/dashboard' ? '#fff' : 'var(--text-secondary)', fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <LayoutDashboard size={16} /> Tracker
        </Link>
        <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pathname === '/dashboard/profile' ? '#fff' : 'var(--text-secondary)', fontWeight: 500, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <User size={16} /> Profile
        </Link>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <LogOut size={16} /> Exit
        </button>
      </div>
    </nav>
  );
}
