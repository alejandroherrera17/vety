import React from "react";
import { Document, Image, Page, Text, View, renderToStream } from "@react-pdf/renderer";
import { calculateAge } from "@/lib/clinical";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { createPdfStyles } from "@/lib/pdf-styles";
import type { ThemeName } from "@/lib/themes/themes";

const h = React.createElement;

type PdfType = "complete" | "summary" | "vaccines";

function field(label: string, value?: string | number | null) {
  return h(View, null, h(Text, { style: { color: "#64748b", fontSize: 7, textTransform: "uppercase", marginBottom: 2 } }, label), h(Text, { style: { fontSize: 9, lineHeight: 1.4, marginBottom: 7 } }, value || "No registrado"));
}

function header(
  type: PdfType,
  styles: ReturnType<typeof createPdfStyles>,
  workspace: { organizationName: string; organizationLogoUrl: string | null },
) {
  const title = type === "vaccines" ? "Carnet de vacunacion" : type === "summary" ? "Resumen clinico" : "Historia clinica integral";
  const initials = workspace.organizationName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return h(View, { style: styles.header, fixed: true },
    h(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: 16 } },
      h(View, { style: { flexDirection: "row", gap: 12 } },
        workspace.organizationLogoUrl
          ? h(Image, { src: workspace.organizationLogoUrl, style: { width: 42, height: 42, borderRadius: 12, objectFit: "cover" } })
          : h(Text, { style: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#ffffff", color: "#27ADF5", fontSize: 18, fontWeight: 700, textAlign: "center", paddingTop: 11 } }, initials),
        h(View, null,
          h(Text, { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, `${workspace.organizationName} - ${title}`),
          h(Text, { style: { color: "#ffffff", lineHeight: 1.5 } }, "Documento clinico generado por VettiPets"),
        ),
      ),
      h(Text, { style: { color: "#ffffff" } }, `Generado ${formatDate(new Date())}`),
    ),
  );
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return new Response("Unauthorized", { status: 401 });
  if (!workspace.isPremium) return new Response("Premium required", { status: 402 });

  const url = new URL(request.url);
  const type = (url.searchParams.get("type") || "complete") as PdfType;
  const { id } = await context.params;

  // Get veterinarian with theme
  const veterinarian = await prisma.veterinarian.findUnique({
    where: { id: workspace.veterinarianId },
    select: { theme: true }
  });

  const themeName: ThemeName = veterinarian?.theme ?? 'midnight_vet';
  const styles = createPdfStyles(themeName, 'light');

  const pet = await prisma.pet.findFirst({
    where: { id, organizationId: workspace.organizationId },
    include: {
      client: true,
      vaccinations: { orderBy: { date: "desc" } },
      attachments: { orderBy: { createdAt: "desc" } },
      medicalRecords: {
        where: { organizationId: workspace.organizationId },
        include: { consultations: { orderBy: { date: "desc" }, include: { prescriptions: { orderBy: { createdAt: "desc" } } } } },
      },
    },
  });

  if (!pet) return new Response("Not found", { status: 404 });

  const consultations = pet.medicalRecords.flatMap((record) => record.consultations);
  const latest = consultations[0];
  const showClinical = type !== "vaccines";
  const showVaccines = type !== "summary";

  const doc = h(Document, { title: `${pet.name} - Historia clinica` },
    h(Page, { size: "A4", style: styles.page, wrap: true },
      header(type, styles, workspace),
      h(View, { style: styles.section },
        h(View, { style: styles.headerRow },
          h(View, { style: { flex: 1 } },
            h(Text, { style: styles.badge }, "Paciente identificado"),
            h(Text, { style: styles.sectionTitle }, pet.name),
            h(View, { style: styles.grid },
              h(View, { style: styles.column },
                field("Especie", pet.species),
                field("Raza", pet.breed),
                field("Sexo", pet.sex),
                field("Color", pet.color),
              ),
              h(View, { style: styles.column },
                field("Nacimiento", formatDate(pet.birthDate)),
                field("Edad", calculateAge(pet.birthDate)),
                field("Peso actual", pet.weight ? `${pet.weight} kg` : null),
                field("Microchip", pet.microchip),
              ),
            ),
          ),
          h(Text, { style: styles.qr }, "QR ID"),
        ),
      ),
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Propietario"),
        h(View, { style: styles.grid },
          h(View, { style: styles.column }, field("Nombre", pet.client.name), field("Telefono", pet.client.phone), field("Email", pet.client.email)),
          h(View, { style: styles.column }, field("Documento", pet.client.document), field("Direccion", pet.client.address), field("Emergencia", pet.client.emergencyContact)),
        ),
      ),
      showClinical ? h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Dashboard clinico"),
        h(View, { style: styles.grid },
          h(View, { style: styles.column }, field("Alergias", pet.allergies), field("Enfermedades previas", pet.previousDiseases)),
          h(View, { style: styles.column }, field("Medicamentos frecuentes", pet.frequentMedications), field("Ultimo tratamiento", latest?.treatment)),
        ),
      ) : null,
      showVaccines ? h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Vacunas"),
        h(View, { style: styles.tableHeader }, h(Text, { style: styles.wideCell }, "Vacuna"), h(Text, { style: styles.cell }, "Fecha"), h(Text, { style: styles.cell }, "Proxima"), h(Text, { style: styles.cell }, "Lote"), h(Text, { style: styles.cell }, "Fabricante")),
        ...pet.vaccinations.map((vaccination) => h(View, { key: vaccination.id, style: styles.row },
          h(Text, { style: styles.wideCell }, vaccination.vaccine),
          h(Text, { style: styles.cell }, formatDate(vaccination.date)),
          h(Text, { style: styles.cell }, formatDate(vaccination.nextDose)),
          h(Text, { style: styles.cell }, vaccination.lot || "N/A"),
          h(Text, { style: styles.cell }, vaccination.manufacturer || "N/A"),
        )),
      ) : null,
      showClinical ? h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Timeline medico"),
        ...consultations.slice(0, type === "summary" ? 3 : 20).map((consultation) => h(View, { key: consultation.id, style: styles.timelineItem },
          h(Text, { style: { fontWeight: 700 } }, `${formatDate(consultation.date)} · ${consultation.reason || consultation.diagnosis}`),
          h(Text, { style: { color: "#64748b", marginTop: 3 } }, `Sintomas: ${consultation.symptoms}`),
          h(Text, { style: { marginTop: 3 } }, `Diagnostico: ${consultation.definitiveDiagnosis || consultation.diagnosis}`),
          h(Text, { style: { marginTop: 3 } }, `Tratamiento: ${consultation.treatment}`),
          consultation.prescriptions.length ? h(Text, { style: { marginTop: 3, color: "#4338ca" } }, `Medicamentos: ${consultation.prescriptions.map((item) => `${item.medication} ${item.dosage}`).join(", ")}`) : null,
        )),
      ) : null,
      showClinical && type === "complete" ? h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Examenes y archivos"),
        ...(pet.attachments.length ? pet.attachments.map((attachment) => h(View, { key: attachment.id, style: styles.row },
          h(Text, { style: styles.wideCell }, attachment.fileName || attachment.category || "Archivo clinico"),
          h(Text, { style: styles.cell }, attachment.type),
          h(Text, { style: styles.cell }, formatDate(attachment.createdAt)),
        )) : [h(Text, { key: "empty", style: styles.value }, "Sin archivos adjuntos.")]),
      ) : null,
      h(View, { style: styles.footer, fixed: true },
        h(Text, null, `${workspace.organizationName} - Expediente medico veterinario`),
        h(Text, { render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Pagina ${pageNumber} de ${totalPages}` }),
      ),
    ),
  );

  const stream = await renderToStream(doc);
  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pet.name}-${type}.pdf"`,
    },
  });
}
