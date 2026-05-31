"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, ChevronRight, MapPin, Search, Stethoscope } from "lucide-react";

type Clinic = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  specialties: string[];
  logoUrl: string | null;
  veterinarians: { veterinarianId: string | null; name: string }[];
};

export function ClinicDirectoryClient({ clinics }: { clinics: Clinic[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const cities = useMemo(() => {
    const allCities = clinics.map((clinic) => clinic.city).filter(Boolean) as string[];
    return Array.from(new Set(allCities)).sort((a, b) => a.localeCompare(b));
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      const matchesCity = selectedCity === "all" || clinic.city === selectedCity;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        clinic.name.toLowerCase().includes(search) || clinic.specialties.some((specialty) => specialty.toLowerCase().includes(search));
      return matchesCity && matchesSearch;
    });
  }, [clinics, searchTerm, selectedCity]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#27ADF5]"
          />
        </div>
        <div>
          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ADF5]"
          >
            <option value="all">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredClinics.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-[#27ADF5]" />
          <h3 className="text-lg font-medium text-foreground">No se encontraron clinicas</h3>
          <p className="mt-2 text-muted-foreground">Prueba ajustando tus filtros de busqueda.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Link key={clinic.id} href={`/portal/clinics/${clinic.id}`} className="group block">
              <div className="flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#27ADF5]/40 hover:shadow-md">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sky-200 bg-sky-50">
                    {clinic.logoUrl ? (
                      <img src={clinic.logoUrl} alt={clinic.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-[#27ADF5]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-bold text-foreground transition-colors group-hover:text-[#27ADF5]">
                      {clinic.name}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      <span className="line-clamp-1">{clinic.city || "Ciudad no especificada"}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {(clinic.specialties.length > 0 ? clinic.specialties.slice(0, 3) : ["Medicina General"]).map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
                      >
                        {specialty}
                      </span>
                    ))}
                    {clinic.specialties.length > 3 ? (
                      <span className="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                        +{clinic.specialties.length - 3} mas
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Stethoscope className="mr-1.5 h-4 w-4 text-[#27ADF5]" />
                    {clinic.veterinarians.length} profesionales
                  </div>
                  <div className="flex translate-x-[-10px] items-center text-sm font-medium text-[#27ADF5] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                    Ver detalles <ChevronRight className="ml-0.5 h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
