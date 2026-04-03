import { UserSummary } from '../../../application/contracts/user-summary';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const toUserResponse = (user: UserSummary): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});
