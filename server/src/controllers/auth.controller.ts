import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils", color: "#FF6B6B" },
  { name: "Rent", icon: "home", color: "#4ECDC4" },
  { name: "Transport", icon: "car", color: "#45B7D1" },
  { name: "Shopping", icon: "shopping-bag", color: "#96CEB4" },
  { name: "Bills", icon: "file-text", color: "#FFEAA7" },
  { name: "Entertainment", icon: "film", color: "#DDA0DD" },
  { name: "Healthcare", icon: "heart", color: "#FF8A80" },
  { name: "Education", icon: "book", color: "#80CBC4" },
];

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, "An account with this email already exists.", 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        categories: {
          createMany: { data: DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })) },
        },
      },
      select: { id: true, fullName: true, email: true },
    });

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    sendSuccess(res, user, "Account created successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    sendSuccess(
      res,
      { id: user.id, fullName: user.fullName, email: user.email },
      "Logged in successfully."
    );
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  sendSuccess(res, null, "Logged out successfully.");
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        currency: true,
        monthlyIncome: true,
        monthlyBudget: true,
        profileType: true,
        onboarded: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, "User not found.", 404);
      return;
    }

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { monthlyIncome, monthlyBudget, profileType, currency } = req.body;

    const user = await prisma.user.update({
      where: { id: authReq.userId },
      data: {
        ...(monthlyIncome !== undefined && { monthlyIncome }),
        ...(monthlyBudget !== undefined && { monthlyBudget }),
        ...(profileType !== undefined && { profileType }),
        ...(currency !== undefined && { currency }),
        onboarded: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        currency: true,
        monthlyIncome: true,
        monthlyBudget: true,
        profileType: true,
        onboarded: true,
      },
    });

    sendSuccess(res, user, "Onboarding completed.");
  } catch (err) {
    next(err);
  }
}
