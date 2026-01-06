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

    const user = await this.authRepository.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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