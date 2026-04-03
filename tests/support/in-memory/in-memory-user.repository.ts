import { UsersRepository } from '../../../src/application/ports/out/users.repository';
import { User } from '../../../src/domain/entities/user';

export class InMemoryUsersRepository implements UsersRepository {
  private readonly byEmail = new Map<string, User>();
  private readonly byId = new Map<string, User>();

  public async create(user: User): Promise<void> {
    this.byEmail.set(user.email, user);
    this.byId.set(user.id, user);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.byEmail.get(email.trim().toLowerCase()) ?? null;
  }

  public async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
}
