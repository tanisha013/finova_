"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function AccountImportBankStatementClient({ accountId }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select a CSV or PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);

    try {
      setLoading(true);
      setSuccess(null);

      const response = await fetch("/api/transaction/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Import failed. Please try again.");
      }

      setSuccess(result.createdCount);
      toast.success(`✓ Transactions imported successfully. Imported: ${result.createdCount}`);
      setFile(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Import Bank Statement</CardTitle>
          <CardDescription>
            Import transactions directly into this account using a CSV or PDF bank statement.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-2"
        >
          {isOpen ? "Hide Import" : "Upload Statement"}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Statement File</label>
              <Input
                type="file"
                accept=".csv,application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV and PDF. Transactions are imported into the selected account with category, type, and recurring details.
              </p>
            </div>

            {file && (
              <div className="rounded-3xl border border-border bg-muted p-4">
                <p className="text-sm font-medium">Selected file</p>
                <p className="text-sm text-muted-foreground break-all">{file.name}</p>
              </div>
            )}

            {success !== null && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-semibold">Import completed.</p>
                <p>Imported {success} transaction{success === 1 ? "" : "s"} successfully.</p>
                <p>Account analytics and balance have been refreshed.</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                You are importing into the current account. Duplicate or invalid rows will be skipped.
              </p>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Statement
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
