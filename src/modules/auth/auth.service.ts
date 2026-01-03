import { RegisterRequestDTO, LoginRequestDTO, RefreshTokenRequestDTO, AuthResponseDTO } from "./auth.dto";

export interface AuthService {
  register(data: RegisterRequestDTO): Promise<AuthResponseDTO>;
  login(data: LoginRequestDTO): Promise<AuthResponseDTO>;
  refreshToken(data: RefreshTokenRequestDTO): Promise<{ accessToken: string }>;
  logout(refreshToken: string): Promise<void>;
}