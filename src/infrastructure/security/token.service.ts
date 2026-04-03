import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { TokenManager, TokenPayload } from '../../application/ports/out/token-manager';
import { UnauthorizedError } from '../../domain/errors/app-error';

export class TokenService implements TokenManager {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  public sign(payload: TokenPayload): string {
    return jwt.sign(
      { email: payload.email },
      this.secret,
      {
        expiresIn: this.expiresIn as SignOptions['expiresIn'],
        subject: payload.sub,
      },
    );
  }

  public verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload | string;

      if (typeof decoded === 'string' || !decoded.sub || typeof decoded.email !== 'string') {
        throw new UnauthorizedError('Token inválido');
      }

      return {
        sub: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      throw new UnauthorizedError(
        error instanceof Error && error.message.includes('expired')
          ? 'Token expirado'
          : 'Token inválido',
      );
    }
  }
}
