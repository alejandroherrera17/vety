import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/session";

export async function POST(request: Request) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const purpose = String(formData.get("purpose") ?? "");
  const petId = String(formData.get("petId") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new Response("Missing file", { status: 400 });
  }

  if (file.size > 2_000_000) {
    return new Response("File is too large. Max 2MB.", { status: 413 });
  }

  if (purpose === "clinic-logo") {
    if (!file.type.startsWith("image/")) {
      return new Response("Logo must be an image", { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileUrl = `data:${file.type || "image/png"};base64,${bytes.toString("base64")}`;

    await prisma.organization.update({
      where: { id: workspace.organizationId },
      data: { logoUrl: fileUrl },
    });

    return Response.json({ fileUrl });
  }

  if (!petId) {
    return new Response("Missing pet", { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, organizationId: workspace.organizationId },
    select: { id: true },
  });

  if (!pet) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileUrl = `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;

  await prisma.attachment.create({
    data: {
      organizationId: workspace.organizationId,
      petId: pet.id,
      fileUrl,
      type: file.type || "file",
      fileName: file.name,
      category: file.type.startsWith("image/") ? "imagen" : "documento",
    },
  });

  return Response.redirect(new URL(`/pets/${pet.id}`, request.url));
}
