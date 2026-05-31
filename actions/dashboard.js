"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    console.error(error.message);
  }
}

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getGrade = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
};

export async function getDashboardData() {
  const user = await getAuthenticatedUser();

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}

export async function getFinancialHealthScore() {
  const user = await getAuthenticatedUser();
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [incomeAggregate, expenseAggregate, balanceAggregate, budget] =
    await Promise.all([
      db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "INCOME",
          date: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: { amount: true },
      }),
      db.account.aggregate({
        where: { userId: user.id },
        _sum: { balance: true },
      }),
      db.budget.findUnique({
        where: { userId: user.id },
      }),
    ]);

  const income = incomeAggregate._sum.amount
    ? parseFloat(incomeAggregate._sum.amount.toString())
    : 0;
  const expenses = expenseAggregate._sum.amount
    ? parseFloat(expenseAggregate._sum.amount.toString())
    : 0;
  const balance = balanceAggregate._sum.balance
    ? parseFloat(balanceAggregate._sum.balance.toString())
    : 0;
  const budgetAmount = budget ? parseFloat(budget.amount.toString()) : null;
  const savings = Math.max(0, income - expenses);

  // All metrics use last 30 days as a rolling monthly window.

  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const savingsRateScore = clamp((savingsRate / 30) * 40, 0, 40);

  const budgetUsage = budgetAmount ? expenses / budgetAmount : null;
  let budgetAdherenceScore = 0;
  if (budgetAmount && budgetAmount > 0) {
    if (budgetUsage <= 1) {
      budgetAdherenceScore = 20;
    } else {
      budgetAdherenceScore = clamp(20 * (1 - (budgetUsage - 1)), 0, 20);
    }
  }

  const expenseRatio = income > 0 ? (expenses / income) * 100 : income === 0 && expenses === 0 ? 0 : 100;
  let expenseRatioScore = 0;
  if (income > 0) {
    if (expenseRatio <= 50) {
      expenseRatioScore = 20;
    } else if (expenseRatio <= 100) {
      expenseRatioScore = 20 * (1 - (expenseRatio - 50) / 50);
    } else {
      expenseRatioScore = 0;
    }
  }

  const emergencyFundCoverage = expenses > 0 ? balance / expenses : balance > 0 ? Infinity : 0;
  const emergencyFundCoverageScore = expenses > 0
    ? clamp((Math.min(emergencyFundCoverage, 6) / 6) * 20, 0, 20)
    : balance > 0
    ? 20
    : 0;

  const totalScore = Math.round(
    savingsRateScore + budgetAdherenceScore + expenseRatioScore + emergencyFundCoverageScore
  );

  return {
    score: totalScore,
    grade: getGrade(totalScore),
    savingsRate: Number(savingsRate.toFixed(1)),
    budgetUsage: budgetUsage !== null ? Number((budgetUsage * 100).toFixed(1)) : null,
    expenseRatio: Number(expenseRatio.toFixed(1)),
    emergencyFundCoverage: Number(
      Number.isFinite(emergencyFundCoverage) ? emergencyFundCoverage.toFixed(1) : 0
    ),
    emergencyFundCoverageLabel:
      expenses > 0
        ? `${Math.min(emergencyFundCoverage, 99).toFixed(1)}x monthly expenses`
        : balance > 0
        ? "No recent expenses"
        : "No coverage",
    budgetUsageLabel: budgetAmount
      ? `${Math.min(budgetUsage * 100, 999).toFixed(1)}%`
      : "No budget",
    income: Number(income.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    savings: Number(savings.toFixed(2)),
    budgetConfigured: Boolean(budgetAmount),
    savingsRateScore: Number(savingsRateScore.toFixed(1)),
    budgetAdherenceScore: Number(budgetAdherenceScore.toFixed(1)),
    expenseRatioScore: Number(expenseRatioScore.toFixed(1)),
    emergencyFundCoverageScore: Number(emergencyFundCoverageScore.toFixed(1)),
  };
}

const buildFallbackRecommendations = (healthScore) => {
  const strengths = [];
  const improvements = [];

  if (healthScore.savingsRate >= 25) {
    strengths.push("You are saving a healthy portion of your income.");
  } else {
    improvements.push("Increase your savings target by setting aside at least 20-30% of income.");
  }

  if (healthScore.budgetUsage !== null) {
    if (healthScore.budgetUsage <= 75) {
      strengths.push("You're keeping budget usage comfortably below your monthly limit.");
    } else if (healthScore.budgetUsage <= 100) {
      improvements.push("Aim to reduce spending slightly to stay within your monthly budget.");
    } else {
      improvements.push("Review and adjust expenses to bring budget usage back under 100%.");
    }
  } else {
    strengths.push("You have no budget set yet, so you're tracking your spending manually.");
    improvements.push("Set a monthly budget to make tracking and adherence easier.");
  }

  if (healthScore.expenseRatio <= 50) {
    strengths.push("Your expenses are well under control compared to your income.");
  } else {
    improvements.push("Lower discretionary expenses to improve your expense-to-income ratio.");
  }

  if (healthScore.emergencyFundCoverage >= 3 || healthScore.emergencyFundCoverage === Infinity) {
    strengths.push("Your account balances provide strong coverage for short-term emergencies.");
  } else {
    improvements.push("Build your emergency fund until it covers at least 3 months of expenses.");
  }

  // Ensure exactly 3 strengths and 3 improvements
  const normalizedStrengths = strengths.slice(0, 3);
  while (normalizedStrengths.length < 3) {
    normalizedStrengths.push("You have a solid grasp of your recent financial activity.");
  }

  const normalizedImprovements = improvements.slice(0, 3);
  while (normalizedImprovements.length < 3) {
    normalizedImprovements.push("Continue reviewing your spending each month to find new savings opportunities.");
  }

  const assessment = healthScore.score >= 90
    ? "Excellent financial health overall, with strong savings and coverage."
    : healthScore.score >= 75
    ? "Very good financial habits, with room to optimize budgeting and emergency savings."
    : healthScore.score >= 60
    ? "Good progress, but focus on budget discipline and expense control."
    : healthScore.score >= 40
    ? "Fair financial health; prioritize savings and budget adherence."
    : "Needs improvement; reduce spending and build emergency savings first.";

  return {
    success: true,
    overallAssessment: assessment,
    strengths: normalizedStrengths,
    improvements: normalizedImprovements,
  };
};

export async function generateFinancialHealthRecommendations(healthScore) {
  if (!healthScore) {
    return buildFallbackRecommendations({
      score: 0,
      savingsRate: 0,
      budgetUsage: null,
      expenseRatio: 100,
      emergencyFundCoverage: 0,
      emergencyFundCoverageLabel: "No coverage",
      income: 0,
      expenses: 0,
      savings: 0,
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackRecommendations(healthScore);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const budgetUsageText = healthScore.budgetUsage !== null ? `${healthScore.budgetUsage}%` : "No budget set";
    const emergencyCoverageText = healthScore.emergencyFundCoverageLabel;

    const prompt = `You are a financial coach. Based on the user's metrics, produce a personalized result with:\n- overallAssessment: one concise summary of their current financial health.\n- strengths: exactly 3 positive strengths.\n- improvements: exactly 3 actionable improvement suggestions.\n\nProvide the answer as a valid JSON object only, with the keys overallAssessment, strengths, and improvements.\n\nUSER METRICS:\nScore: ${healthScore.score}\nGrade: ${healthScore.grade}\nSavings Rate: ${healthScore.savingsRate}%\nBudget Usage: ${budgetUsageText}\nExpense to Income Ratio: ${healthScore.expenseRatio}%\nEmergency Fund Coverage: ${emergencyCoverageText}\nTotal Income (30d): ₹${healthScore.income}\nTotal Expenses (30d): ₹${healthScore.expenses}\nTotal Savings (30d): ₹${healthScore.savings}\n`;

    const result = await model.generateContent({
      systemInstruction: {
        parts: [{ text: "You are a helpful and positive financial advisor assistant." }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.6,
        topP: 0.95,
      },
    });

    const text =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    try {
      const parsed = JSON.parse(text);
      const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [];
      const improvements = Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [];

      if (!parsed.overallAssessment || strengths.length < 3 || improvements.length < 3) {
        return buildFallbackRecommendations(healthScore);
      }

      return {
        success: true,
        overallAssessment: parsed.overallAssessment,
        strengths,
        improvements,
      };
    } catch (error) {
      return buildFallbackRecommendations(healthScore);
    }
  } catch (error) {
    return buildFallbackRecommendations(healthScore);
  }
}
