import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

export default router;
