import api from './api';
import { Task } from '../types/task';

// Fetch tasks with pagination
export const fetchTasks = async (page: number) => {
    const res = await api.get(`/tasks?page=${page}`);
    return res.data;
}

// create a new task
export const createTask = async (data: { title: string }) => {
  const res = await api.post('/tasks', data);
  return res.data;
}

// update a task
export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const res = await api.put(`/tasks/${taskId}`, updates);
  return res.data;
};
