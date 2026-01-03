// Request DTOs

export interface RegisterRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// Response DTOs

export interface UserResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
}
