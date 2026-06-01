import { getUserAccounts } from "@/actions/dashboard";
import ImportBankStatementClient from "./importer-client";

export default async function BankStatementImportPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const accountId = typeof searchParams?.accountId === "string" ? searchParams.accountId : undefined;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="flex justify-center md:justify-normal mb-8">
        <div>
          <h1 className="text-6xl bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x font-extrabold">
            Import Bank Statement
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Upload a CSV or PDF bank statement and automatically create transactions with category, type, and recurrence data.
          </p>
        </div>
      </div>

      <ImportBankStatementClient accounts={accounts} defaultAccountId={accountId} />
    </div>
  );
}
