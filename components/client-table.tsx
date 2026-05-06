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
        <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-black/50" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar clientes..."
          className="pl-10 border-black/15 focus:border-black focus:ring-black/20"
        />
      </div>
      {clients.length === 0 ? (
        <EmptyState
          title="Aún no hay clientes"
          description="Crea tu primer perfil de propietario antes de agregar mascotas y consultas."
          action={<ClientFormModal />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/15 bg-white shadow-md">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase tracking-wide text-black/70">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Mascotas</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-black/5">
                  <td className="px-4 py-3 font-semibold text-black">{client.name}</td>
                  <td className="px-4 py-3 text-black/70">{client.phone}</td>
                  <td className="px-4 py-3 text-black/70">{client.pets.length}</td>
                  <td className="px-4 py-3 text-black/70">{client.email ?? "Sin email"}</td>
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
                          <Button type="button" variant="secondary" size="sm" className="hover:bg-black hover:text-white">
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
      )}
    </div>
  );
}
