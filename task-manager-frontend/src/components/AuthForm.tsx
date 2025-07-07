'use client';
import { useState } from 'react';
import axios from '@/services/api';
import { useRouter } from 'next/navigation';
import { AuthFormData } from '@/types'; 

interface Props {
  isLogin?: boolean;
}

export default function AuthForm({ isLogin = false }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 handleSubmit called');
    console.log('Form data:', formData);
    try {
      const endpoint = isLogin ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login` : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      await axios.post(endpoint, payload);
      router.push('/'); // redirect after login/register
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      {!isLogin && (
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        value={formData.email}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        value={formData.password}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>
  );
}