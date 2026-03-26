import { useAuthStore } from '@/store/useAuthStore';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
