import { AuthenticationResult } from '../../contracts/authentication-result';
import { RegisterUserCommand } from '../../contracts/register-user.command';
import { User } from '../../../domain/entities/user';

export interface UsersUseCases {
  exists(email: string): Promise<boolean>;
  findById(id: string): Promise<User | null>;
  register(input: RegisterUserCommand): Promise<AuthenticationResult>;
}
