import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

const incomeSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export async function getIncomes(req: Request, res: Response, next: NextFunction) {
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

    const incomes = await prisma.income.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { date: "desc" },
    });

    // Decimal serializes to a string in JSON; send a real number so the client can do math safely.
    sendSuccess(res, incomes.map((i) => ({ ...i, amount: Number(i.amount) })));
  } catch (err) {
    next(err);
  }
}

export async function createIncome(req: Request, res: Response, next: NextFunction) {
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

    const income = await prisma.income.create({
      data: {
        userId: authReq.userId!,
        amount,
        categoryId,
        description: description || null,
        date: new Date(date),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    sendSuccess(res, income, "Income added successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateIncome(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.income.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Income record not found.", 404);
      return;
    }

    const { amount, categoryId, description, date } = req.body;
    const income = await prisma.income.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    sendSuccess(res, income, "Income updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteIncome(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    const existing = await prisma.income.findFirst({
      where: { id, userId: authReq.userId },
    });
    if (!existing) {
      sendError(res, "Income record not found.", 404);
      return;
    }

    await prisma.income.delete({ where: { id } });
    sendSuccess(res, null, "Income deleted.");
  } catch (err) {
    next(err);
  }
}
