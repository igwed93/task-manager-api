'use client';

import { Task } from '@/types/task';
import { updateTask } from '@/services/taskService';
import { useState } from 'react';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditTaskModal({ task, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(task.title);
  const [completed, setCompleted] = useState(task.completed);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateTask(task.id, { title, completed });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
      <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-3 border rounded shadow-inner focus:outline-none"
          placeholder="Task title"
        />
        <label className="flex items-center mb-4 space-x-2">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          <span>Completed</span>
        </label>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded border text-sm">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}