import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@pantrack.app";
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

/** Date N days ago. */
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function main() {
  console.log("🌱 Seeding demo data…");

  // Clean slate for the demo user (idempotent re-seed)
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } }); // cascade clears related rows
    console.log("   removed previous demo user");
  }

  const user = await prisma.user.create({
    data: {
      fullName: "Ada Demo",
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 12),
      currency: "NGN",
      monthlyIncome: 450000,
      monthlyBudget: 300000,
      profileType: "Employee",
      onboarded: true,
      categories: { createMany: { data: CATEGORIES.map((c) => ({ ...c, isDefault: c.name !== "Salary" })) } },
    },
    include: { categories: true },
  });

  const cat = (name: string) => user.categories.find((c) => c.name === name)!.id;

  // Income — salary across the last 5 months + a freelance top-up
  const incomes = [
    { amount: 450000, categoryId: cat("Salary"), description: "Monthly salary", date: daysAgo(2) },
    { amount: 450000, categoryId: cat("Salary"), description: "Monthly salary", date: daysAgo(32) },
    { amount: 450000, categoryId: cat("Salary"), description: "Monthly salary", date: daysAgo(62) },
    { amount: 120000, categoryId: cat("Salary"), description: "Freelance project", date: daysAgo(18) },
    { amount: 450000, categoryId: cat("Salary"), description: "Monthly salary", date: daysAgo(92) },
  ];

  // Expenses — spread across categories and recent weeks
  const expenses = [
    { amount: 150000, categoryId: cat("Rent"), description: "Apartment rent", date: daysAgo(3) },
    { amount: 12500, categoryId: cat("Food"), description: "Groceries", date: daysAgo(1) },
    { amount: 4800, categoryId: cat("Food"), description: "Lunch out", date: daysAgo(4) },
    { amount: 9200, categoryId: cat("Food"), description: "Groceries", date: daysAgo(9) },
    { amount: 6500, categoryId: cat("Transport"), description: "Fuel", date: daysAgo(2) },
    { amount: 3000, categoryId: cat("Transport"), description: "Ride hailing", date: daysAgo(6) },
    { amount: 28000, categoryId: cat("Shopping"), description: "New shoes", date: daysAgo(7) },
    { amount: 15400, categoryId: cat("Bills"), description: "Electricity", date: daysAgo(5) },
    { amount: 8000, categoryId: cat("Bills"), description: "Internet", date: daysAgo(10) },
    { amount: 5500, categoryId: cat("Entertainment"), description: "Cinema", date: daysAgo(8) },
    { amount: 3200, categoryId: cat("Entertainment"), description: "Streaming", date: daysAgo(12) },
    { amount: 18000, categoryId: cat("Healthcare"), description: "Pharmacy", date: daysAgo(14) },
    { amount: 25000, categoryId: cat("Education"), description: "Online course", date: daysAgo(20) },
    // last month
    { amount: 150000, categoryId: cat("Rent"), description: "Apartment rent", date: daysAgo(33) },
    { amount: 42000, categoryId: cat("Food"), description: "Groceries (month)", date: daysAgo(40) },
    { amount: 19000, categoryId: cat("Transport"), description: "Fuel (month)", date: daysAgo(45) },
  ];

  await prisma.income.createMany({ data: incomes.map((i) => ({ ...i, userId: user.id })) });
  await prisma.expense.createMany({ data: expenses.map((e) => ({ ...e, userId: user.id })) });

  // Budgets for the current month
  const now = new Date();
  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: cat("Food"), amount: 40000, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, categoryId: cat("Transport"), amount: 12000, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, categoryId: cat("Shopping"), amount: 25000, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, categoryId: cat("Entertainment"), amount: 15000, month: now.getMonth() + 1, year: now.getFullYear() },
    ],
  });

  console.log(`✅ Done. Login with  ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
