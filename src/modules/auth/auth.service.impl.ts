import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  AuthResponseDTO,
} from "./auth.dto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/token";


const SALT_ROUNDS = 10;

export class AuthServiceImpl implements AuthService {
  constructor(private readonly authRepository: AuthRepository) { }

  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const refreshToken = generateRefreshToken({
      userId: "temp",
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

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
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

  async refreshToken(data: RefreshTokenRequestDTO): Promise<{ accessToken: string }> {

    let decode: any;

    try {
      decode = jwt.verify(
        data.refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch {
      throw new Error("Invalid refresh token");
    }

    const { userId } = decode;

    const tokens = await this.authRepository.findActiveRefreshTokensByUserId(userId);

    let matchedToken: {
      email: string
    } | null = null;

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(
        data.refreshToken,
        token.tokenHash
      );

      if (isMatch) {
        matchedToken = token;
        break;
      }

    }

    if (!matchedToken) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken({
      userId,
      email: matchedToken.email,
    });

    return { accessToken };

  }

  async logout(refreshToken: string): Promise<void> {
    throw new Error("Not implemented");
  }
}