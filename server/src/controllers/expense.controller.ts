import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

async function checkBudgetWarning(userId: string, categoryId: string, extraAmount: number) {
  const now = new Date();
  const budget = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  if (!budget) return null;

  const expenses = await prisma.expense.aggregate({
    where: {
      userId,
      categoryId,
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    },
    _sum: { amount: true },
  });

  const spent = Number(expenses._sum.amount || 0) + extraAmount;
  const limit = Number(budget.amount);
  const percentage = (spent / limit) * 100;

  if (percentage >= 100) {
    return { severity: "exceeded", message: `You have exceeded your budget for this category.`, percentage };
  }
  if (percentage >= 80) {
    return { severity: "warning", message: `You are close to your budget limit for this category.`, percentage };
  }
  return null;
}

export async function getExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { categoryId, startDate, endDate } = req.query;

    const where: any = { userId: authReq.userId };
    if (categoryId) where.categoryId = categoryId as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { date: "desc" },
    });

    // Decimal serializes to a string in JSON; send a real number so the client can do math safely.
    sendSuccess(res, expenses.map((e) => ({ ...e, amount: Number(e.amount) })));
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { amount, categoryId, description, date } = req.body;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: authReq.userId },
    });
    if (!category) {
      sendError(res, "Category not found.", 404);
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        userId: authReq.userId!,
        amount,
        categoryId,
        description: description || null,
        date: new Date(date),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    const budgetWarning = await checkBudgetWarning(authReq.userId!, categoryId, amount);

    sendSuccess(res, { ...expense, budgetWarning }, "Expense added successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.expense.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Expense record not found.", 404);
      return;
    }

    const { amount, categoryId, description, date } = req.body;
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    sendSuccess(res, expense, "Expense updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.expense.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Expense record not found.", 404);
      return;
    }

    await prisma.expense.delete({ where: { id } });
    sendSuccess(res, null, "Expense deleted.");
  } catch (err) {
    next(err);
  }
}
