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
        <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients..."
          className="pl-10"
        />
      </div>
      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Create your first owner profile before adding pets and consultations."
          action={<ClientFormModal />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Pets</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{client.name}</td>
                  <td className="px-4 py-3 text-slate-600">{client.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{client.pets.length}</td>
                  <td className="px-4 py-3 text-slate-600">{client.email ?? "No email"}</td>
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
                            Edit
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
