'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      if (data.user.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.logo}><Building2 size={36} color="var(--accent-color)" /></div>
        <h2>Welcome to FinTrack</h2>
        <p>Sign in to your account</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit">Sign In</button>
        </form>
        <p className={styles.switch}>Don't have an account? <Link href="/register">Register</Link></p>
      </div>
    </div>
  );
}
