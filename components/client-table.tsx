"use client";

import { Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteClient } from "@/actions/clients";
import { ClientFormModal } from "@/components/client-form-modal";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyState } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ClientRow = {
  id: string;
  name: string;
  document: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  pets: { id: string }[];
};

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return clients;
    return clients.filter((client) =>
      [client.name, client.phone, client.email, client.document]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [clients, query]);

  return (
    <div className="grid gap-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar clientes..."
          className="pl-10"
        />
      </div>
      {clients.length === 0 ? (
        <EmptyState
          title="Aún no hay clientes"
          description="Crea tu primer perfil de propietario antes de agregar mascotas y consultas."
          action={<ClientFormModal />}
        />
      ) : (
        <>
        <div className="grid gap-3 md:hidden">
          {filtered.map((client) => (
            <article
              key={client.id}
              className="rounded-lg border border-white/10 bg-card/82 p-4 shadow-xl shadow-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-foreground">{client.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{client.phone}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{client.email ?? "Sin email"}</p>
                </div>
                <span className="shrink-0 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100">
                  {client.pets.length} mascotas
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <ClientFormModal
                  client={{
                    id: client.id,
                    name: client.name,
                    document: client.document ?? "",
                    phone: client.phone,
                    email: client.email ?? "",
                    address: client.address ?? "",
                  }}
                  trigger={
                    <Button type="button" variant="secondary" size="sm" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  }
                />
                <ConfirmButton id={client.id} action={deleteClient} label="Eliminar" className="w-full" />
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/10 backdrop-blur-xl md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/[0.06] text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Mascotas</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((client) => (
                <tr key={client.id} className="transition hover:bg-white/[0.05]">
                  <td className="px-4 py-3 font-semibold text-foreground">{client.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.pets.length}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.email ?? "Sin email"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <ClientFormModal
                        client={{
                          id: client.id,
                          name: client.name,
                          document: client.document ?? "",
                          phone: client.phone,
                          email: client.email ?? "",
                          address: client.address ?? "",
                        }}
                        trigger={
                          <Button type="button" variant="secondary" size="sm">
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                        }
                      />
                      <ConfirmButton id={client.id} action={deleteClient} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
