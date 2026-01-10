import jwt from "jsonwebtoken";

const accessSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

export function generateAccessToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, accessSecret, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload: {
  userId: string;
  jti: string;
}): string {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: "7d",
  });
}
