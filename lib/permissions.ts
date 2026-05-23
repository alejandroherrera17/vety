export type OrganizationRole = "admin" | "veterinarian" | "receptionist";

export type Permission =
  | "clinic:update"
  | "users:invite"
  | "users:manage"
  | "clients:read"
  | "clients:manage"
  | "pets:read"
  | "pets:manage"
  | "records:read"
  | "records:write"
  | "appointments:read"
  | "appointments:manage"
  | "appointments:update_assigned"
  | "appointment_requests:approve"
  | "schedules:read"
  | "schedules:manage"
  | "metrics:read"
  | "waiting_room:manage";

const rolePermissions: Record<OrganizationRole, Permission[]> = {
  admin: [
    "clinic:update",
    "users:invite",
    "users:manage",
    "clients:read",
    "clients:manage",
    "pets:read",
    "pets:manage",
    "records:read",
    "records:write",
    "appointments:read",
    "appointments:manage",
    "appointment_requests:approve",
    "schedules:read",
    "schedules:manage",
    "metrics:read",
    "waiting_room:manage",
  ],
  veterinarian: [
    "clients:read",
    "pets:read",
    "records:read",
    "records:write",
    "appointments:read",
    "appointments:update_assigned",
    "schedules:read",
  ],
  receptionist: [
    "clients:read",
    "clients:manage",
    "pets:read",
    "pets:manage",
    "appointments:read",
    "appointments:manage",
    "appointment_requests:approve",
    "schedules:read",
    "waiting_room:manage",
  ],
};

export function can(role: OrganizationRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function assertCan(role: OrganizationRole, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error("No tienes permisos para realizar esta accion");
  }
}
