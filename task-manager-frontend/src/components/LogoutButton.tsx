'use client';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/authService';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">
      Logout
    </button>
  );
}
// This button can be used in the dashboard or any other page where you want to allow users to log out.