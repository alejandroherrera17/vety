"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building2, MapPin, Search, Star, Stethoscope, ChevronRight } from "lucide-react";
import { Input, Select, Field } from "@/components/ui/input";

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
    const allCities = clinics.map(c => c.city).filter(Boolean) as string[];
    return Array.from(new Set(allCities)).sort((a, b) => a.localeCompare(b));
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
      const matchesCity = selectedCity === "all" || clinic.city === selectedCity;
      const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            clinic.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCity && matchesSearch;
    });
  }, [clinics, selectedCity, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
          />
        </div>
        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredClinics.length === 0 ? (
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl p-12 text-center shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No se encontraron clínicas</h3>
          <p className="mt-2 text-slate-500">Prueba ajustando tus filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <Link key={clinic.id} href={`/portal/clinics/${clinic.id}`} className="group block">
              <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {clinic.logoUrl ? (
                      <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{clinic.name}</h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span className="line-clamp-1">{clinic.city || "Ciudad no especificada"}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {(clinic.specialties.length > 0 ? clinic.specialties.slice(0, 3) : ["Medicina General"]).map((spec, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {spec}
                      </span>
                    ))}
                    {clinic.specialties.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        +{clinic.specialties.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm text-slate-500">
                    <Stethoscope className="h-4 w-4 mr-1.5 text-emerald-500" />
                    {clinic.veterinarians.length} profesionales
                  </div>
                  <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                    Ver detalles <ChevronRight className="h-4 w-4 ml-0.5" />
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
