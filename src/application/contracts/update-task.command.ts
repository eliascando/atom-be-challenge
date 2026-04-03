import { TaskStatus } from '../../domain/entities/task';

export interface UpdateTaskCommand {
  taskId: string;
  userId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
}
