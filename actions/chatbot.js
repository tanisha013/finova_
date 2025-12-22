"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Fetch user's financial context for AI analysis
 */
async function getUserFinancialContext() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // First, get the user from database using clerkUserId
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) return null;

    const dbUserId = user.id;

    // Fetch accounts
    const accounts = await db.account.findMany({
      where: { userId: dbUserId },
      select: {
        name: true,
        balance: true,
        type: true,
        isDefault: true,
      },
    });

    // Calculate totals - convert Decimal to number
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );

    // Fetch recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await db.transaction.findMany({
      where: {
        userId: dbUserId,
        date: { gte: thirtyDaysAgo },
        status: "COMPLETED", // Only include completed transactions
      },
      orderBy: { date: "desc" },
      take: 20,
      select: {
        description: true,
        amount: true,
        type: true,
        date: true,
        category: true,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Fetch budget
    const budget = await db.budget.findUnique({
      where: { userId: dbUserId },
      select: {
        amount: true,
      },
    });

    // Calculate spending by category for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await db.transaction.findMany({
      where: {
        userId: dbUserId,
        date: { gte: startOfMonth },
        type: "EXPENSE",
        status: "COMPLETED",
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // Group expenses by category
    const categorySpending = {};
    monthlyTransactions.forEach((t) => {
      const category = t.category || "Uncategorized";
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += Number(t.amount);
    });

    // Convert to array for easier handling
    const spendingByCategory = Object.entries(categorySpending).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    );

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      accounts,
      recentTransactions: transactions,
      budget: budget ? Number(budget.amount) : null,
      spendingByCategory,
      dbUserId, // Store for later use
    };
  } catch (error) {
    console.error("Error fetching financial context:", error);
    return null;
  }
}

/**
 * Build system prompt with user's financial data
 */
function buildSystemPrompt(context) {
  const budgetInfo = context.budget
    ? `Monthly Budget: $${context.budget.toFixed(2)}`
    : "No budget set";

  const totalMonthlySpent = context.spendingByCategory.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  const budgetStatus = context.budget
    ? `Budget Used: $${totalMonthlySpent.toFixed(2)} / $${context.budget.toFixed(2)} (${((totalMonthlySpent / context.budget) * 100).toFixed(0)}%)`
    : "";

  return `You are an AI financial advisor assistant for a personal finance platform. Your role is to help users understand their finances, provide insights, and answer questions about their spending, income, and budgets.

CURRENT USER FINANCIAL DATA:
- Total Balance (All Accounts): $${context.totalBalance.toFixed(2)}
- Income (Last 30 days): $${context.totalIncome.toFixed(2)}
- Expenses (Last 30 days): $${context.totalExpenses.toFixed(2)}
- Net (Last 30 days): $${(context.totalIncome - context.totalExpenses).toFixed(2)}
- ${budgetInfo}
${budgetStatus ? `- ${budgetStatus}` : ""}

ACCOUNTS:
${context.accounts
  .map(
    (acc) =>
      `- ${acc.name} (${acc.type}${acc.isDefault ? ", Default" : ""}): $${Number(acc.balance).toFixed(2)}`
  )
  .join("\n")}

SPENDING BY CATEGORY (This Month):
${
  context.spendingByCategory.length > 0
    ? context.spendingByCategory
        .sort((a, b) => b.amount - a.amount)
        .map((cat) => `- ${cat.category}: $${cat.amount.toFixed(2)}`)
        .join("\n")
    : "No expenses recorded this month"
}

RECENT TRANSACTIONS (Last 20):
${context.recentTransactions
  .map(
    (t) =>
      `- ${t.date.toLocaleDateString()}: ${t.description || "No description"} - $${Number(t.amount).toFixed(2)} (${t.type}${t.category ? `, ${t.category}` : ""})`
  )
  .join("\n")}

GUIDELINES:
1. Be detailed, helpful, and friendly
2. Use the provided financial data to give personalized advice
3. Alert users if they're overspending or exceeding their budget
4. Suggest ways to save money or optimize their spending
5. When asked about specific transactions or categories, reference the actual data
6. Keep responses under 200 words unless detailed analysis is requested
7. Use bullet points for clarity when listing multiple items
8. If you don't have enough information, ask clarifying questions
9. Highlight their biggest spending categories
10. Encourage setting a budget if they don't have one

IMPORTANT RULES:
- Do NOT use markdown.
- Do NOT use asterisks, bullet points, or numbered lists.
- Do NOT format text with symbols.
- Use plain sentences only.

IMPORTANT: Always base your responses on the user's actual financial data provided above.`;
}

/**
 * Save chat message to database
 */
async function saveChatMessage(dbUserId, role, content) {
  try {
    await db.chatMessage.create({
      data: {
        userId: dbUserId,
        role,
        content,
      },
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}

/**
 * Get chat history for user
 */
export async function getChatHistory() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) return [];

    const messages = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 50, // Last 50 messages
      select: {
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

/**
 * Send message to AI chatbot
 */
export async function sendChatMessage(message) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!message.trim()) {
      return { success: false, error: "Message cannot be empty" };
    }

    if (message.length > 1000) {
      return {
        success: false,
        error: "Message too long (max 1000 characters)",
      };
    }

    // Load financial context
    const context = await getUserFinancialContext();
    if (!context) {
      return { success: false, error: "Failed to load financial data" };
    }

    // Save user message
    await saveChatMessage(context.dbUserId, "user", message);

    // Build system prompt (financial context)
    const systemPrompt = buildSystemPrompt(context);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Call Gemini correctly
    const result = await model.generateContent({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1200, // 🔥 prevents incomplete answers
        temperature: 0.6,
        topP: 0.95,
      },
    });

    const response =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I couldn't generate a response.";

    // Save assistant reply
    await saveChatMessage(context.dbUserId, "assistant", response);

    // Revalidate chat page
    revalidatePath("/chatbot");

    return {
      success: true,
      response,
      message: "Message sent successfully",
    };
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send message",
    };
  }
}


/**
 * Clear chat history
 */
export async function clearChatHistory() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db.chatMessage.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/chatbot");

    return {
      success: true,
      message: "Chat history cleared successfully",
    };
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return {
      success: false,
      error: "Failed to clear chat history",
    };
  }
}

/**
 * Get quick financial insights
 */
export async function getQuickInsights() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const context = await getUserFinancialContext();
    if (!context) {
      return { success: false, error: "Failed to load financial data" };
    }

    const insights = [];

    // Check budget alert
    if (context.budget) {
      const totalMonthlySpent = context.spendingByCategory.reduce(
        (sum, cat) => sum + cat.amount,
        0
      );
      const percentUsed = (totalMonthlySpent / context.budget) * 100;

      if (percentUsed >= 90) {
        insights.push(
          `⚠️ You've used ${percentUsed.toFixed(0)}% of your monthly budget`
        );
      } else if (percentUsed >= 75) {
        insights.push(
          `💡 You've used ${percentUsed.toFixed(0)}% of your monthly budget. Watch your spending!`
        );
      }
    } else {
      insights.push(`💰 Consider setting a monthly budget to track your spending`);
    }

    // Check spending trend
    if (context.totalExpenses > context.totalIncome) {
      const deficit = context.totalExpenses - context.totalIncome;
      insights.push(
        `⚠️ You're spending ${deficit.toFixed(2)} more than you earn this month. Consider reducing expenses.`
      );
    } else {
      const savings = context.totalIncome - context.totalExpenses;
      insights.push(
        `✅ Great! You've saved $${savings.toFixed(2)} this month.`
      );
    }

    // Check account balance
    if (context.totalBalance < 1000) {
      insights.push(
        `🏦 Your total balance is low. Consider building an emergency fund.`
      );
    }

    // Highlight top spending category
    if (context.spendingByCategory.length > 0) {
      const topCategory = context.spendingByCategory.sort(
        (a, b) => b.amount - a.amount
      )[0];
      insights.push(
        `📊 Your biggest expense this month: ${topCategory.category} ($${topCategory.amount.toFixed(2)})`
      );
    }

    return { success: true, insights };
  } catch (error) {
    console.error("Error getting quick insights:", error);
    return { success: false, error: "Failed to generate insights" };
  }
}
