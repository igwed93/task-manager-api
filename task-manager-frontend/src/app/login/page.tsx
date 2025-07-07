'use client';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
     return (
    <div className="p-6">
      <h1 className="text-2xl mb-4 font-semibold">Login</h1>
      <AuthForm isLogin />
    </div>
  );
}