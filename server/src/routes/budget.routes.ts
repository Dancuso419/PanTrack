import { Router } from "express";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();
router.use(authenticate);
router.get("/", getBudgets);
router.post(
  "/",
  validate(
    z.object({
      categoryId: z.string().min(1, "Category is required"),
      amount: z.number().positive("Amount must be greater than 0"),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(2000).max(2100),
    })
  ),
  createBudget
);
router.patch(
  "/:id",
  validate(
    z.object({
      amount: z.number().positive().optional(),
      categoryId: z.string().optional(),
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().optional(),
    }),
    "body"
  ),
  updateBudget
);
router.delete("/:id", deleteBudget);

export default router;
