# VetyCare Multi-Clinic Migration Plan

## Current State

The current app is single-tenant by veterinarian:

- `Veterinarian` is the authenticated user and implicit tenant.
- `Client` belongs to `Veterinarian` through `veterinarianId`.
- `Pet` belongs to `Client`.
- `Appointment` and `MedicalRecord` belong directly to `Veterinarian`.
- Auth is NextAuth credentials against `Veterinarian.email/password`.
- Access checks are implemented in server actions with `requireVeterinarian()`.

Do not remove this path immediately. Use it as a compatibility layer while adding organizations.

## Target Model

The tenant becomes `Organization` (clinic). Users belong to organizations through `OrganizationUser`.

Core hierarchy:

```txt
Organization
  OrganizationUser(admin | veterinarian | receptionist)
  Client
    Pet
      MedicalRecord
      Vaccination
      Attachment
      Appointment
  AppointmentRequest
  Schedule
  Notification
```

## Migration Strategy

### Phase 1: Additive Data Model

Add these columns/tables without removing existing columns:

- `Organization`
- `OrganizationUser`
- `Client.organizationId`
- `Pet.organizationId`
- `MedicalRecord.organizationId`
- `Appointment.organizationId`
- `Appointment.assignedVeterinarianId`
- `AppointmentRequest`
- `Schedule`
- `Notification`

Backfill one organization per existing veterinarian:

```txt
Veterinarian -> Organization
Veterinarian -> OrganizationUser(role=admin)
Client.veterinarianId -> Client.organizationId
Pet.clientId -> Pet.organizationId
MedicalRecord.veterinarianId -> MedicalRecord.organizationId
Appointment.veterinarianId -> Appointment.organizationId + assignedVeterinarianId
```

### Phase 2: Session Refactor

Replace `requireVeterinarian()` as the primary app helper with:

```ts
requireWorkspace()
```

It should return:

```ts
{
  userId: string;
  organizationId: string;
  role: "admin" | "veterinarian" | "receptionist";
  veterinarianId?: string;
}
```

Keep `requireVeterinarian()` temporarily as an alias for veterinarian-owned legacy screens.

### Phase 3: Query Refactor

Every query must include `organizationId`.

Before:

```ts
where: { veterinarianId: veterinarian.id }
```

After:

```ts
where: { organizationId: workspace.organizationId }
```

For veterinarian dashboards:

```ts
where: {
  organizationId: workspace.organizationId,
  assignedVeterinarianId: workspace.veterinarianId,
}
```

### Phase 4: Role Permissions

Recommended capability matrix:

```txt
admin:
  clinic:update
  users:invite
  users:manage
  clients:manage
  pets:manage
  records:read
  records:write
  appointments:manage
  appointment_requests:approve
  schedules:manage
  metrics:read

veterinarian:
  clients:read
  pets:read
  records:read
  records:write
  appointments:read_assigned
  appointments:update_assigned
  schedules:read_own

receptionist:
  clients:manage
  pets:manage
  appointments:manage
  appointment_requests:approve
  schedules:read
  waiting_room:manage
```

### Phase 5: Client Portal

Use a separate route group:

```txt
app/(clinic)/dashboard
app/(clinic)/clients
app/(clinic)/pets
app/(clinic)/appointments
app/(clinic)/settings

app/(portal)/portal
app/(portal)/portal/pets
app/(portal)/portal/clinics
app/(portal)/portal/appointments
```

Client portal identity can be introduced in two ways:

1. Short term: document lookup plus OTP/email magic link.
2. Production: `ClientUser` table or Supabase Auth user linked to `Client`.

## Appointment Flow

Client request:

```txt
client selects clinic
client selects pet
client selects service
client selects date/time
optional veterinarian
submits reason
```

Creates `AppointmentRequest(status=pending)`.

Clinic admin/receptionist can:

- approve
- reject
- reschedule
- assign veterinarian

On approval:

```txt
AppointmentRequest.status = approved
Appointment is created
Notification is created for client and veterinarian
```

Appointment statuses:

```txt
pending
confirmed
in_progress
completed
cancelled
no_show
```

Appointment request statuses:

```txt
pending
approved
rejected
rescheduled
cancelled
```

## Agenda Improvements

Keep FullCalendar. Extend current component instead of replacing it:

- enable `editable`
- implement `eventDrop`
- implement `eventResize`
- add filters by status, veterinarian, service
- add search by client/pet
- add status color map
- validate conflicts server-side
- block unavailable times via `Schedule`
- show pending requests next to calendar

Conflict rule:

```ts
appointment.startDate < requestedEnd && appointment.endDate > requestedStart
```

Apply by `organizationId` and optionally `assignedVeterinarianId`.

## Server Actions Needed

Recommended modules:

```txt
actions/organizations.ts
  updateOrganizationProfile
  updateOrganizationSettings

actions/team.ts
  inviteOrganizationUser
  acceptInvitation
  updateOrganizationUserRole
  deactivateOrganizationUser

actions/appointment-requests.ts
  createAppointmentRequest
  approveAppointmentRequest
  rejectAppointmentRequest
  rescheduleAppointmentRequest

actions/schedules.ts
  createScheduleBlock
  updateScheduleBlock
  deleteScheduleBlock

actions/notifications.ts
  markNotificationRead
```

## Middleware

`proxy.ts` should protect route groups by role:

```txt
/dashboard              admin | veterinarian | receptionist
/clients                admin | receptionist
/pets                   admin | veterinarian | receptionist
/appointments           admin | veterinarian | receptionist
/settings               admin
/team                   admin
/portal                 client
```

Do not rely only on middleware. Re-check permissions in server actions and route handlers.

## RLS Strategy

Because the current app uses NextAuth, Supabase RLS cannot automatically know the logged-in user unless you either:

1. migrate auth to Supabase Auth, or
2. set tenant context inside each DB transaction.

Recommended progressive path:

- Keep NextAuth for now.
- Use app-level permission checks immediately.
- Add Supabase/Postgres RLS with `current_setting('app.organization_id', true)`.
- Wrap sensitive mutations/queries in transactions that set:

```sql
select set_config('app.organization_id', $1, true);
select set_config('app.user_id', $2, true);
select set_config('app.role', $3, true);
```

This gives defense-in-depth without rewriting auth on day one.

## Frontend Structure

Suggested modular structure:

```txt
components/appointments/
  appointment-calendar.tsx
  appointment-request-panel.tsx
  appointment-filters.tsx

components/clients/
  client-form-modal.tsx
  client-table.tsx

components/pets/
  pet-form-modal.tsx
  pet-profile-header.tsx

components/team/
  invite-user-modal.tsx
  team-table.tsx

components/portal/
  portal-pet-card.tsx
  clinic-directory-card.tsx
  appointment-request-form.tsx

lib/auth/
  permissions.ts
  workspace.ts
  rls.ts
```

## Production Security

- Always filter by `organizationId`.
- Never trust IDs from forms without tenant lookup.
- Server actions must call `requireWorkspace()`.
- Mutations must verify role capability.
- Appointment approval must verify request belongs to organization.
- File uploads should store `organizationId`, `petId`, owner, category.
- Add indexes for every `organizationId` foreign key.
- Add audit fields later: `createdById`, `updatedById`.
- Use RLS as defense-in-depth, not as the only boundary until auth is migrated.

## Rollout Roadmap

1. Add tables/columns and backfill existing data.
2. Generate Prisma client and update schema types.
3. Introduce `requireWorkspace()` while keeping `requireVeterinarian()`.
4. Refactor dashboard/clients/pets to organization scope.
5. Refactor appointments to organization + assigned veterinarian.
6. Add roles and admin team management.
7. Add appointment requests.
8. Add portal routes and client identity.
9. Add schedule blocks and conflict validation.
10. Enable RLS policies in staging.
11. Enable RLS in production after all queries are tenant-safe.

