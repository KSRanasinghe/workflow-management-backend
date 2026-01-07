import bcrypt from "bcrypt";
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
    throw new Error("Not implemented");
  }

  async refreshToken(
    data: RefreshTokenRequestDTO
  ): Promise<{ accessToken: string }> {
    throw new Error("Not implemented");
  }

  async logout(refreshToken: string): Promise<void> {
    throw new Error("Not implemented");
  }
}