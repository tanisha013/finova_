import { getAccountCashFlowPrediction } from "@/actions/cashflow-prediction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusStyle = {
  "Healthy Cash Flow": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Moderate Risk": "border-amber-200 bg-amber-50 text-amber-700",
  "Overspending Risk": "border-red-200 bg-red-50 text-red-700",
  "No Recent Activity": "border-slate-200 bg-slate-50 text-slate-700",
};

const statusSymbol = {
  "Healthy Cash Flow": "✓",
  "Moderate Risk": "⚠",
  "Overspending Risk": "⚠",
  "No Recent Activity": "ℹ",
};

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

export async function AccountCashflowCard({ accountId }) {
  const prediction = await getAccountCashFlowPrediction(accountId);

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Cash Flow Prediction</CardTitle>
          <CardDescription>Unable to load prediction data at this time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please refresh the page or try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const { predictedIncome, predictedExpenses, projectedBalance, status, summary, recommendations } = prediction;
  const badgeClasses = statusStyle[status] ?? statusStyle["No Recent Activity"];

  return (
    <Card>
      <CardHeader className="gap-3">
        <div>
          <CardTitle>AI Cash Flow Prediction</CardTitle>
          <CardDescription>Forecasts are based on the selected account&apos;s recent transactions.</CardDescription>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${badgeClasses}`}
        >
          {statusSymbol[status]} {status}
        </span>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-3xl border border-border bg-muted p-5">
          <p className="text-sm text-muted-foreground">Predicted Income</p>
          <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(predictedIncome)}</p>
        </div>
        <div className="space-y-2 rounded-3xl border border-border bg-muted p-5">
          <p className="text-sm text-muted-foreground">Predicted Expenses</p>
          <p className="text-2xl font-semibold text-red-600">{formatCurrency(predictedExpenses)}</p>
        </div>
        <div className="space-y-2 rounded-3xl border border-border bg-muted p-5">
          <p className="text-sm text-muted-foreground">Projected Balance</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(projectedBalance)}</p>
        </div>
      </CardContent>

      <div className="border-t border-border px-6 pb-6 pt-4">
        <p className="mb-4 text-sm text-muted-foreground">{summary}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation}-${index}`}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
            >
              <span className="block font-semibold text-slate-900">Recommendation {index + 1}</span>
              <p className="mt-1">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
