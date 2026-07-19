import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Every demo account uses the same password for convenience.
const DEMO_PASSWORD = "password123";

const CATEGORIES = [
  { name: "Food", icon: "utensils", color: "#FF6B6B" },
  { name: "Rent", icon: "home", color: "#4ECDC4" },
  { name: "Transport", icon: "car", color: "#45B7D1" },
  { name: "Shopping", icon: "shopping-bag", color: "#96CEB4" },
  { name: "Bills", icon: "file-text", color: "#FFEAA7" },
  { name: "Entertainment", icon: "film", color: "#DDA0DD" },
  { name: "Healthcare", icon: "heart", color: "#FF8A80" },
  { name: "Education", icon: "book", color: "#80CBC4" },
  { name: "Salary", icon: "wallet", color: "#6D4AFF" },
];

// A short, human-readable note per category (used on transactions).
const NOTE: Record<string, string> = {
  Food: "Groceries", Rent: "Apartment rent", Transport: "Fuel & rides",
  Shopping: "Shopping", Bills: "Utilities", Entertainment: "Leisure",
  Healthcare: "Pharmacy", Education: "Course",
};

/** Date N days ago. */
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

/** A date guaranteed to fall inside the CURRENT calendar month (never future).
 *  Used for the latest month so budget-usage % is predictable for screenshots. */
const thisMonth = (day: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate()));
};

// Four months of history so trend/analytics charts have shape. Index 0 = current.
const MONTH_OFFSETS = [3, 33, 63, 93];
const MONTH_SCALE = [1.0, 0.92, 1.08, 0.96]; // slight month-to-month variance

interface Profile {
  fullName: string;
  email: string;
  currency: "NGN" | "USD" | "EUR" | "GBP";
  profileType: string;
  monthlyIncome: number;
  monthlyBudget: number;
  salary: number;                 // recurring monthly income
  salaryLabel: string;
  extra?: { amount: number; desc: string; day: number }; // one-off income
  monthlySpend: Record<string, number>; // typical spend per category / month
  budgets: Record<string, number>;      // current-month budget limits
}

async function seedUser(p: Profile) {
  // Idempotent: wipe any previous copy of this demo user (cascade clears rows).
  const existing = await prisma.user.findUnique({ where: { email: p.email } });
  if (existing) await prisma.user.delete({ where: { id: existing.id } });

  const user = await prisma.user.create({
    data: {
      fullName: p.fullName,
      email: p.email,
      password: await bcrypt.hash(DEMO_PASSWORD, 12),
      currency: p.currency,
      monthlyIncome: p.monthlyIncome,
      monthlyBudget: p.monthlyBudget,
      profileType: p.profileType,
      onboarded: true,
      categories: {
        createMany: { data: CATEGORIES.map((c) => ({ ...c, isDefault: c.name !== "Salary" })) },
      },
    },
    include: { categories: true },
  });

  const cat = (name: string) => user.categories.find((c) => c.name === name)!.id;

  // --- Income: recurring salary each month (+ optional one-off) ---
  const incomes = MONTH_OFFSETS.map((off, i) => ({
    userId: user.id,
    amount: Math.round(p.salary * MONTH_SCALE[i]),
    categoryId: cat("Salary"),
    description: p.salaryLabel,
    date: i === 0 ? thisMonth(2) : daysAgo(off - 1),
  }));
  if (p.extra) {
    incomes.push({
      userId: user.id, amount: p.extra.amount, categoryId: cat("Salary"),
      description: p.extra.desc, date: daysAgo(p.extra.day),
    });
  }

  // --- Expenses: each category split across each month (2 txns/month) ---
  const expenses: {
    userId: string; amount: number; categoryId: string; description: string; date: Date;
  }[] = [];
  for (const [name, monthly] of Object.entries(p.monthlySpend)) {
    MONTH_OFFSETS.forEach((off, i) => {
      const total = Math.round(monthly * MONTH_SCALE[i]);
      const first = Math.round(total * 0.6);
      const second = total - first;
      // Current month (i=0) is pinned inside this calendar month for budget %.
      const d1 = i === 0 ? thisMonth(5) : daysAgo(off);
      const d2 = i === 0 ? thisMonth(15) : daysAgo(off + 6);
      expenses.push({ userId: user.id, amount: first, categoryId: cat(name), description: NOTE[name], date: d1 });
      expenses.push({ userId: user.id, amount: second, categoryId: cat(name), description: NOTE[name], date: d2 });
    });
  }

  await prisma.income.createMany({ data: incomes });
  await prisma.expense.createMany({ data: expenses });

  // --- Budgets for the current month ---
  const now = new Date();
  await prisma.budget.createMany({
    data: Object.entries(p.budgets).map(([name, amount]) => ({
      userId: user.id, categoryId: cat(name), amount,
      month: now.getMonth() + 1, year: now.getFullYear(),
    })),
  });

  console.log(`   ✅ ${p.email}  (${p.fullName} — ${p.profileType}, ${p.currency})`);
}

// ── Four demo accounts, each with a different flavour for screenshots ──────────
const PROFILES: Profile[] = [
  {
    // 1) Salary earner — healthy, all budgets green. The original demo login.
    fullName: "Ada Obi", email: "demo@pantrack.app",
    currency: "NGN", profileType: "Employee",
    monthlyIncome: 450000, monthlyBudget: 300000,
    salary: 450000, salaryLabel: "Monthly salary",
    extra: { amount: 120000, desc: "Freelance project", day: 18 },
    monthlySpend: { Rent: 150000, Food: 38000, Transport: 11000, Shopping: 20000, Bills: 22000, Entertainment: 8000, Healthcare: 9000, Education: 15000 },
    budgets: { Food: 55000, Transport: 16000, Shopping: 30000, Entertainment: 12000 }, // ~69% each (green)
  },
  {
    // 2) Student — smaller amounts, Food over 100% (RED alert screenshot).
    fullName: "Tunde Bello", email: "student@pantrack.app",
    currency: "NGN", profileType: "Student",
    monthlyIncome: 80000, monthlyBudget: 60000,
    salary: 80000, salaryLabel: "Monthly allowance",
    monthlySpend: { Food: 22000, Transport: 9000, Shopping: 7000, Bills: 4000, Entertainment: 6000, Education: 12000 },
    budgets: { Food: 18000, Transport: 10000, Entertainment: 8000, Education: 20000 }, // Food ~122% RED, Transport ~90% amber
  },
  {
    // 3) Freelancer — USD, variable income, Shopping ~94% (AMBER warning).
    fullName: "Maria Santos", email: "freelancer@pantrack.app",
    currency: "USD", profileType: "Freelancer",
    monthlyIncome: 3200, monthlyBudget: 2600,
    salary: 3200, salaryLabel: "Client payment",
    extra: { amount: 900, desc: "Extra contract", day: 12 },
    monthlySpend: { Rent: 1200, Food: 450, Transport: 180, Shopping: 300, Bills: 220, Entertainment: 150, Healthcare: 120, Education: 200 },
    budgets: { Shopping: 320, Food: 600, Transport: 250, Entertainment: 220 }, // Shopping ~94% amber, rest green
  },
  {
    // 4) Business owner — GBP, larger figures, comfortable savings (all green).
    fullName: "John Carter", email: "business@pantrack.app",
    currency: "GBP", profileType: "Business owner",
    monthlyIncome: 6000, monthlyBudget: 5000,
    salary: 6000, salaryLabel: "Business revenue",
    monthlySpend: { Rent: 1800, Food: 700, Transport: 400, Shopping: 600, Bills: 500, Entertainment: 400, Healthcare: 250, Education: 300 },
    budgets: { Food: 1200, Transport: 700, Shopping: 1000, Entertainment: 700 }, // ~58–60% (green)
  },
];

async function main() {
  console.log("🌱 Seeding demo accounts…");
  for (const p of PROFILES) await seedUser(p);
  console.log(`\n✅ Done. Log in to any account with password:  ${DEMO_PASSWORD}`);
  console.log("   demo@pantrack.app · student@pantrack.app · freelancer@pantrack.app · business@pantrack.app");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
