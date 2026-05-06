import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const petId = String(formData.get("petId") ?? "");
  const file = formData.get("file");

  if (!petId || !(file instanceof File)) {
    return new Response("Missing file", { status: 400 });
  }

  if (file.size > 2_000_000) {
    return new Response("File is too large. Max 2MB.", { status: 413 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, client: { veterinarianId: session.user.id } },
    select: { id: true },
  });

  if (!pet) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileUrl = `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;

  await prisma.attachment.create({
    data: {
      petId: pet.id,
      fileUrl,
      type: file.type || "file",
    },
  });

  return Response.redirect(new URL(`/pets/${pet.id}`, request.url));
}
