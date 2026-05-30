import { importBankStatement } from "@/actions/transaction";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const accountId = formData.get("accountId");

    if (!file || typeof file === "string") {
      return Response.json({ error: "A valid file is required." }, { status: 400 });
    }

    if (!accountId || typeof accountId !== "string") {
      return Response.json({ error: "Account selection is required." }, { status: 400 });
    }

    const result = await importBankStatement(file, accountId);
    return Response.json(result);
  } catch (error) {
    console.error("Import route error:", error);
    return Response.json(
      { error: error?.message || "Unable to import bank statement." },
      { status: 500 }
    );
  }
}
