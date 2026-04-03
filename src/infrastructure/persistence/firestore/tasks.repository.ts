import { Firestore, Timestamp } from 'firebase-admin/firestore';

import { TasksRepository } from '../../../application/ports/out/tasks.repository';
import { Task, TaskStatus } from '../../../domain/entities/task';

interface TaskDocument {
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
}

const toDate = (value: Timestamp | Date | string): Date => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

export class FirestoreTasksRepository implements TasksRepository {
  private readonly collection;

  constructor(firestore: Firestore) {
    this.collection = firestore.collection('tasks');
  }

  public async create(task: Task): Promise<void> {
    await this.collection.doc(task.id).set({
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }

  public async findAllByUserId(userId: string): Promise<Task[]> {
    const snapshot = await this.collection.where('userId', '==', userId).get();

    return snapshot.docs
      .map((document) => {
        const data = document.data() as TaskDocument;

        return {
          id: document.id,
          title: data.title,
          description: data.description,
          status: data.status,
          userId: data.userId,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      })
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  public async findById(taskId: string): Promise<Task | null> {
    const document = await this.collection.doc(taskId).get();

    if (!document.exists) {
      return null;
    }

    const data = document.data() as TaskDocument;

    return {
      id: document.id,
      title: data.title,
      description: data.description,
      status: data.status,
      userId: data.userId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  }

  public async update(task: Task): Promise<void> {
    await this.collection.doc(task.id).set(
      {
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      { merge: false },
    );
  }

  public async delete(taskId: string): Promise<void> {
    await this.collection.doc(taskId).delete();
  }
}
