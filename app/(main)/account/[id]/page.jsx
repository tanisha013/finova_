import { Suspense } from "react";
import Link from "next/link";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { AccountChart } from "../_components/account-chart";
import { AccountCashflowCard } from "@/components/account-cashflow-card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
              ₹{parseFloat(account.balance).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {account._count.transactions} Transactions
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/transaction/import?accountId=${id}`}>
              Import Bank Statement
            </Link>
          </Button>
        </div>
      </div>

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountCashflowCard accountId={id} />
      </Suspense>

       <Suspense
         fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
       >
         <TransactionTable transactions={transactions} />
       </Suspense>
     </div>
   );
 } 