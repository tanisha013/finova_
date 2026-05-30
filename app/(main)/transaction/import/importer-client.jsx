"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImportBankStatementClient({ accounts }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState(accounts?.[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select a CSV or PDF file.");
      return;
    }

    if (!accountId) {
      toast.error("Please select an account to import into.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);

    try {
      setLoading(true);
      const response = await fetch("/api/transaction/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Import failed. Please try again.");
      }

      toast.success(`${result.createdCount} transactions imported successfully.`);
      router.push(`/account/${accountId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Bank Statement Import</CardTitle>
          <CardDescription>
            Extract transaction details from your bank statement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Import Into Account</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Statement File</label>
              <Input
                type="file"
                accept=".csv,application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV and PDF. Upload your bank statement and scan it to import transactions automatically with category, amount, type, and recurrence.
              </p>
            </div>

            {file && (
              <p className="text-sm text-muted-foreground break-all">
                Selected file: {file.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Imported transactions will appear in the selected account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </span>
                ) : (
                  "Import Statement"
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
