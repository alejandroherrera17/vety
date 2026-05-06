import { Suspense } from "react";
import { Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Stethoscope className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold">Sign in to VetyCare</h1>
          <p className="mt-2 text-sm text-slate-500">Clinical records, clients, and patients in one workspace.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
