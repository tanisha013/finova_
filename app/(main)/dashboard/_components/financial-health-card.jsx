import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const metricInfo = {
  savingsRate: "Savings Rate = (Income - Expenses) / Income × 100",
  expenseRatio: "Expense Ratio = (Expenses / Income) × 100",
  budgetUsageLabel: "Budget Usage = (Expenses / Budget) × 100",
  emergencyFundCoverageLabel:
    "Emergency Fund Coverage = Total Account Balance / Monthly Expenses (months of expenses)",
};

const gradeStyles = {
  Excellent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Very Good": "border-emerald-200 bg-emerald-50 text-emerald-700",
  Good: "border-amber-200 bg-amber-50 text-amber-700",
  Fair: "border-amber-200 bg-amber-50 text-amber-700",
  "Needs Improvement": "border-rose-200 bg-rose-50 text-rose-700",
};

const metricItems = [
  { key: "savingsRate", label: "Savings Rate", suffix: "%" },
  { key: "budgetUsageLabel", label: "Budget Usage" },
  { key: "expenseRatio", label: "Expense Ratio", suffix: "%" },
  { key: "emergencyFundCoverageLabel", label: "Emergency Fund Coverage" },
];

const CIRCLE_RADIUS = 45;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const getOverallProgress = (score) => Math.min(100, Math.max(0, score));

const getMetricProgress = (key, healthScore) => {
  switch (key) {
    case "savingsRate":
      return Math.min(100, Math.max(0, (healthScore.savingsRate / 20) * 100));
    case "budgetUsageLabel":
      return healthScore.budgetUsage !== null
        ? healthScore.budgetUsage <= 100
          ? 100
          : Math.max(0, 100 - (healthScore.budgetUsage - 100))
        : 0;
    case "expenseRatio":
      return healthScore.expenseRatio <= 50
        ? 100
        : healthScore.expenseRatio > 100
        ? 0
        : Math.max(0, 100 - (healthScore.expenseRatio - 50) * 2);
    case "emergencyFundCoverageLabel":
      return Math.min(100, Math.max(0, (healthScore.emergencyFundCoverage / 6) * 100));
    default:
      return 0;
  }
};

const getOverallStrokeColor = (grade) => {
  if (grade === "Excellent" || grade === "Very Good") return "text-emerald-500";
  if (grade === "Good" || grade === "Fair") return "text-amber-500";
  return "text-rose-500";
};

const getProgressColor = (key, healthScore) => {
  if (key === "savingsRate") {
    if (healthScore.savingsRate >= 20) return "bg-emerald-500";
    if (healthScore.savingsRate >= 10) return "bg-amber-500";
    return "bg-rose-500";
  }

  if (key === "budgetUsageLabel") {
    if (healthScore.budgetUsage === null) return "bg-slate-400";
    if (healthScore.budgetUsage <= 100) return "bg-emerald-500";
    if (healthScore.budgetUsage <= 125) return "bg-amber-500";
    return "bg-rose-500";
  }

  if (key === "expenseRatio") {
    if (healthScore.expenseRatio <= 50) return "bg-emerald-500";
    if (healthScore.expenseRatio <= 75) return "bg-amber-500";
    return "bg-rose-500";
  }

  if (key === "emergencyFundCoverageLabel") {
    if (healthScore.emergencyFundCoverage >= 6 || healthScore.emergencyFundCoverage === Infinity) return "bg-emerald-500";
    if (healthScore.emergencyFundCoverage >= 3) return "bg-amber-500";
    return "bg-rose-500";
  }

  return "bg-slate-900";
};

export function FinancialHealthCard({ healthScore, recommendations }) {
  if (!healthScore) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-6 text-white">
        <div className="grid gap-6">
          <div className="grid gap-6 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-slate-950/20 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Financial Health</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">30-day score snapshot</h2>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {healthScore.grade}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-500/15 text-4xl font-semibold text-white shadow-2xl shadow-emerald-500/15">
                {healthScore.score}
              </div>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-300">
                  Your overall rating combines savings, budget adherence, expense control, and emergency preparedness.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Income</p>
                    <p className="mt-2 text-lg font-semibold text-white">₹{healthScore.income.toFixed(2)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Savings</p>
                    <p className="mt-2 text-lg font-semibold text-white">₹{healthScore.savings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-sm uppercase tracking-[0.18em] text-slate-500">
                <span>Score progress</span>
                <span className="text-white font-semibold">{getOverallProgress(healthScore.score)}%</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${getOverallProgress(healthScore.score)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">30-day financial overview</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Income</p>
                    <p className="mt-2 text-2xl font-semibold">₹{healthScore.income.toFixed(2)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Savings</p>
                    <p className="mt-2 text-2xl font-semibold">₹{healthScore.savings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-inner shadow-slate-200/40">
                <svg className="h-32 w-32 rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" strokeWidth="10" stroke="rgba(148,163,184,0.3)" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    className={getOverallStrokeColor(healthScore.grade)}
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * getOverallProgress(healthScore.score)) / 100}
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-semibold text-slate-950">{healthScore.score}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">
                    {healthScore.grade}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Recommendations</p>
            <p className="mt-2 text-sm text-slate-600">{recommendations?.success ? recommendations.overallAssessment : "Unable to load personalized recommendations at this time."}</p>
            {recommendations?.success ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {recommendations.strengths?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Improvements</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {recommendations.improvements?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <TooltipProvider>
            <div className="grid gap-4">
              {metricItems.map((item) => {
                const value = healthScore[item.key];
                const isEmergency = item.key === "emergencyFundCoverageLabel";
                const labelClass = isEmergency ? "text-sm font-semibold text-slate-900" : "text-sm font-medium text-slate-900";

                return (
                  <div key={item.key} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={labelClass}>{item.label}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                                <Info className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {metricInfo[item.key]}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {isEmergency ? (
                          <div className="mt-3 inline-flex items-center rounded-md bg-slate-100/60 px-3 py-1">
                            <span className="text-lg font-semibold text-slate-700">{value !== null && value !== undefined ? `${value}${item.suffix || ""}` : "—"}</span>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-600">{value !== null && value !== undefined ? `${value}${item.suffix || ""}` : "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
