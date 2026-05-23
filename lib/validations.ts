import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const registerSchema = z.object({
  clinicName: z.string().trim().min(2, "El nombre de la clinica es obligatorio"),
  adminName: z.string().trim().min(2, "Tu nombre es obligatorio"),
  email: z.email("Ingresa un email valido").trim().toLowerCase(),
  phone: optionalText,
  password: z.string().min(8, "Usa al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Ingresa un email valido").trim().toLowerCase(),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

export const clientSchema = z.object({
  id: optionalText,
  name: z.string().trim().min(2, "El nombre del cliente es obligatorio"),
  document: optionalText,
  phone: z.string().trim().min(5, "El telefono es obligatorio"),
  email: z.union([z.email("Email invalido"), z.literal("")]).optional(),
  address: optionalText,
  city: optionalText,
  emergencyContact: optionalText,
});

export const petSchema = z.object({
  id: optionalText,
  name: z.string().trim().min(2, "El nombre de la mascota es obligatorio"),
  species: z.string().trim().min(2, "La especie es obligatoria"),
  breed: optionalText,
  sex: z.string().trim().min(1, "El sexo es obligatorio"),
  birthDate: optionalText,
  weight: z.coerce.number().positive("El peso debe ser positivo").optional().or(z.literal("").transform(() => undefined)),
  photoUrl: optionalText,
  color: optionalText,
  reproductiveStatus: optionalText,
  microchip: optionalText,
  allergies: optionalText,
  previousDiseases: optionalText,
  frequentMedications: optionalText,
  generalObservations: optionalText,
  clientId: z.string().uuid("Selecciona un cliente"),
});

export const clinicalEventStatusSchema = z.enum(["open", "stable", "critical", "closed", "scheduled"]);

export const consultationSchema = z.object({
  petId: z.string().uuid(),
  date: z.string().min(1, "La fecha es obligatoria"),
  reason: optionalText,
  anamnesis: optionalText,
  symptoms: z.string().trim().min(3, "Los sintomas son obligatorios"),
  commonSymptoms: z.array(z.string()).default([]),
  temperature: z.coerce.number().positive("Temperatura invalida").optional().or(z.literal("").transform(() => undefined)),
  heartRate: z.coerce.number().int().positive("Frecuencia invalida").optional().or(z.literal("").transform(() => undefined)),
  respiratoryRate: z.coerce.number().int().positive("Frecuencia invalida").optional().or(z.literal("").transform(() => undefined)),
  weight: z.coerce.number().positive("El peso debe ser positivo").optional().or(z.literal("").transform(() => undefined)),
  physicalExam: optionalText,
  presumptiveDiagnosis: optionalText,
  diagnosis: z.string().trim().min(3, "El diagnostico es obligatorio"),
  definitiveDiagnosis: optionalText,
  treatment: z.string().trim().min(3, "El tratamiento es obligatorio"),
  recommendations: optionalText,
  evolution: optionalText,
  observations: optionalText,
  status: clinicalEventStatusSchema.default("open"),
  templateName: optionalText,
});

export const appointmentStatusSchema = z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]);
export const appointmentRequestStatusSchema = z.enum(["pending", "approved", "rejected", "rescheduled", "cancelled"]);
export const organizationRoleSchema = z.enum(["admin", "veterinarian", "receptionist"]);

const appointmentBaseSchema = z.object({
  id: optionalText,
  petId: z.string().uuid("Selecciona una mascota"),
  assignedVeterinarianId: optionalText,
  title: z.string().trim().min(3, "El titulo es obligatorio"),
  notes: optionalText,
  startDate: z.string().min(1, "La fecha inicial es obligatoria"),
  endDate: z.string().min(1, "La fecha final es obligatoria"),
  status: appointmentStatusSchema,
});

const validateAppointmentDates = {
  message: "La fecha final debe ser posterior al inicio",
  path: ["endDate"],
};

export const appointmentSchema = appointmentBaseSchema.refine(
  (value) => new Date(value.endDate) > new Date(value.startDate),
  validateAppointmentDates,
);

export const createAppointmentSchema = appointmentBaseSchema.omit({ id: true }).refine(
  (value) => new Date(value.endDate) > new Date(value.startDate),
  validateAppointmentDates,
);

export const updateAppointmentSchema = appointmentBaseSchema
  .required({ id: true })
  .refine((value) => new Date(value.endDate) > new Date(value.startDate), {
    message: "La fecha final debe ser posterior al inicio",
    path: ["endDate"],
  });

export const organizationProfileSchema = z.object({
  name: z.string().trim().min(2, "El nombre de la clinica es obligatorio"),
  logoUrl: optionalText,
  address: optionalText,
  city: optionalText,
  phone: optionalText,
  openingHours: optionalText,
  specialties: optionalText,
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.email("Ingresa un email valido").trim().toLowerCase(),
  phone: optionalText,
  role: organizationRoleSchema.exclude(["admin"]),
  password: z.string().min(8, "Usa al menos 8 caracteres"),
});

export const updateTeamMemberSchema = z.object({
  id: z.string().uuid(),
  role: organizationRoleSchema,
  status: z.enum(["active", "disabled"]),
});

export const portalAppointmentRequestSchema = z
  .object({
    organizationId: z.string().uuid("Selecciona una clinica"),
    clientDocument: z.string().trim().min(5, "Ingresa el documento del propietario"),
    petId: z.string().uuid("Selecciona una mascota"),
    service: z.string().trim().min(2, "Selecciona o escribe un servicio"),
    reason: optionalText,
    requestedVeterinarianId: optionalText,
    requestedStart: z.string().min(1, "Selecciona fecha y hora"),
    requestedEnd: optionalText,
  })
  .refine(
    (value) =>
      !value.requestedEnd ||
      new Date(value.requestedEnd) > new Date(value.requestedStart),
    { message: "La hora final debe ser posterior", path: ["requestedEnd"] },
  );

export const portalPetLookupSchema = z.object({
  organizationId: z.string().uuid("Selecciona una clinica"),
  clientDocument: z.string().trim().min(5, "Ingresa el documento del propietario"),
});

export const portalClientRegistrationSchema = z.object({
  organizationId: z.string().uuid("Selecciona una clinica"),
  name: z.string().trim().min(2, "Tu nombre es obligatorio"),
  document: z
    .string()
    .trim()
    .min(5, "Ingresa tu documento")
    .max(40, "Documento demasiado largo")
    .regex(/^[a-zA-Z0-9.-]+$/, "Usa solo letras, numeros, puntos o guiones"),
  phone: z.string().trim().min(5, "El telefono es obligatorio"),
  email: z.union([z.email("Email invalido"), z.literal("")]).optional(),
  address: optionalText,
  city: optionalText,
  petName: z.string().trim().min(2, "El nombre de la mascota es obligatorio"),
  petSpecies: z.string().trim().min(2, "La especie es obligatoria"),
  petBreed: optionalText,
  petSex: z.string().trim().min(1, "El sexo es obligatorio"),
  petBirthDate: optionalText,
});

export const appointmentRequestDecisionSchema = z.object({
  id: z.string().uuid(),
  assignedVeterinarianId: optionalText,
  proposedStart: optionalText,
  proposedEnd: optionalText,
  reviewNote: optionalText,
});

export const prescriptionSchema = z.object({
  consultationId: z.string().uuid(),
  medication: z.string().trim().min(2, "El medicamento es obligatorio"),
  dosage: z.string().trim().min(2, "La dosis es obligatoria"),
  duration: z.string().trim().min(2, "La duracion es obligatoria"),
  instructions: optionalText,
});

export const portalLookupSchema = z.object({
  document: z
    .string()
    .trim()
    .min(5, "Ingresa el documento del propietario")
    .max(40, "Documento demasiado largo")
    .regex(/^[a-zA-Z0-9.-]+$/, "Usa solo letras, numeros, puntos o guiones"),
});

export const vaccinationSchema = z.object({
  petId: z.string().uuid(),
  vaccine: z.string().trim().min(2, "La vacuna es obligatoria"),
  date: z.string().min(1, "La fecha es obligatoria"),
  nextDose: optionalText,
  lot: optionalText,
  manufacturer: optionalText,
  expiresAt: optionalText,
  veterinarianName: optionalText,
  status: clinicalEventStatusSchema.default("closed"),
  notes: optionalText,
});

export const deleteSchema = z.object({
  id: z.string().uuid(),
});

export type ClientInput = z.input<typeof clientSchema>;
export type PetInput = z.input<typeof petSchema>;
export type ConsultationInput = z.input<typeof consultationSchema>;
export type VaccinationInput = z.input<typeof vaccinationSchema>;
export type AppointmentInput = z.input<typeof appointmentSchema>;
export type PrescriptionInput = z.input<typeof prescriptionSchema>;
export type PortalLookupInput = z.input<typeof portalLookupSchema>;
