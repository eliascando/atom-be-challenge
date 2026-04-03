import { CreateTaskCommand } from '../../contracts/create-task.command';
import { UpdateTaskCommand } from '../../contracts/update-task.command';
import { Task } from '../../../domain/entities/task';

export interface TasksUseCases {
  list(userId: string): Promise<Task[]>;
  create(input: CreateTaskCommand): Promise<Task>;
  update(input: UpdateTaskCommand): Promise<Task>;
  remove(taskId: string, userId: string): Promise<void>;
}
