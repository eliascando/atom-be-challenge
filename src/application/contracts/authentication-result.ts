import { User } from '../../domain/entities/user';
import { UserSummary, toUserSummary } from './user-summary';

export interface AuthenticationResult {
  token: string;
  user: UserSummary;
}

export const toAuthenticationResult = (
  user: User,
  token: string,
): AuthenticationResult => ({
  token,
  user: toUserSummary(user),
});
