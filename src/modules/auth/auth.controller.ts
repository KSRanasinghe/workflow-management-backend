import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
} from "./auth.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // new user registration
  async register(req: Request, res: Response): Promise<void> {
    const data: RegisterRequestDTO = req.body;

    const result = await this.authService.register(data);

    res.status(201).json(result);
  }

  // user login
  async login(req: Request, res: Response): Promise<void> {
    const data: LoginRequestDTO = req.body;

    const result = await this.authService.login(data);

    res.status(200).json(result);
  }

  // token refreshing
  async refresh(req: Request, res: Response): Promise<void> {
    const data: RefreshTokenRequestDTO = req.body;

    const result = await this.authService.refreshToken(data);

    res.status(200).json(result);
  }

  // user logout
  async logout(req: Request, res: Response): Promise<void> {
    const data: RefreshTokenRequestDTO = req.body;

    await this.authService.logout(data);

    res.status(204).send();
  }
}
