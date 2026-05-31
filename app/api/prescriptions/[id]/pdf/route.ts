import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/session";
import { formatDate } from "@/lib/utils";

const h = React.createElement;

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: "Helvetica", color: "#0b1724", backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  logo: { width: 58, height: 58, borderRadius: 14, backgroundColor: "#27ADF5", color: "#ffffff", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: 700 },
  brand: { fontSize: 24, fontWeight: 700 },
  muted: { color: "#24546f", fontSize: 10, lineHeight: 1.5 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  section: { border: "1px solid #b8e2fb", borderRadius: 10, padding: 14, marginBottom: 14, backgroundColor: "#f4faff" },
  sectionTitle: { fontSize: 11, color: "#27ADF5", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" },
  grid: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  label: { color: "#24546f", fontSize: 9, marginBottom: 3 },
  value: { fontSize: 11, marginBottom: 7, lineHeight: 1.4 },
  medication: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  signature: { marginTop: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  line: { width: 210, borderTop: "1px solid #0b1724", paddingTop: 6 },
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!workspace.isPremium) {
    return new Response("Premium required", { status: 402 });
  }

  const { id } = await context.params;
  const prescription = await prisma.prescription.findFirst({
    where: { id, consultation: { medicalRecord: { organizationId: workspace.organizationId } } },
    include: {
      consultation: {
        include: {
          medicalRecord: {
            include: {
              veterinarian: true,
              pet: { include: { client: true } },
            },
          },
        },
      },
    },
  });

  if (!prescription) {
    return new Response("Not found", { status: 404 });
  }

  const record = prescription.consultation.medicalRecord;
  const initials = workspace.organizationName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const stream = await renderToStream(
    h(Document, null,
      h(Page, { size: "A4", style: styles.page },
        h(View, { style: styles.header },
          h(View, { style: { flexDirection: "row", alignItems: "center", gap: 12 } },
            workspace.organizationLogoUrl
              ? h(Image, { src: workspace.organizationLogoUrl, style: { width: 58, height: 58, borderRadius: 14, objectFit: "cover" } })
              : h(View, { style: styles.logo }, h(Text, { style: styles.logoText }, initials)),
            h(View, null, h(Text, { style: styles.brand }, workspace.organizationName), h(Text, { style: styles.muted }, "Formula medica veterinaria")),
          ),
          h(View, null,
            h(Text, { style: styles.muted }, `Fecha: ${formatDate(prescription.createdAt)}`),
            h(Text, { style: styles.muted }, `ID: ${prescription.id.slice(0, 8).toUpperCase()}`),
          ),
        ),
        h(Text, { style: styles.title }, "Prescripcion"),
        h(View, { style: styles.section },
          h(Text, { style: styles.sectionTitle }, "Paciente y propietario"),
          h(View, { style: styles.grid },
            h(View, { style: styles.col },
              h(Text, { style: styles.label }, "Mascota"),
              h(Text, { style: styles.value }, record.pet.name),
              h(Text, { style: styles.label }, "Especie / raza"),
              h(Text, { style: styles.value }, `${record.pet.species} / ${record.pet.breed ?? "N/A"}`),
            ),
            h(View, { style: styles.col },
              h(Text, { style: styles.label }, "Propietario"),
              h(Text, { style: styles.value }, record.pet.client.name),
              h(Text, { style: styles.label }, "Telefono"),
              h(Text, { style: styles.value }, record.pet.client.phone),
            ),
          ),
        ),
        h(View, { style: styles.section },
          h(Text, { style: styles.sectionTitle }, "Tratamiento formulado"),
          h(Text, { style: styles.medication }, prescription.medication),
          h(View, { style: styles.grid },
            h(View, { style: styles.col }, h(Text, { style: styles.label }, "Dosis"), h(Text, { style: styles.value }, prescription.dosage)),
            h(View, { style: styles.col }, h(Text, { style: styles.label }, "Duracion"), h(Text, { style: styles.value }, prescription.duration)),
          ),
          h(Text, { style: styles.label }, "Indicaciones"),
          h(Text, { style: styles.value }, prescription.instructions ?? "Sin indicaciones adicionales."),
        ),
        h(View, { style: styles.section },
          h(Text, { style: styles.sectionTitle }, "Veterinario"),
          h(Text, { style: styles.value }, record.veterinarian.name),
          h(Text, { style: styles.muted }, record.veterinarian.email),
          h(Text, { style: styles.muted }, record.veterinarian.phone ?? ""),
        ),
        h(View, { style: styles.signature },
          h(Text, { style: styles.muted }, "Documento generado por VettiPets"),
          h(View, { style: styles.line }, h(Text, { style: styles.value }, "Firma y sello")),
        ),
      ),
    ),
  );

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="prescription-${prescription.id}.pdf"`,
    },
  });
}
