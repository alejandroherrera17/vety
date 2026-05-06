import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 11 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.flatMap((line) => [`(${escapePdfText(line.slice(0, 95))}) Tj`, "T*"]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return Buffer.from(pdf);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const pet = await prisma.pet.findFirst({
    where: { id, client: { veterinarianId: session.user.id } },
    include: {
      client: true,
      vaccinations: { orderBy: { date: "desc" } },
      medicalRecords: {
        where: { veterinarianId: session.user.id },
        include: { consultations: { orderBy: { date: "desc" } } },
      },
    },
  });

  if (!pet) {
    return new Response("Not found", { status: 404 });
  }

  const consultations = pet.medicalRecords.flatMap((record) => record.consultations);
  const lines = [
    "VetyCare Medical History",
    "",
    `Pet: ${pet.name} (${pet.species})`,
    `Owner: ${pet.client.name} - ${pet.client.phone}`,
    `Sex: ${pet.sex}`,
    `Breed: ${pet.breed ?? "N/A"}`,
    `Birth date: ${formatDate(pet.birthDate)}`,
    "",
    "Consultations",
    ...consultations.flatMap((consultation) => [
      `${formatDate(consultation.date)} | Diagnosis: ${consultation.diagnosis}`,
      `Symptoms: ${consultation.symptoms}`,
      `Treatment: ${consultation.treatment}`,
      consultation.observations ? `Observations: ${consultation.observations}` : "",
      "",
    ]),
    "Vaccinations",
    ...pet.vaccinations.map(
      (vaccination) =>
        `${formatDate(vaccination.date)} | ${vaccination.vaccine} | Next: ${formatDate(vaccination.nextDose)}`,
    ),
  ].filter(Boolean);

  const pdf = createPdf(lines);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pet.name}-history.pdf"`,
    },
  });
}
