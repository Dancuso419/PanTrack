import { Router } from "express";
import {
  register, login, logout, me, updateOnboarding, updateProfile, changePassword,
  registerSchema, loginSchema, updateProfileSchema, changePasswordSchema,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { z } from "zod";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.patch(
  "/onboarding",
  authenticate,
  validate(
    z.object({
      monthlyIncome: z.number().positive().optional(),
      monthlyBudget: z.number().positive().optional(),
      profileType: z.string().optional(),
      currency: z.string().optional(),
    })
  ),
  updateOnboarding
);
router.patch("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
