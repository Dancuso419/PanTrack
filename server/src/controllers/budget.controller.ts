import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export async function getBudgets(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { month, year } = req.query;

    const where: any = { userId: authReq.userId };
    if (month) where.month = parseInt(month as string, 10);
    if (year) where.year = parseInt(year as string, 10);

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { month: "asc" },
    });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.aggregate({
          where: {
            userId: authReq.userId,
            categoryId: budget.categoryId,
            date: {
              gte: new Date(budget.year, budget.month - 1, 1),
              lte: new Date(budget.year, budget.month, 0),
            },
          },
          _sum: { amount: true },
        });

        const spent = Number(expenses._sum.amount || 0);
        const limit = Number(budget.amount);
        const percentage = Math.round((spent / limit) * 100);

        return {
          ...budget,
          amount: limit,
          spent,
          percentage,
          status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
        };
      })
    );

    sendSuccess(res, budgetsWithProgress);
  } catch (err) {
    next(err);
  }
}

export async function createBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { categoryId, amount, month, year } = req.body;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: authReq.userId },
    });
    if (!category) {
      sendError(res, "Category not found.", 404);
      return;
    }

    const existing = await prisma.budget.findFirst({
      where: { userId: authReq.userId, categoryId, month, year },
    });
    if (existing) {
      sendError(res, "A budget already exists for this category in this month/year.", 400);
      return;
    }

    const budget = await prisma.budget.create({
      data: { userId: authReq.userId!, categoryId, amount, month, year },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    sendSuccess(res, budget, "Budget created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.budget.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Budget not found.", 404);
      return;
    }

    const { amount, categoryId, month, year } = req.body;
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(categoryId !== undefined && { categoryId }),
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    sendSuccess(res, budget, "Budget updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.budget.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Budget not found.", 404);
      return;
    }

    await prisma.budget.delete({ where: { id } });
    sendSuccess(res, null, "Budget deleted.");
  } catch (err) {
    next(err);
  }
}
