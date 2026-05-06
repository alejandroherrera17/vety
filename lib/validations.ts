import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.email("Ingresa un email válido").trim().toLowerCase(),
  phone: optionalText,
  password: z.string().min(8, "Usa al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Ingresa un email válido").trim().toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const clientSchema = z.object({
  id: optionalText,
  name: z.string().trim().min(2, "El nombre del cliente es obligatorio"),
  document: optionalText,
  phone: z.string().trim().min(5, "El teléfono es obligatorio"),
  email: z.union([z.email("Email inválido"), z.literal("")]).optional(),
  address: optionalText,
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
  clientId: z.string().uuid("Selecciona un cliente"),
});

export const consultationSchema = z.object({
  petId: z.string().uuid(),
  date: z.string().min(1, "La fecha es obligatoria"),
  symptoms: z.string().trim().min(3, "Los síntomas son obligatorios"),
  diagnosis: z.string().trim().min(3, "El diagnóstico es obligatorio"),
  treatment: z.string().trim().min(3, "El tratamiento es obligatorio"),
  observations: optionalText,
});

export const vaccinationSchema = z.object({
  petId: z.string().uuid(),
  vaccine: z.string().trim().min(2, "Vaccine is required"),
  date: z.string().min(1, "Date is required"),
  nextDose: optionalText,
});

export const deleteSchema = z.object({
  id: z.string().uuid(),
});

export type ClientInput = z.input<typeof clientSchema>;
export type PetInput = z.input<typeof petSchema>;
export type ConsultationInput = z.input<typeof consultationSchema>;
export type VaccinationInput = z.input<typeof vaccinationSchema>;
