import { AuthContext } from '../../contracts/auth-context';
import { AuthenticationResult } from '../../contracts/authentication-result';
import { LoginCommand } from '../../contracts/login.command';

export interface AuthUseCases {
  login(input: LoginCommand): Promise<AuthenticationResult>;
  authenticate(authorization?: string): Promise<AuthContext>;
}
