import { User } from '../../domain/entities/user';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export const toUserSummary = (user: User): UserSummary => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
