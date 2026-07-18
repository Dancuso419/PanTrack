import { Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

// ponytail: prod uses cross-site cookies (Vercel frontend + Render backend are
// different sites), which require SameSite=None; Secure. This drops the
// SameSite=Strict CSRF shield noted in CLAUDE.md §6 — add token-based CSRF
// before exposing state-changing routes. Local dev stays Strict.
const cookieOptions = {
  httpOnly: true,
  sameSite: config.nodeEnv === "production" ? ("none" as const) : ("strict" as const),
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
