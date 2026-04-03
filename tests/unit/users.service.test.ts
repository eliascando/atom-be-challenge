import { describe, expect, it } from 'vitest';

import { UsersService } from '../../src/application/services/users.service';
import { PasswordService } from '../../src/infrastructure/security/password.service';
import { TokenService } from '../../src/infrastructure/security/token.service';
import { InMemoryUsersRepository } from '../support/in-memory/in-memory-user.repository';

describe('UsersService', () => {
  it('normaliza el email y devuelve el usuario autenticado', async () => {
    const userRepository = new InMemoryUsersRepository();
    const service = new UsersService(
      userRepository,
      new PasswordService(1),
      new TokenService('unit-secret', '1h'),
      {
        generateId: () => 'user-fixed-id',
        now: () => new Date('2026-04-01T12:00:00.000Z'),
      },
    );

    const result = await service.register({
      name: '  Elias  ',
      email: 'ELIAS@Example.com',
      password: 'password123',
    });

    expect(result.user.id).toBe('user-fixed-id');
    expect(result.user.email).toBe('elias@example.com');
    expect(result.user.createdAt.toISOString()).toBe('2026-04-01T12:00:00.000Z');
    expect(result.token).toBeTypeOf('string');
  });
});
