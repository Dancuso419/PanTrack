import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const categories = await prisma.category.findMany({
      where: { userId: authReq.userId },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { name, icon, color } = req.body;

    const category = await prisma.category.create({
      data: { userId: authReq.userId!, name, icon, color },
    });

    sendSuccess(res, category, "Category created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const category = await prisma.category.findFirst({
      where: { id, userId: authReq.userId },
    });

    if (!category) {
      sendError(res, "Category not found.", 404);
      return;
    }

    if (category.isDefault) {
      sendError(res, "Default categories cannot be deleted.", 400);
      return;
    }

    const [incomeCount, expenseCount, budgetCount] = await Promise.all([
      prisma.income.count({ where: { categoryId: id } }),
      prisma.expense.count({ where: { categoryId: id } }),
      prisma.budget.count({ where: { categoryId: id } }),
    ]);
    if (incomeCount + expenseCount + budgetCount > 0) {
      sendError(res, "This category is in use and cannot be deleted. Reassign or remove its records first.", 400);
      return;
    }

    await prisma.category.delete({ where: { id } });
    sendSuccess(res, null, "Category deleted.");
  } catch (err) {
    next(err);
  }
}
