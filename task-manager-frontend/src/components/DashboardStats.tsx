'use client';

import { Task } from '@/types/task';

interface DashboardStatsProps {
  tasks: Task[];
}

export default function DashboardStats({ tasks }: DashboardStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white shadow-md rounded-md p-4">
        <h3 className="text-gray-700 text-sm">Total Tasks</h3>
        <p className="text-xl font-bold">{total}</p>
      </div>
      <div className="bg-white shadow-md rounded-md p-4">
        <h3 className="text-gray-700 text-sm">Completed</h3>
        <p className="text-xl font-bold text-green-600">{completed}</p>
      </div>
      <div className="bg-white shadow-md rounded-md p-4">
        <h3 className="text-gray-700 text-sm">Pending</h3>
        <p className="text-xl font-bold text-yellow-500">{pending}</p>
      </div>
    </section>
  );
}
