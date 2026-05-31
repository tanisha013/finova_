import Link from "next/link";
import { getUserAccounts, getDashboardData, getFinancialHealthScore, generateFinancialHealthRecommendations } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { FinancialHealthCard } from "./_components/financial-health-card";

export default async function DashboardPage() {
  const [accounts, transactions, healthScore] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getFinancialHealthScore(),
  ]);

  const healthRecommendations = await generateFinancialHealthRecommendations(
    healthScore
  );

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/transaction/import">Import Bank Statement</Link>
        </Button>
      </div>

      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      <FinancialHealthCard
        healthScore={healthScore}
        recommendations={healthRecommendations}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}