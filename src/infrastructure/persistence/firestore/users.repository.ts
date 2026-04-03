import { Firestore, Timestamp } from 'firebase-admin/firestore';

import { UsersRepository } from '../../../application/ports/out/users.repository';
import { User } from '../../../domain/entities/user';

interface UserDocument {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Timestamp | Date | string;
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

export class FirestoreUsersRepository implements UsersRepository {
  private readonly collection;

  constructor(firestore: Firestore) {
    this.collection = firestore.collection('users');
  }

  public async create(user: User): Promise<void> {
    await this.collection.doc(user.email).create({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    const document = await this.collection.doc(email.trim().toLowerCase()).get();

    if (!document.exists) {
      return null;
    }

    const data = document.data() as UserDocument;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: toDate(data.createdAt),
    };
  }

  public async findById(id: string): Promise<User | null> {
    const snapshot = await this.collection.where('id', '==', id).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data() as UserDocument;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: toDate(data.createdAt),
    };
  }
}
