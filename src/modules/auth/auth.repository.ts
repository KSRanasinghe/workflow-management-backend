export interface AuthRepository {
  // User-related
  registerUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    refreshTokenHash: string;
    jti: string,
    refreshTokenExpiresAt: Date;
  }): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;

  findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  } | null>;

  // Refresh token-related
  saveRefreshToken(data: {
    userId: string;
    tokenHash: string;
    jti: string,
    expiresAt: Date;
  }): Promise<void>;

  findActiveRefreshTokenByJti(jti: string): Promise<{
    id: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    email: string;
    userId: string;
  } | null>;


  revokeRefreshTokenById(id: string): Promise<void>;
}
