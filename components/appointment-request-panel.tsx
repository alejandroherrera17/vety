"use client";

import { Check, Clock3, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveAppointmentRequest,
  rejectAppointmentRequest,
} from "@/actions/appointment-requests";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";

type RequestItem = {
  id: string;
  service: string;
  reason?: string | null;
  requestedStart: string;
  requestedEnd?: string | null;
  status: "pending" | "approved" | "rejected" | "rescheduled" | "cancelled";
  clientName: string;
  petName: string;
  requestedVeterinarianName?: string | null;
};

type VeterinarianOption = {
  id: string;
  name: string;
  role: string;
};

export function AppointmentRequestPanel({
  requests,
  veterinarians,
}: {
  requests: RequestItem[];
  veterinarians: VeterinarianOption[];
}) {
  const [activeId, setActiveId] = useState(requests[0]?.id ?? "");
  const [assignedVeterinarianId, setAssignedVeterinarianId] = useState(veterinarians[0]?.id ?? "");
  const [proposedStart, setProposedStart] = useState("");
  const [proposedEnd, setProposedEnd] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [pending, startTransition] = useTransition();
  const activeRequest = requests.find((request) => request.id === activeId);

  function approve() {
    if (!activeRequest) return;
    startTransition(async () => {
      const result = await approveAppointmentRequest({
        id: activeRequest.id,
        assignedVeterinarianId,
        proposedStart,
        proposedEnd,
        reviewNote,
      });

      if (result.ok) {
        toast.success("Solicitud aprobada y cita creada");
      } else {
        toast.error(result.error ?? "No se pudo aprobar");
      }
    });
  }

  function reject() {
    if (!activeRequest) return;
    startTransition(async () => {
      const result = await rejectAppointmentRequest({ id: activeRequest.id, reviewNote });

      if (result.ok) {
        toast.success("Solicitud rechazada");
      } else {
        toast.error(result.error ?? "No se pudo rechazar");
      }
    });
  }

  if (!requests.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary p-5 text-sm text-muted-foreground">
        No hay solicitudes pendientes. Cuando un propietario solicite cita desde el portal, aparecera aqui para aprobarla.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-3">
        {requests.map((request) => (
          <button
            key={request.id}
            type="button"
            onClick={() => setActiveId(request.id)}
            className="rounded-lg border border-border bg-secondary p-4 text-left transition hover:border-sky-200/35 hover:bg-[#edf8ff]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{request.service}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.petName} - {request.clientName}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
                <Clock3 className="h-3.5 w-3.5" />
                {request.status}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {formatDateTime(request.requestedStart)}
            </p>
            {request.reason ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{request.reason}</p>
            ) : null}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card/80 p-4">
        <h3 className="text-base font-bold text-foreground">Decision de la clinica</h3>
        {activeRequest ? (
          <div className="mt-4 grid gap-4">
            <Field label="Asignar veterinario">
              <Select
                value={assignedVeterinarianId}
                onChange={(event) => setAssignedVeterinarianId(event.target.value)}
              >
                {veterinarians.map((veterinarian) => (
                  <option key={veterinarian.id} value={veterinarian.id}>
                    {veterinarian.name} - {veterinarian.role}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Inicio propuesto">
              <Input
                type="datetime-local"
                value={proposedStart}
                onChange={(event) => setProposedStart(event.target.value)}
              />
            </Field>
            <Field label="Fin propuesto">
              <Input
                type="datetime-local"
                value={proposedEnd}
                onChange={(event) => setProposedEnd(event.target.value)}
              />
            </Field>
            <Field label="Nota para el propietario">
              <Textarea
                className="min-h-24"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Mensaje interno o nota visible en notificaciones"
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={approve} disabled={pending}>
                <Check className="h-4 w-4" />
                Aprobar
              </Button>
              <Button type="button" variant="danger" onClick={reject} disabled={pending}>
                <X className="h-4 w-4" />
                Rechazar
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
