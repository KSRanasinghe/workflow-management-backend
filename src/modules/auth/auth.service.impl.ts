import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  AuthResponseDTO,
  RefreshTokenResponsetDTO
} from "./auth.dto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/token";


const SALT_ROUNDS = 10;

export class AuthServiceImpl implements AuthService {
  constructor(private readonly authRepository: AuthRepository) { }

  // new user registration
  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const refreshTokenJti = uuidv4();

    const refreshToken = generateRefreshToken({
      userId: "temp",
      jti: refreshTokenJti,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const user = await this.authRepository.registerUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      refreshTokenHash,
      jti: refreshTokenJti,
      refreshTokenExpiresAt,
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // user login
  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or pasword.");
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new Error("Invalid email or pasword.");
    }

    const refreshTokenJti = uuidv4();

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      jti: refreshTokenJti,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      jti: refreshTokenJti,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  // token refreshing
  async refreshToken(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponsetDTO> {
    let decode: any;

    try {
      decode = jwt.verify(
        data.refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch {
      throw new Error("Invalid refresh token");
    }

    const { userId, jti } = decode;

    const token = await this.authRepository.findActiveRefreshTokenByJti(jti);

    if (!token) {
      throw new Error("Refresh token not found or already revoked");
    }

    const isMatch = await bcrypt.compare(
      data.refreshToken,
      token.tokenHash
    );

    if (!isMatch) {
      throw new Error("Invalid refresh token");
    }

    await this.authRepository.revokeRefreshTokenById(token.id);

    const accessToken = generateAccessToken({
      userId,
      email: token.email,
    });

    const newJti = uuidv4();
    const newRefreshToken = generateRefreshToken({
      userId,
      jti: newJti,
    });

    const newRefreshTokenHash = await bcrypt.hash(
      newRefreshToken,
      SALT_ROUNDS
    );

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await this.authRepository.saveRefreshToken({
      userId,
      tokenHash: newRefreshTokenHash,
      jti: newJti,
      expiresAt
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };

  }

  // user logout
  async logout(data: RefreshTokenRequestDTO): Promise<void> {

    let decoded: any;

    try {
      decoded = jwt.verify(
        data.refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch {
      return;
    }

    const { jti } = decoded;

    const token = await this.authRepository.findActiveRefreshTokenByJti(jti);


    if (token) {
      const isMatch = await bcrypt.compare(
        data.refreshToken,
        token.tokenHash
      );

      if (isMatch) {
        await this.authRepository.revokeRefreshTokenById(token.id);
      }
    }
  }
  
}