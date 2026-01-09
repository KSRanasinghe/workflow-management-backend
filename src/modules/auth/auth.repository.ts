export interface AuthRepository {
  // User-related
  registerUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    refreshTokenHash: string;
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
    expiresAt: Date;
  }): Promise<void>;

  findRefreshToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    email: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null>;

  findActiveRefreshTokensByUserId(userId: string): Promise<Array<{
    id: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    email: string;
  }>>;


  revokeRefreshToken(tokenHash: string): Promise<void>;
}
