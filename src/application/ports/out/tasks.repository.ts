import { Task } from '../../../domain/entities/task';

export interface TasksRepository {
  create(task: Task): Promise<void>;
  findAllByUserId(userId: string): Promise<Task[]>;
  findById(taskId: string): Promise<Task | null>;
  update(task: Task): Promise<void>;
  delete(taskId: string): Promise<void>;
}
