import bcrypt from 'bcryptjs';

import { PasswordHasher } from '../../application/ports/out/password-hasher';

export class PasswordService implements PasswordHasher {
  constructor(private readonly rounds = 10) {}

  public async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.rounds);
  }

  public async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
