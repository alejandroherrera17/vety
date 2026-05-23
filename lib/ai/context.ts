import "server-only";

import { prisma } from "@/lib/prisma";
import type { WorkspaceSession } from "@/lib/session";

type AiContextOptions = {
  question: string;
  workspace: WorkspaceSession;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function compactText(value: string | null | undefined, maxLength = 360) {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

export async function buildClinicContext({ question, workspace }: AiContextOptions) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(addDays(now, -7));

  const [
    organization,
    metrics,
    clients,
    pets,
    appointments,
    appointmentRequests,
    veterinarians,
    vaccinations,
    medicalRecords,
    attachments,
    notifications,
    schedules,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: workspace.organizationId },
      select: {
        name: true,
        address: true,
        city: true,
        phone: true,
        specialties: true,
        openingHours: true,
      },
    }),
    Promise.all([
      prisma.client.count({ where: { organizationId: workspace.organizationId } }),
      prisma.pet.count({ where: { organizationId: workspace.organizationId } }),
      prisma.pet.count({
        where: {
          organizationId: workspace.organizationId,
          medicalRecords: { some: { createdAt: { gte: weekStart } } },
        },
      }),
      prisma.appointment.count({
        where: { organizationId: workspace.organizationId, startDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointmentRequest.count({
        where: { organizationId: workspace.organizationId, status: "pending" },
      }),
    ]),
    prisma.client.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      include: {
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            sex: true,
          },
        },
      },
    }),
    prisma.pet.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        sex: true,
        birthDate: true,
        weight: true,
        allergies: true,
        previousDiseases: true,
        frequentMedications: true,
        generalObservations: true,
        client: { select: { id: true, name: true, phone: true, email: true, document: true } },
      },
    }),
    prisma.appointment.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { startDate: "asc" },
      include: {
        pet: { select: { id: true, name: true, species: true, client: { select: { id: true, name: true } } } },
        veterinarian: { select: { name: true, email: true } },
        assignedVeterinarian: { select: { name: true, email: true } },
      },
    }),
    prisma.appointmentRequest.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { requestedStart: "asc" },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        pet: { select: { id: true, name: true, species: true } },
        requestedVeterinarian: { select: { name: true } },
        assignedVeterinarian: { select: { name: true } },
        reviewedBy: { select: { name: true, role: true } },
      },
    }),
    prisma.organizationUser.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { name: "asc" },
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        veterinarianId: true,
        veterinarian: { select: { name: true, phone: true, email: true, theme: true } },
      },
    }),
    prisma.vaccination.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: [{ nextDose: "asc" }, { date: "desc" }],
      include: { pet: { select: { id: true, name: true, species: true, client: { select: { id: true, name: true } } } } },
    }),
    prisma.medicalRecord.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        pet: { select: { id: true, name: true, species: true, client: { select: { id: true, name: true } } } },
        veterinarian: { select: { id: true, name: true } },
        consultations: {
          orderBy: { date: "desc" },
          include: { prescriptions: true },
        },
      },
    }),
    prisma.attachment.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        pet: { select: { id: true, name: true, species: true, client: { select: { id: true, name: true } } } },
      },
    }),
    prisma.notification.findMany({
      where: { organizationId: workspace.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        organizationUser: { select: { name: true, role: true } },
        client: { select: { name: true, phone: true, email: true } },
      },
    }),
    prisma.schedule.findMany({
      where: { organizationId: workspace.organizationId },
      include: { veterinarian: { select: { name: true } } },
      orderBy: [{ weekday: "asc" }, { startDate: "asc" }],
    }),
  ]);

  const [totalClients, totalPets, petsTouchedThisWeek, todaysAppointments, pendingRequests] = metrics;

  return {
    generatedAt: now.toISOString(),
    user: {
      name: workspace.name,
      role: workspace.role,
      veterinarianId: workspace.veterinarianId,
    },
    clinic: organization,
    metrics: {
      totalClients,
      totalPets,
      petsTouchedThisWeek,
      petsRegisteredThisWeek: "No disponible: el modelo Pet no almacena createdAt actualmente.",
      todaysAppointments,
      pendingRequests,
      totalAppointmentsInContext: appointments.length,
      totalAppointmentRequestsInContext: appointmentRequests.length,
      totalVaccinationsInContext: vaccinations.length,
      totalMedicalRecordsInContext: medicalRecords.length,
      totalAttachmentsInContext: attachments.length,
      totalNotificationsInContext: notifications.length,
    },
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      document: client.document,
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: client.city,
      emergencyContact: client.emergencyContact,
      veterinarianId: client.veterinarianId,
      pets: client.pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
      })),
    })),
    pets: pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      birthDate: pet.birthDate?.toISOString() ?? null,
      weight: pet.weight,
      ownerId: pet.client.id,
      owner: pet.client.name,
      ownerDocument: pet.client.document,
      ownerPhone: pet.client.phone,
      ownerEmail: pet.client.email,
      allergies: compactText(pet.allergies),
      previousDiseases: compactText(pet.previousDiseases),
      frequentMedications: compactText(pet.frequentMedications),
      observations: compactText(pet.generalObservations),
    })),
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      status: appointment.status,
      startDate: appointment.startDate.toISOString(),
      endDate: appointment.endDate.toISOString(),
      notes: compactText(appointment.notes),
      petId: appointment.pet.id,
      pet: appointment.pet.name,
      species: appointment.pet.species,
      ownerId: appointment.pet.client.id,
      owner: appointment.pet.client.name,
      createdByVeterinarian: appointment.veterinarian.name,
      assignedVeterinarian: appointment.assignedVeterinarian?.name ?? null,
    })),
    appointmentRequests: appointmentRequests.map((request) => ({
      id: request.id,
      service: request.service,
      reason: compactText(request.reason),
      status: request.status,
      requestedStart: request.requestedStart.toISOString(),
      requestedEnd: request.requestedEnd?.toISOString() ?? null,
      proposedStart: request.proposedStart?.toISOString() ?? null,
      proposedEnd: request.proposedEnd?.toISOString() ?? null,
      reviewNote: compactText(request.reviewNote),
      reviewedAt: request.reviewedAt?.toISOString() ?? null,
      reviewedBy: request.reviewedBy?.name ?? null,
      clientId: request.client.id,
      client: request.client.name,
      clientPhone: request.client.phone,
      clientEmail: request.client.email,
      petId: request.pet.id,
      pet: request.pet.name,
      species: request.pet.species,
      requestedVeterinarian: request.requestedVeterinarian?.name ?? null,
      assignedVeterinarian: request.assignedVeterinarian?.name ?? null,
    })),
    team: veterinarians.map((member) => ({
      name: member.name,
      role: member.role,
      status: member.status,
      email: member.email,
      phone: member.phone ?? member.veterinarian?.phone ?? null,
      veterinarianId: member.veterinarianId,
      veterinarianProfile: member.veterinarian
        ? {
            name: member.veterinarian.name,
            email: member.veterinarian.email,
            theme: member.veterinarian.theme,
          }
        : null,
    })),
    vaccinations: vaccinations.map((vaccination) => ({
      id: vaccination.id,
      vaccine: vaccination.vaccine,
      date: vaccination.date.toISOString(),
      nextDose: vaccination.nextDose?.toISOString() ?? null,
      lot: vaccination.lot,
      manufacturer: vaccination.manufacturer,
      expiresAt: vaccination.expiresAt?.toISOString() ?? null,
      status: vaccination.status,
      notes: compactText(vaccination.notes),
      veterinarianName: vaccination.veterinarianName,
      petId: vaccination.pet.id,
      pet: vaccination.pet.name,
      species: vaccination.pet.species,
      ownerId: vaccination.pet.client.id,
      owner: vaccination.pet.client.name,
    })),
    medicalRecords: medicalRecords.map((record) => ({
      id: record.id,
      petId: record.pet.id,
      pet: record.pet.name,
      species: record.pet.species,
      ownerId: record.pet.client.id,
      owner: record.pet.client.name,
      veterinarianId: record.veterinarian.id,
      veterinarian: record.veterinarian.name,
      createdAt: record.createdAt.toISOString(),
      consultations: record.consultations.map((consultation) => ({
        id: consultation.id,
        date: consultation.date.toISOString(),
        reason: compactText(consultation.reason),
        anamnesis: compactText(consultation.anamnesis),
        symptoms: compactText(consultation.symptoms),
        commonSymptoms: consultation.commonSymptoms,
        temperature: consultation.temperature,
        heartRate: consultation.heartRate,
        respiratoryRate: consultation.respiratoryRate,
        weight: consultation.weight,
        physicalExam: compactText(consultation.physicalExam),
        presumptiveDiagnosis: compactText(consultation.presumptiveDiagnosis),
        diagnosis: compactText(consultation.diagnosis),
        definitiveDiagnosis: compactText(consultation.definitiveDiagnosis),
        treatment: compactText(consultation.treatment),
        recommendations: compactText(consultation.recommendations),
        evolution: compactText(consultation.evolution),
        observations: compactText(consultation.observations),
        status: consultation.status,
        prescriptions: consultation.prescriptions.map((prescription) => ({
          id: prescription.id,
          medication: prescription.medication,
          dosage: prescription.dosage,
          duration: prescription.duration,
          frequency: prescription.frequency,
          route: prescription.route,
          observations: compactText(prescription.observations),
          instructions: compactText(prescription.instructions),
        })),
      })),
    })),
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      type: attachment.type,
      fileName: attachment.fileName,
      category: attachment.category,
      notes: compactText(attachment.notes),
      createdAt: attachment.createdAt.toISOString(),
      petId: attachment.pet.id,
      pet: attachment.pet.name,
      species: attachment.pet.species,
      ownerId: attachment.pet.client.id,
      owner: attachment.pet.client.name,
    })),
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: compactText(notification.body),
      data: notification.data,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      organizationUser: notification.organizationUser
        ? {
            name: notification.organizationUser.name,
            role: notification.organizationUser.role,
          }
        : null,
      client: notification.client
        ? {
            name: notification.client.name,
            phone: notification.client.phone,
            email: notification.client.email,
          }
        : null,
    })),
    schedules: schedules.map((schedule) => ({
      type: schedule.type,
      weekday: schedule.weekday,
      startTime: schedule.startTime?.toISOString() ?? null,
      endTime: schedule.endTime?.toISOString() ?? null,
      startDate: schedule.startDate?.toISOString() ?? null,
      endDate: schedule.endDate?.toISOString() ?? null,
      reason: schedule.reason,
      veterinarian: schedule.veterinarian?.name ?? "Equipo clinico",
    })),
    userQuestion: question,
  };
}
