import { z } from "zod";

export const propiedadSchema = z.object({
  id: z.string().uuid().optional(), // optional for creates
  empresa_id: z.string().uuid("Debe seleccionar una empresa dueña"),
  nombre_interno: z.string().min(1, "El nombre interno es requerido"),
  tipo_inmueble: z.string().optional().nullable(),
  estatus: z.string().optional().nullable(),
  direccion_completa: z.string().optional().nullable(),
  cuenta_predial: z.string().optional().nullable(),
  clave_catastral: z.string().optional().nullable(),
  notas_operativas: z.string().optional().nullable(),
  metros_cuadrados: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable().optional()),
  precio_renta_base: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable().optional()),
  cuota_mantenimiento_base: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable().optional()),
});

export type PropiedadFormValues = z.infer<typeof propiedadSchema>;
