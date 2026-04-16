"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { propiedadSchema, PropiedadFormValues } from "@/lib/schemas/propiedades";

export async function createPropiedad(data: PropiedadFormValues) {
  const supabase = await createClient();
  
  const parsed = propiedadSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos inválidos", details: parsed.error.flatten() };
  }

  const { error } = await supabase.from("propiedades").insert(parsed.data);

  if (error) {
    console.error("Error creating propiedad:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  return { success: true };
}

export async function updatePropiedad(id: string, data: PropiedadFormValues) {
  const supabase = await createClient();
  
  const parsed = propiedadSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos inválidos", details: parsed.error.flatten() };
  }

  const { error } = await supabase.from("propiedades").update(parsed.data).eq("id", id);

  if (error) {
    console.error("Error updating propiedad:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  return { success: true };
}

export async function deletePropiedad(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("propiedades").delete().eq("id", id);

  if (error) {
    console.error("Error deleting propiedad:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  return { success: true };
}
