import { CreateTaskCommand } from '../contracts/create-task.command';
import { UpdateTaskCommand } from '../contracts/update-task.command';
import { randomUUID } from 'node:crypto';

import { TasksUseCases } from '../ports/in/tasks.use-cases';
import { TasksRepository } from '../ports/out/tasks.repository';
import { NotFoundError } from '../../domain/errors/app-error';
import { Task } from '../../domain/entities/task';

export interface TasksServiceOptions {
  now?: () => Date;
  generateId?: () => string;
}

export class TasksService implements TasksUseCases {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly options: TasksServiceOptions = {},
  ) {}

  public async list(userId: string): Promise<Task[]> {
    return this.tasksRepository.findAllByUserId(userId);
  }

  public async create(input: CreateTaskCommand): Promise<Task> {
    const now = this.now();
    const task: Task = {
      id: this.generateId(),
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      status: 'pending',
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };

    await this.tasksRepository.create(task);

    return task;
  }

  public async update(input: UpdateTaskCommand): Promise<Task> {
    const task = await this.tasksRepository.findById(input.taskId);

    if (!task || task.userId !== input.userId) {
      throw new NotFoundError('La tarea no existe');
    }

    const updatedTask: Task = {
      ...task,
      title: input.title !== undefined ? input.title.trim() : task.title,
      description:
        input.description !== undefined ? input.description.trim() : task.description,
      status: input.status ?? task.status,
      updatedAt: this.now(),
    };

    await this.tasksRepository.update(updatedTask);

    return updatedTask;
  }

  public async remove(taskId: string, userId: string): Promise<void> {
    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new NotFoundError('La tarea no existe');
    }

    await this.tasksRepository.delete(taskId);
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  private generateId(): string {
    return this.options.generateId?.() ?? randomUUID();
  }
}
