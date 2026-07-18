import { Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

// Frontend and API are served from the same origin (Express serves the React
// build in production), so the auth cookie is first-party: SameSite=Lax keeps
// the CSRF shield from CLAUDE.md §6 while surviving top-level navigations.
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  // Must match set options or the browser won't clear the cross-site cookie.
  res.clearCookie("token", cookieOptions);
}
