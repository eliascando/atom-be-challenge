import { AuthenticationResult } from '../../../application/contracts/authentication-result';
import { UserResponse, toUserResponse } from './user.presenter';

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export const toAuthResponse = (result: AuthenticationResult): AuthResponse => ({
  token: result.token,
  user: toUserResponse(result.user),
});
