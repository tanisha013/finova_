"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a receipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try { 
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

export async function importBankStatement(file, accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    const parsedTransactions = await parseBankStatementWithGemini(file);
    const normalizedTransactions = parsedTransactions
      .map(normalizeImportedTransaction)
      .filter((transaction) => transaction && transaction.amount > 0);

    if (normalizedTransactions.length === 0) {
      throw new Error("No valid transactions were found in the statement.");
    }

    const uniqueTransactions = [];
    const seenKeys = new Set();

    for (const transaction of normalizedTransactions) {
      const key = `${transaction.date}|${transaction.amount}|${transaction.type}|${transaction.description}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueTransactions.push(transaction);
      }
    }

    if (uniqueTransactions.length === 0) {
      throw new Error("No new transactions were found after removing duplicates.");
    }

    const existingTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        accountId: account.id,
        OR: uniqueTransactions.map((transaction) => ({
          date: new Date(transaction.date),
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
        })),
      },
      select: {
        date: true,
        amount: true,
        type: true,
        description: true,
      },
    });

    const existingKeys = new Set(
      existingTransactions.map((transaction) =>
        `${transaction.date.toISOString()}|${transaction.amount}|${transaction.type}|${transaction.description}`
      )
    );

    const finalTransactions = uniqueTransactions.filter((transaction) => {
      const key = `${transaction.date}|${transaction.amount}|${transaction.type}|${transaction.description}`;
      return !existingKeys.has(key);
    });

    if (finalTransactions.length === 0) {
      throw new Error("All parsed transactions already exist in this account.");
    }

    const balanceChange = finalTransactions.reduce((sum, transaction) => {
      return sum + (transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount);
    }, 0);

    await db.$transaction(async (tx) => {
      await tx.transaction.createMany({
        data: finalTransactions.map((transaction) => ({
          ...transaction,
          userId: user.id,
          accountId: account.id,
          nextRecurringDate:
            transaction.isRecurring && transaction.recurringInterval
              ? calculateNextRecurringDate(transaction.date, transaction.recurringInterval)
              : null,
        })),
      });

      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${account.id}`);

    return { success: true, createdCount: finalTransactions.length };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function parseBankStatementWithGemini(file) {
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || "";
  const isCsv =
    mimeType === "text/csv" ||
    mimeType === "application/csv" ||
    mimeType === "application/vnd.ms-excel" ||
    file.name?.toLowerCase().endsWith(".csv");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  let result;

  const runGenerate = async () => {
    if (isCsv) {
      const csvString = Buffer.from(arrayBuffer).toString("utf-8");
      const prompt = `
        You are a bank statement parser. Convert the CSV text below into a JSON array of transactions.
        Each transaction should include:
        - date: ISO date string
        - description: brief description
        - amount: numeric amount
        - type: either EXPENSE or INCOME
        - category: one of housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense
        - isRecurring: true or false
        - recurringInterval: DAILY, WEEKLY, MONTHLY, YEARLY or null

        Only respond with valid JSON. Do not include extra text.

        CSV:
        ${csvString}
      `;
      return await model.generateContent([prompt]);
    }

    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const prompt = `
      You are a bank statement parser. Analyze the attached statement file and extract the transactions.
      Each transaction should include:
      - date: ISO date string
      - description: brief description
      - amount: numeric amount
      - type: either EXPENSE or INCOME
      - category: one of housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense
      - isRecurring: true or false
      - recurringInterval: DAILY, WEEKLY, MONTHLY, YEARLY or null

      Only respond with valid JSON. Do not include extra text.
    `;
    return await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: mimeType || "application/pdf",
        },
      },
      prompt,
    ]);
  };

  try {
    result = await retryGeminiRequest(runGenerate);
  } catch (error) {
    console.error("Gemini request failed:", error);
    throw new Error(
      error.message?.includes("Service Unavailable")
        ? "Gemini is temporarily unavailable. Please try again later."
        : "Unable to parse the statement results from Gemini."
    );
  }

  const response = await result.response;
  const text = await response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed)) {
      throw new Error("Parsed result is not an array of transactions.");
    }
    return parsed;
  } catch (parseError) {
    console.error("Error parsing bank statement response:", parseError, cleanedText);
    throw new Error("Unable to parse the statement results from Gemini.");
  }
}

async function retryGeminiRequest(fn) {
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1200;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      const statusCode = error?.status || error?.code || "";
      const isTemporary =
        message.includes("503") ||
        message.includes("service unavailable") ||
        message.includes("high demand") ||
        statusCode === 503;

      if (attempt === MAX_RETRIES || !isTemporary) {
        throw error;
      }

      const delayMs = BASE_DELAY_MS * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Gemini request failed after retrying.");
}

function normalizeImportedTransaction(transaction) {
  if (!transaction) {
    return null;
  }

  const rawAmount = Number(transaction.amount);
  if (Number.isNaN(rawAmount) || rawAmount === 0) {
    return null;
  }

  const amount = Math.abs(rawAmount);
  const typeRaw = String(transaction.type || "").trim().toUpperCase();
  const type =
    typeRaw === "EXPENSE" || typeRaw === "INCOME"
      ? typeRaw
      : rawAmount < 0
      ? "EXPENSE"
      : "INCOME";

  const categoryRaw = String(transaction.category || "other-expense").trim().toLowerCase();
  const category = categoryRaw || "other-expense";

  const recurringIntervalRaw = String(transaction.recurringInterval || "")
    .trim()
    .toUpperCase();
  const recurringInterval =
    ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(recurringIntervalRaw)
      ? recurringIntervalRaw
      : null;

  const dateValue = new Date(transaction.date);
  const date = Number.isNaN(dateValue.getTime())
    ? new Date().toISOString()
    : dateValue.toISOString();

  return {
    date,
    description:
      String(transaction.description || transaction.merchantName || "Imported transaction").trim(),
    amount,
    type,
    category,
    isRecurring:
      transaction.isRecurring === true ||
      transaction.isRecurring === "true" ||
      String(transaction.isRecurring).toLowerCase() === "yes",
    recurringInterval,
  };
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}