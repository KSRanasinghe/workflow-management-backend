import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
} from "./auth.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    const data: RegisterRequestDTO = req.body;

    const result = await this.authService.register(data);

    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const data: LoginRequestDTO = req.body;

    const result = await this.authService.login(data);

    res.status(200).json(result);
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const data: RefreshTokenRequestDTO = req.body;

    const result = await this.authService.refreshToken(data);

    res.status(200).json(result);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    await this.authService.logout(refreshToken);

    res.status(204).send();
  }
}
