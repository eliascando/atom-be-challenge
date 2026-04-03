import { TasksRepository } from '../../../src/application/ports/out/tasks.repository';
import { Task } from '../../../src/domain/entities/task';

export class InMemoryTaskRepository implements TasksRepository {
  private readonly tasks = new Map<string, Task>();

  public async create(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  public async findAllByUserId(userId: string): Promise<Task[]> {
    return [...this.tasks.values()]
      .filter((task) => task.userId === userId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  public async findById(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) ?? null;
  }

  public async update(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  public async delete(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
  }
}
