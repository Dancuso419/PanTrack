import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.income.aggregate({
        where: { userId: authReq.userId, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId: authReq.userId, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);
    const remainingBalance = totalIncome - totalExpenses;
    const savings = remainingBalance > 0 ? remainingBalance : 0;

    const recentTransactions = await prisma.$transaction([
      prisma.income.findMany({
        where: { userId: authReq.userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true, icon: true, color: true } } },
      }),
      prisma.expense.findMany({
        where: { userId: authReq.userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true, icon: true, color: true } } },
      }),
    ]);

    const merged = [
      ...recentTransactions[0].map((i) => ({ ...i, type: "income" as const })),
      ...recentTransactions[1].map((e) => ({ ...e, type: "expense" as const })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        categoryId: t.categoryId,
        category: { name: t.category.name, icon: t.category.icon, color: t.category.color },
        description: t.description,
        date: t.date,
        createdAt: t.createdAt,
      }));

    const budgets = await prisma.budget.findMany({
      where: { userId: authReq.userId, month: now.getMonth() + 1, year: now.getFullYear() },
      include: { category: { select: { name: true } } },
    });

    const budgetStatus = await Promise.all(
      budgets.map(async (b) => {
        const spent = await prisma.expense.aggregate({
          where: {
            userId: authReq.userId,
            categoryId: b.categoryId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });
        return {
          category: b.category.name,
          limit: Number(b.amount),
          spent: Number(spent._sum.amount || 0),
          percentageUsed: Math.round((Number(spent._sum.amount || 0) / Number(b.amount)) * 100),
        };
      })
    );

    sendSuccess(res, {
      totalIncome,
      totalExpenses,
      remainingBalance,
      savings,
      budgetStatus,
      recentTransactions: merged,
    });
  } catch (err) {
    next(err);
  }
}
