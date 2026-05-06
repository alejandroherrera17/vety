import { redirect } from "next/navigation";
import { getCurrentVeterinarian } from "@/lib/session";

export default async function Home() {
  const veterinarian = await getCurrentVeterinarian();
  redirect(veterinarian ? "/dashboard" : "/login");
}
