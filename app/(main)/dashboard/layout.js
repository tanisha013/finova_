import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import DashboardPage from "./page";
import { ChatbotFloatingButton } from "./_components/chatButton";
import { checkUser } from "@/lib/checkUser";

export default async function Layout() {
  await checkUser();
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
          Dashboard
        </h1>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <DashboardPage/>
      </Suspense>
      <ChatbotFloatingButton/>
    </div>
  );
}