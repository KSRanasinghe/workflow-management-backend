import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  AuthResponseDTO,
} from "./auth.dto";

export class AuthServiceImpl implements AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    throw new Error("Not implemented");
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