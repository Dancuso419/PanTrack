import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middleware/auth";

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate
      ? new Date(startDate as string)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [expensesByCategory, incomeVsExpense, trendIncomes, trendExpenses] = await Promise.all([
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: { userId: authReq.userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      Promise.all([
        prisma.income.aggregate({
          where: { userId: authReq.userId, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { userId: authReq.userId, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]),
      prisma.income.findMany({
        where: { userId: authReq.userId, date: { gte: start, lte: end } },
        select: { amount: true, date: true },
      }),
      prisma.expense.findMany({
        where: { userId: authReq.userId, date: { gte: start, lte: end } },
        select: { amount: true, date: true },
      }),
    ]);

    // Bucket income/expense by YYYY-MM (Prisma only — no raw SQL per TRD §10)
    const monthKey = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const trendMap = new Map<string, { month: string; income: number; expense: number }>();
    for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); d <= end; d.setUTCMonth(d.getUTCMonth() + 1)) {
      const key = monthKey(d);
      trendMap.set(key, { month: key, income: 0, expense: 0 });
    }
    for (const i of trendIncomes) {
      const bucket = trendMap.get(monthKey(i.date));
      if (bucket) bucket.income += Number(i.amount);
    }
    for (const e of trendExpenses) {
      const bucket = trendMap.get(monthKey(e.date));
      if (bucket) bucket.expense += Number(e.amount);
    }
    const monthlyTrend = Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    const categories = await prisma.category.findMany({
      where: { userId: authReq.userId },
      select: { id: true, name: true, color: true },
    });

    const expensePieChart = expensesByCategory.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      return {
        category: cat?.name || "Unknown",
        amount: Number(e._sum.amount || 0),
        color: cat?.color || "#ccc",
      };
    });

    sendSuccess(res, {
      expensePieChart,
      incomeVsExpense: {
        income: Number(incomeVsExpense[0]._sum.amount || 0),
        expense: Number(incomeVsExpense[1]._sum.amount || 0),
      },
      monthlyTrend,
    });
  } catch (err) {
    next(err);
  }
}
