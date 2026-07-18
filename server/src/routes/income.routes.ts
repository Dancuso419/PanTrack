import { Router } from "express";
import { getIncomes, createIncome, updateIncome, deleteIncome } from "../controllers/income.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();
router.use(authenticate);
router.get("/", getIncomes);
router.post(
  "/",
  validate(
    z.object({
      amount: z.number().positive("Amount must be greater than 0"),
      categoryId: z.string().min(1, "Category is required"),
      description: z.string().optional(),
      date: z.string().min(1, "Date is required"),
    })
  ),
  createIncome
);
router.patch(
  "/:id",
  validate(
    z.object({
      amount: z.number().positive().optional(),
      categoryId: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
    }),
    "body"
  ),
  updateIncome
);
router.delete("/:id", deleteIncome);

export default router;
