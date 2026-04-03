export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenManager {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
