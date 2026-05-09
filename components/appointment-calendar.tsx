"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useMemo, useState } from "react";
import { AppointmentModal, type AppointmentFormValue, type AppointmentPetOption } from "@/components/appointment-modal";

type AppointmentCalendarItem = {
  id: string;
  title: string;
  notes?: string | null;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  petId: string;
  petName: string;
  ownerName: string;
};

const statusColors = {
  pending: "#f59e0b",
  confirmed: "#0d3b66",
  cancelled: "#737373",
  completed: "#059669",
};

export function AppointmentCalendar({
  appointments,
  pets,
}: {
  appointments: AppointmentCalendarItem[];
  pets: AppointmentPetOption[];
}) {
  const [selected, setSelected] = useState<AppointmentFormValue | undefined>();
  const [selectedStart, setSelectedStart] = useState<string | undefined>();
  const [modalKey, setModalKey] = useState(0);

  const events = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.title} - ${appointment.petName}`,
        start: appointment.startDate,
        end: appointment.endDate,
        backgroundColor: statusColors[appointment.status],
        borderColor: statusColors[appointment.status],
        extendedProps: appointment,
      })),
    [appointments],
  );

  function openNew(startDate?: Date) {
    setSelected(undefined);
    setSelectedStart(startDate ? toLocalInputValue(startDate) : undefined);
    setModalKey((key) => key + 1);
  }

  function openExisting(appointment: AppointmentCalendarItem) {
    setSelected({
      id: appointment.id,
      petId: appointment.petId,
      title: appointment.title,
      notes: appointment.notes ?? "",
      startDate: toLocalInputValue(appointment.startDate),
      endDate: toLocalInputValue(appointment.endDate),
      status: appointment.status,
    });
    setSelectedStart(undefined);
    setModalKey((key) => key + 1);
  }

  return (
    <div className="appointment-calendar rounded-lg border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          {Object.entries(statusColors).map(([status, color]) => (
            <span key={status} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {status}
            </span>
          ))}
        </div>
        <AppointmentModal pets={pets} />
      </div>
      {modalKey > 0 ? (
        <AppointmentModal
          key={modalKey}
          pets={pets}
          appointment={selected}
          startDate={selectedStart}
          openOnMount
          trigger={<span className="hidden" />}
        />
      ) : null}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek",
        }}
        buttonText={{ today: "Hoy", day: "Dia", week: "Semana" }}
        allDaySlot={false}
        editable={false}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        events={events}
        height="auto"
        locale="es"
        nowIndicator
        selectable
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        select={(info) => openNew(info.start)}
        dateClick={(info) => openNew(info.date)}
        eventClick={(info) => openExisting(info.event.extendedProps as AppointmentCalendarItem)}
      />
    </div>
  );
}

function toLocalInputValue(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
