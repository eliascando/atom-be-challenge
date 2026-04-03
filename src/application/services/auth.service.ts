import { AuthContext } from '../contracts/auth-context';
import {
  AuthenticationResult,
  toAuthenticationResult,
} from '../contracts/authentication-result';
import { LoginCommand } from '../contracts/login.command';
import { AuthUseCases } from '../ports/in/auth.use-cases';
import { PasswordHasher } from '../ports/out/password-hasher';
import { TokenManager } from '../ports/out/token-manager';
import { UsersRepository } from '../ports/out/users.repository';
import { UnauthorizedError } from '../../domain/errors/app-error';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class AuthService implements AuthUseCases {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenManager: TokenManager,
  ) {}

  public async login(input: LoginCommand): Promise<AuthenticationResult> {
    const user = await this.usersRepository.findByEmail(normalizeEmail(input.email));

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const passwordsMatch = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!passwordsMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    return toAuthenticationResult(
      user,
      this.tokenManager.sign({
        sub: user.id,
        email: user.email,
      }),
    );
  }

  public async authenticate(authorization?: string): Promise<AuthContext> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Falta el token Bearer');
    }

    const token = authorization.replace('Bearer ', '').trim();
    const payload = this.tokenManager.verify(token);
    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('El usuario del token ya no existe');
    }

    return {
      userId: user.id,
      email: user.email,
    };
  }
}
