import { AuthRepository } from "./auth.repository";
import { dbPool } from "../../config/db";

export class AuthRepositoryImpl implements AuthRepository {

  // creating a new user - register
  async registerUser(data: {
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
  }> {
    const client = await dbPool.connect();

    try {
      await client.query("BEGIN");

      // 1. create user
      const userResult = await client.query(
        `
        insert into users (email, password_hash, first_name, last_name)
        values ($1, $2, $3, $4)
        returning id, email, first_name, last_name
        `,
        [
          data.email,
          data.passwordHash,
          data.firstName,
          data.lastName,
        ]
      );

      const user = userResult.rows[0];

      // 2. save refresh token
      await client.query(
        `
        insert into refresh_tokens (user_id, token_hash, jti, expires_at)
        values ($1, $2, $3, $4)
        `,
        [
          user.id,
          data.refreshTokenHash,
          data.jti,
          data.refreshTokenExpiresAt,
        ]
      );

      await client.query("COMMIT");

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      };

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // find a user using email - login
  async findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  } | null> {
    const result = await dbPool.query(
      `
      select id, email, password_hash, first_name, last_name
      from users
      where email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
    };
  }

  // saving the refresh token
  async saveRefreshToken(data: {
    userId: string;
    tokenHash: string;
    jti: string,
    expiresAt: Date;
  }): Promise<void> {
    await dbPool.query(
      `
      insert into refresh_tokens (user_id, token_hash, jti, expires_at)
      values ($1, $2, $3, $4)
      `,
      [data.userId, data.tokenHash, data.jti, data.expiresAt]
    );
  }

  // find the refresh token using user_id
  async findActiveRefreshTokenByJti(jti: string) {
    const result = await dbPool.query(
      `
      SELECT
        rt.id,
        rt.token_hash,
        rt.expires_at,
        rt.revoked_at,
        rt.user_id as "userId",
        u.email
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.jti = $1
        AND rt.revoked_at IS NULL
        AND rt.expires_at > NOW()
      LIMIT 1;
      `,
      [jti]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      email: row.email,
      userId: row.userId
    };
  }

  // revoking the token - logout
  async revokeRefreshTokenById(id: string): Promise<void> {
    await dbPool.query(
      `
      update refresh_tokens
      set revoked_at = now()
      where id = $1
      `,
      [id]
    );
  }


}