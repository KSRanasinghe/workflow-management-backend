import { RegisterRequestDTO, LoginRequestDTO, RefreshTokenRequestDTO, AuthResponseDTO, RefreshTokenResponsetDTO } from "./auth.dto";

export interface AuthService {
  register(data: RegisterRequestDTO): Promise<AuthResponseDTO>;
  login(data: LoginRequestDTO): Promise<AuthResponseDTO>;
  refreshToken(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponsetDTO>;
  logout(data: RefreshTokenRequestDTO): Promise<void>;
}