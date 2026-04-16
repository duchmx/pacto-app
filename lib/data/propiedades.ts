import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { Database } from "@/lib/supabase/types";

type Propiedad = Database["public"]["Tables"]["propiedades"]["Row"];

export const getPropiedades = cache(async (): Promise<Propiedad[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching propiedades:", error);
    return [];
  }

  return data;
});

export const getPropiedadById = cache(async (id: string): Promise<Propiedad | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // 116 = zero rows
      console.error(`Error fetching propiedad ${id}:`, error);
    }
    return null;
  }

  return data;
});
