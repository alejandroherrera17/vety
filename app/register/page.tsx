import { Stethoscope } from "lucide-react";
import { RegisterForm } from "@/components/auth-forms";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-black to-black p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
            <Stethoscope className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold">Crea tu cuenta de clínica</h1>
          <p className="mt-2 text-sm text-black/60">Un espacio de trabajo seguro para flujos de trabajo veterinarios reales.</p>
        </div>
        <RegisterForm />
      </Card>
    </main>
  );
}
