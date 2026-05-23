-- Multi-tenant foundation for VetyCare.
-- This migration is intentionally additive: it preserves the existing
-- veterinarian-owned model while introducing organization-owned tenancy.

create extension if not exists pgcrypto;

create type "OrganizationRole" as enum ('admin', 'veterinarian', 'receptionist');
create type "OrganizationUserStatus" as enum ('invited', 'active', 'disabled');
create type "AppointmentRequestStatus" as enum ('pending', 'approved', 'rejected', 'rescheduled', 'cancelled');
create type "ScheduleBlockType" as enum ('availability', 'blocked', 'time_off');
create type "NotificationType" as enum ('appointment_request', 'appointment_approved', 'appointment_rejected', 'appointment_updated', 'system');

alter type "AppointmentStatus" add value if not exists 'in_progress';
alter type "AppointmentStatus" add value if not exists 'no_show';

create table "Organization" (
  "id" text primary key default gen_random_uuid()::text,
  "name" text not null,
  "slug" text unique,
  "logoUrl" text,
  "address" text,
  "city" text,
  "phone" text,
  "openingHours" jsonb,
  "specialties" text[] default '{}',
  "settings" jsonb default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "OrganizationUser" (
  "id" text primary key default gen_random_uuid()::text,
  "organizationId" text not null references "Organization"("id") on delete cascade,
  "veterinarianId" text references "Veterinarian"("id") on delete set null,
  "name" text not null,
  "email" text not null,
  "phone" text,
  "role" "OrganizationRole" not null,
  "status" "OrganizationUserStatus" not null default 'active',
  "invitedAt" timestamptz,
  "acceptedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("organizationId", "email")
);

alter table "Veterinarian" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "Client" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "Pet" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "MedicalRecord" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "Appointment" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "Appointment" add column if not exists "assignedVeterinarianId" text references "Veterinarian"("id") on delete set null;
alter table "Vaccination" add column if not exists "organizationId" text references "Organization"("id") on delete set null;
alter table "Attachment" add column if not exists "organizationId" text references "Organization"("id") on delete set null;

create temp table "_vety_org_backfill" (
  "veterinarianId" text primary key,
  "organizationId" text not null
) on commit drop;

insert into "_vety_org_backfill" ("veterinarianId", "organizationId")
select v."id", gen_random_uuid()::text
from "Veterinarian" v
where v."organizationId" is null;

insert into "Organization" ("id", "name", "phone", "createdAt", "updatedAt")
select b."organizationId", v."name", v."phone", now(), now()
from "_vety_org_backfill" b
join "Veterinarian" v on v."id" = b."veterinarianId";

update "Veterinarian" v
set "organizationId" = b."organizationId"
from "_vety_org_backfill" b
where v."organizationId" is null
  and v."id" = b."veterinarianId";

insert into "OrganizationUser" (
  "organizationId",
  "veterinarianId",
  "name",
  "email",
  "phone",
  "role",
  "status",
  "acceptedAt"
)
select
  v."organizationId",
  v."id",
  v."name",
  v."email",
  v."phone",
  'admin',
  'active',
  now()
from "Veterinarian" v
where v."organizationId" is not null
on conflict ("organizationId", "email") do nothing;

update "Client" c
set "organizationId" = v."organizationId"
from "Veterinarian" v
where c."veterinarianId" = v."id"
  and c."organizationId" is null;

update "Pet" p
set "organizationId" = c."organizationId"
from "Client" c
where p."clientId" = c."id"
  and p."organizationId" is null;

update "MedicalRecord" m
set "organizationId" = v."organizationId"
from "Veterinarian" v
where m."veterinarianId" = v."id"
  and m."organizationId" is null;

update "Appointment" a
set
  "organizationId" = v."organizationId",
  "assignedVeterinarianId" = a."veterinarianId"
from "Veterinarian" v
where a."veterinarianId" = v."id"
  and a."organizationId" is null;

update "Vaccination" vac
set "organizationId" = p."organizationId"
from "Pet" p
where vac."petId" = p."id"
  and vac."organizationId" is null;

update "Attachment" att
set "organizationId" = p."organizationId"
from "Pet" p
where att."petId" = p."id"
  and att."organizationId" is null;

alter table "Client" alter column "organizationId" set not null;
alter table "Pet" alter column "organizationId" set not null;
alter table "MedicalRecord" alter column "organizationId" set not null;
alter table "Appointment" alter column "organizationId" set not null;

create table "AppointmentRequest" (
  "id" text primary key default gen_random_uuid()::text,
  "organizationId" text not null references "Organization"("id") on delete cascade,
  "clientId" text not null references "Client"("id") on delete cascade,
  "petId" text not null references "Pet"("id") on delete cascade,
  "requestedVeterinarianId" text references "Veterinarian"("id") on delete set null,
  "assignedVeterinarianId" text references "Veterinarian"("id") on delete set null,
  "appointmentId" text references "Appointment"("id") on delete set null,
  "service" text not null,
  "reason" text,
  "requestedStart" timestamptz not null,
  "requestedEnd" timestamptz,
  "proposedStart" timestamptz,
  "proposedEnd" timestamptz,
  "status" "AppointmentRequestStatus" not null default 'pending',
  "reviewNote" text,
  "reviewedById" text references "OrganizationUser"("id") on delete set null,
  "reviewedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "Schedule" (
  "id" text primary key default gen_random_uuid()::text,
  "organizationId" text not null references "Organization"("id") on delete cascade,
  "veterinarianId" text references "Veterinarian"("id") on delete cascade,
  "type" "ScheduleBlockType" not null,
  "weekday" integer,
  "startTime" time,
  "endTime" time,
  "startDate" timestamptz,
  "endDate" timestamptz,
  "reason" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check (
    ("weekday" is not null and "startTime" is not null and "endTime" is not null)
    or
    ("startDate" is not null and "endDate" is not null)
  )
);

create table "Notification" (
  "id" text primary key default gen_random_uuid()::text,
  "organizationId" text references "Organization"("id") on delete cascade,
  "organizationUserId" text references "OrganizationUser"("id") on delete cascade,
  "clientId" text references "Client"("id") on delete cascade,
  "type" "NotificationType" not null,
  "title" text not null,
  "body" text,
  "data" jsonb default '{}'::jsonb,
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create index "OrganizationUser_org_role_idx" on "OrganizationUser" ("organizationId", "role");
create index "OrganizationUser_email_idx" on "OrganizationUser" ("email");
create index "Client_org_idx" on "Client" ("organizationId");
create index "Pet_org_client_idx" on "Pet" ("organizationId", "clientId");
create index "MedicalRecord_org_pet_idx" on "MedicalRecord" ("organizationId", "petId");
create index "Appointment_org_start_idx" on "Appointment" ("organizationId", "startDate");
create index "Appointment_org_vet_start_idx" on "Appointment" ("organizationId", "assignedVeterinarianId", "startDate");
create index "AppointmentRequest_org_status_idx" on "AppointmentRequest" ("organizationId", "status", "requestedStart");
create index "Schedule_org_vet_idx" on "Schedule" ("organizationId", "veterinarianId");
create index "Notification_user_read_idx" on "Notification" ("organizationUserId", "readAt", "createdAt");
create index "Notification_client_read_idx" on "Notification" ("clientId", "readAt", "createdAt");

-- RLS helpers for NextAuth/Prisma deployments. Set these values inside each
-- transaction before querying protected tables.
create or replace function app_current_organization_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.organization_id', true), '')
$$;

create or replace function app_current_role()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.role', true), '')
$$;

alter table "Client" enable row level security;
alter table "Pet" enable row level security;
alter table "MedicalRecord" enable row level security;
alter table "Appointment" enable row level security;
alter table "AppointmentRequest" enable row level security;
alter table "Schedule" enable row level security;
alter table "Notification" enable row level security;

create policy "tenant_select_clients" on "Client"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_clients" on "Client"
for all using ("organizationId" = app_current_organization_id())
with check ("organizationId" = app_current_organization_id());

create policy "tenant_select_pets" on "Pet"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_pets" on "Pet"
for all using ("organizationId" = app_current_organization_id())
with check ("organizationId" = app_current_organization_id());

create policy "tenant_select_medical_records" on "MedicalRecord"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_medical_records" on "MedicalRecord"
for all using (
  "organizationId" = app_current_organization_id()
  and app_current_role() in ('admin', 'veterinarian')
)
with check (
  "organizationId" = app_current_organization_id()
  and app_current_role() in ('admin', 'veterinarian')
);

create policy "tenant_select_appointments" on "Appointment"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_appointments" on "Appointment"
for all using (
  "organizationId" = app_current_organization_id()
  and app_current_role() in ('admin', 'veterinarian', 'receptionist')
)
with check (
  "organizationId" = app_current_organization_id()
  and app_current_role() in ('admin', 'veterinarian', 'receptionist')
);

create policy "tenant_select_appointment_requests" on "AppointmentRequest"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_appointment_requests" on "AppointmentRequest"
for all using ("organizationId" = app_current_organization_id())
with check ("organizationId" = app_current_organization_id());

create policy "tenant_select_schedules" on "Schedule"
for select using ("organizationId" = app_current_organization_id());

create policy "tenant_write_schedules" on "Schedule"
for all using (
  "organizationId" = app_current_organization_id()
  and app_current_role() = 'admin'
)
with check (
  "organizationId" = app_current_organization_id()
  and app_current_role() = 'admin'
);
