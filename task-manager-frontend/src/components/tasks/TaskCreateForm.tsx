'use client';

import { useState } from 'react';
import { createTask } from '@/services/taskService';
import { useRouter } from 'next/navigation';

export default function TaskCreateForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      await createTask({ title });
      setTitle('');
      router.refresh(); // Refresh the dashboard page
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3 max-w-md justify-self-center">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter a task title"
        className="w-full p-2 border rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Task
      </button>
    </form>
  );
}
