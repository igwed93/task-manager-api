'use client';

import { Task } from '@/types/task';
import { useState } from 'react';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-white via-gray-100 to-white hover:shadow-xl transition-all">
        <h2 className="font-bold text-lg">{task.title}</h2>
        <p className={`mt-2 text-sm ${task.completed ? 'text-green-600' : 'text-orange-500'}`}>
          {task.completed ? 'Completed' : 'Pending'}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Edit
        </button>
      </div>

      {isEditing && (
        <EditTaskModal
          task={task}
          onClose={() => setIsEditing(false)}
          onUpdated={() => window.location.reload()}
        />
      )}
    </>
  );
}
