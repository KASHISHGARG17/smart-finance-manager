import { cookies } from 'next/headers';
import { verifyAuth } from '@/backend/lib/auth';
import Sidebar from '@/frontend/components/Sidebar';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sfm_token')?.value;
  const user = token ? await verifyAuth(token) : null;

  if (!user) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar role={user.role} />
      <div style={{ marginLeft: 260, flex: 1, padding: '32px 48px' }}>
        {children}
      </div>
    </div>
  );
}
