"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { propiedadSchema, PropiedadFormValues } from "@/lib/schemas/propiedades";
import { createPropiedad, updatePropiedad } from "@/lib/actions/propiedades";
import { useState } from "react";

// For the MVP, we are not connecting standard Shadcn form controls just yet
// This serves as the structural foundation showing the Zod / Server Action loop
export function PropiedadForm({ 
  initialData 
}: { 
  initialData?: PropiedadFormValues & { id: string } 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PropiedadFormValues>({
    resolver: zodResolver(propiedadSchema),
    defaultValues: initialData || {
      empresa_id: "",
      nombre_interno: "",
    },
  });

  async function onSubmit(data: PropiedadFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (initialData?.id) {
        const result = await updatePropiedad(initialData.id, data);
        if (result.error) setError(result.error);
      } else {
        const result = await createPropiedad(data);
        if (result.error) setError(result.error);
      }
    } catch (e) {
      setError("Error inesperado al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium">Nombre Interno</label>
        <input 
          {...form.register("nombre_interno")} 
          className="border p-2 rounded w-full"
        />
        {form.formState.errors.nombre_interno && (
          <p className="text-red-500 text-sm">{form.formState.errors.nombre_interno.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Empresa ID (UUID)</label>
        <input 
          {...form.register("empresa_id")} 
          className="border p-2 rounded w-full"
        />
        {form.formState.errors.empresa_id && (
          <p className="text-red-500 text-sm">{form.formState.errors.empresa_id.message}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isSubmitting ? "Guardando..." : "Guardar Propiedad"}
      </button>
    </form>
  );
}
