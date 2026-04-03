import { Task } from '../../../domain/entities/task';

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: Task['status'];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const toTaskResponse = (task: Task): TaskResponse => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  userId: task.userId,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
