import { randomUUID } from 'node:crypto';

import {
  AuthenticationResult,
  toAuthenticationResult,
} from '../contracts/authentication-result';
import { RegisterUserCommand } from '../contracts/register-user.command';
import { UsersUseCases } from '../ports/in/users.use-cases';
import { PasswordHasher } from '../ports/out/password-hasher';
import { TokenManager } from '../ports/out/token-manager';
import { UsersRepository } from '../ports/out/users.repository';
import { ConflictError } from '../../domain/errors/app-error';
import { User } from '../../domain/entities/user';

export interface UsersServiceOptions {
  now?: () => Date;
  generateId?: () => string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class UsersService implements UsersUseCases {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenManager: TokenManager,
    private readonly options: UsersServiceOptions = {},
  ) {}

  public async exists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(normalizeEmail(email));

    return Boolean(user);
  }

  public async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  public async register(input: RegisterUserCommand): Promise<AuthenticationResult> {
    const email = normalizeEmail(input.email);
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictError('El usuario ya existe');
    }

    const user: User = {
      id: this.generateId(),
      name: input.name.trim(),
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      createdAt: this.now(),
    };

    await this.usersRepository.create(user);

    return toAuthenticationResult(
      user,
      this.tokenManager.sign({
        sub: user.id,
        email: user.email,
      }),
    );
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  private generateId(): string {
    return this.options.generateId?.() ?? randomUUID();
  }
}
