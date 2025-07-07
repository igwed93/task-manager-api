'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import DashboardStats from '@/components/DashboardStats';
import { fetchTasks } from '@/services/taskService';
import TaskCard from '@/components/tasks/TaskCard';
import TaskCreateForm from '@/components/tasks/TaskCreateForm';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await fetchTasks(page) as { tasks: Task[]; totalPages: number };
        setTasks(data.tasks);
        setTotalPages(Math.max(1, data.totalPages));
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [page]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome back 👋</h1>

      <TaskCreateForm />
      <DashboardStats tasks={tasks} />

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          className="px-4 py-2 border rounded disabled:opacity-75 bg-red-800 text-white hover:bg-red-900"
          disabled={page === 1}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 border rounded disabled:opacity-75 bg-green-800 text-white hover:bg-green-900"
          disabled={page === totalPages}
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </main>
  );
}
