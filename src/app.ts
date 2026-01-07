import { createAuthRoutes } from "./modules/auth/auth.routes";
import { AuthServiceImpl } from "./modules/auth/auth.service.impl";
import { AuthRepositoryImpl } from "./modules/auth/auth.repository.impl";
import express from "express";

const app = express();
app.use(express.json());

const authRepository = new AuthRepositoryImpl();
const authService = new AuthServiceImpl(authRepository);

app.use("/auth", createAuthRoutes(authService));

export default app;