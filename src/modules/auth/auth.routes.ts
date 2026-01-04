import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

export const createAuthRoutes = (authService: AuthService): Router => {
  const router = Router();
  const controller = new AuthController(authService);

  router.post("/register", controller.register.bind(controller));
  router.post("/login", controller.login.bind(controller));
  router.post("/refresh", controller.refresh.bind(controller));
  router.post("/logout", controller.logout.bind(controller));

  return router;
};
