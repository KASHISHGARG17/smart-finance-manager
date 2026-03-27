'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import styles from '../login/login.module.css';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.logo}><Building2 size={36} color="var(--accent-color)" /></div>
        <h2>Join FinTrack</h2>
        <p>Start managing your finances securely</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={submit}>
          <input type="text" placeholder="Full Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit">Sign Up</button>
        </form>
        <p className={styles.switch}>Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
