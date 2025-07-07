'use client';
import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
      return (
    <div className="p-6">
      <h1 className="text-2xl mb-4 font-semibold">Register</h1>
      <AuthForm />
    </div>
  );
}