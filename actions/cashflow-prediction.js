"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const AI_RESPONSE_CACHE_TTL = 1000 * 60 * 60; // 1 hour
const geminiCache = new Map();

const toNumber = (value) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value.toNumber === "function") return Number(value.toNumber()) || 0;
  return 0;
};

const getMonthIdentifier = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const buildMonthWindow = (size = 6) => {
  const now = new Date();
  return Array.from({ length: size }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (size - 1 - index), 1);
    return {
      key: getMonthIdentifier(monthDate),
      label: monthDate.toLocaleString("default", { month: "short" }),
      year: monthDate.getFullYear(),
      month: monthDate.getMonth() + 1,
    };
  });
};

const calculateTrend = (values) => {
  const differences = [];

  for (let i = 1; i < values.length; i += 1) {
    const previous = values[i - 1];
    const current = values[i];

    if (previous === 0 && current === 0) {
      differences.push(0);
      continue;
    }

    if (previous === 0) {
      differences.push(current > 0 ? 1 : 0);
      continue;
    }

    differences.push((current - previous) / previous);
  }

  if (differences.length === 0) return 0;

  return differences.reduce((acc, value) => acc + value, 0) / differences.length;
};

const formatTrendLabel = (trend) => {
  const percent = Math.round(trend * 100);
  if (trend === 0) return "stable";
  if (trend > 0) return `increasing by ${percent}%`;
  return `decreasing by ${Math.abs(percent)}%`;
};

const getPredictionStatus = ({ predictedIncome, predictedExpenses, projectedBalance, currentBalance, hasTransactions }) => {
  if (!hasTransactions) return "No Recent Activity";
  if (predictedExpenses > predictedIncome || projectedBalance < 0) {
    return "Overspending Risk";
  }

  if (predictedExpenses > predictedIncome * 0.9 || projectedBalance < currentBalance * 0.05) {
    return "Moderate Risk";
  }

  return "Healthy Cash Flow";
};

const fallbackAnalysis = {
  statusSummary: "The account forecast is built from recent transaction history and shows the expected next month cash flow.",
  riskLevel: "Moderate Risk",
  recommendations: [
    "Review your recurring expenses and cut any low-value subscriptions.",
    "Track incoming income sources to keep your forecast accurate.",
    "Use the projected balance to plan for upcoming bills.",
  ],
};

const isRateLimitError = (error) => {
  const message = String(error?.message || error || "");
  return /429|Too Many Requests|QuotaFailure|quota.*exceeded|generate_content_free_tier_requests/i.test(message);
};

const createCacheKey = (prompt) => prompt;

const getGeminiAnalysis = async (prompt) => {
  const cacheKey = createCacheKey(prompt);
  const cached = geminiCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  if (!genAI) {
    const fallback = fallbackAnalysis;
    geminiCache.set(cacheKey, {
      value: fallback,
      expiresAt: now + AI_RESPONSE_CACHE_TTL,
    });
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    if (
      typeof parsed.statusSummary !== "string" ||
      typeof parsed.riskLevel !== "string" ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error("Unexpected Gemini response shape");
    }

    const analysis = {
      statusSummary: parsed.statusSummary,
      riskLevel: parsed.riskLevel,
      recommendations: parsed.recommendations.slice(0, 3).map((item) => String(item)),
    };

    geminiCache.set(cacheKey, {
      value: analysis,
      expiresAt: now + AI_RESPONSE_CACHE_TTL,
    });

    return analysis;
  } catch (error) {
    const fallback = fallbackAnalysis;
    const logMessage = isRateLimitError(error)
      ? "Gemini rate limit reached, using fallback analysis"
      : "Gemini prediction error, using fallback analysis";

    console.warn(logMessage, error?.message || error);
    geminiCache.set(cacheKey, {
      value: fallback,
      expiresAt: now + AI_RESPONSE_CACHE_TTL,
    });

    return fallback;
  }
};

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return user;
}

export async function getAccountCashFlowPrediction(accountId) {
  const user = await getAuthenticatedUser();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        where: {
          date: {
            gte: sixMonthsAgo,
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  const currentBalance = toNumber(account.balance);
  const monthWindow = buildMonthWindow(6);
  const buckets = monthWindow.map((month) => ({
    key: month.key,
    label: month.label,
    income: 0,
    expense: 0,
  }));

  for (const transaction of account.transactions) {
    const transactionDate = new Date(transaction.date);
    const key = getMonthIdentifier(transactionDate);
    const bucket = buckets.find((item) => item.key === key);
    if (!bucket) continue;

    const amount = toNumber(transaction.amount);
    if (transaction.type === "INCOME") {
      bucket.income += amount;
    } else {
      bucket.expense += amount;
    }
  }

  const incomeTotals = buckets.map((bucket) => bucket.income);
  const expenseTotals = buckets.map((bucket) => bucket.expense);

  const totalIncome = incomeTotals.reduce((sum, value) => sum + value, 0);
  const totalExpenses = expenseTotals.reduce((sum, value) => sum + value, 0);
  const incomeMonths = incomeTotals.filter((value) => value > 0).length || 1;
  const expenseMonths = expenseTotals.filter((value) => value > 0).length || 1;

  const averageIncome = totalIncome / incomeMonths;
  const averageExpenses = totalExpenses / expenseMonths;
  const incomeTrend = calculateTrend(incomeTotals);
  const expenseTrend = calculateTrend(expenseTotals);

  const trendModifier = (trend) => Math.min(Math.max(trend, -0.2), 0.2);
  const predictedIncome = Math.max(
    averageIncome * (1 + trendModifier(incomeTrend)),
    incomeTotals[incomeTotals.length - 1]
  );
  const predictedExpenses = Math.max(
    averageExpenses * (1 + trendModifier(expenseTrend)),
    expenseTotals[expenseTotals.length - 1]
  );
  const projectedBalance = currentBalance + predictedIncome - predictedExpenses;

  const hasTransactions = account.transactions.length > 0;
  const status = getPredictionStatus({
    predictedIncome,
    predictedExpenses,
    projectedBalance,
    currentBalance,
    hasTransactions,
  });

  const summary = hasTransactions
    ? `Based on six months of account activity, income is ${formatTrendLabel(incomeTrend)} and expenses are ${formatTrendLabel(expenseTrend)}.`
    : "No recent transactions available for prediction.";

  if (!hasTransactions) {
    return {
      predictedIncome,
      predictedExpenses,
      projectedBalance,
      status,
      riskLevel: status,
      summary,
      recommendations: fallbackAnalysis.recommendations,
      currentBalance,
      monthlyIncomeTrend: incomeTrend,
      monthlyExpenseTrend: expenseTrend,
      totalIncome,
      totalExpenses,
    };
  }

  const prompt = `
You are a financial analyst.

Analyze the following account data and provide:
1. Cash flow status
2. Overspending risks
3. Three recommendations

Keep the response concise and actionable.

Account data:
- Current balance: ₹${currentBalance.toFixed(2)}
- Monthly income trend: ${formatTrendLabel(incomeTrend)}
- Monthly expense trend: ${formatTrendLabel(expenseTrend)}
- Predicted next month income: ₹${predictedIncome.toFixed(2)}
- Predicted next month expenses: ₹${predictedExpenses.toFixed(2)}

Return only valid JSON with keys:
- statusSummary
- riskLevel
- recommendations

Example:
{"statusSummary":"Your cash flow is healthy...","riskLevel":"Moderate Risk","recommendations":["...","...","..."]}
`;

  const analysis = await getGeminiAnalysis(prompt);

  return {
    predictedIncome,
    predictedExpenses,
    projectedBalance,
    status,
    riskLevel: analysis.riskLevel || status,
    summary: analysis.statusSummary || summary,
    recommendations: analysis.recommendations || fallbackAnalysis.recommendations,
    currentBalance,
    monthlyIncomeTrend: incomeTrend,
    monthlyExpenseTrend: expenseTrend,
    totalIncome,
    totalExpenses,
  };
}
