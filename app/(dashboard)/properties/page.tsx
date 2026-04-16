"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type PropertyRow = Database["public"]["Tables"]["propiedades"]["Row"];

type EditablePropertyFields = Pick<
  PropertyRow,
  | "id"
  | "nombre_interno"
  | "tipo_inmueble"
  | "estatus"
  | "direccion_completa"
  | "cuenta_predial"
  | "clave_catastral"
  | "notas_operativas"
  | "metros_cuadrados"
  | "precio_renta_base"
  | "cuota_mantenimiento_base"
>;

type StatusOption = {
  value: string;
  label: string;
  tone: "green" | "blue" | "yellow";
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "EN_RENTA", label: "En renta", tone: "green" },
  { value: "DISPONIBLE", label: "Disponible", tone: "blue" },
  { value: "POR_VENCER", label: "Por vencer", tone: "yellow" },
];

const DEFAULT_STATUS_VALUE = "DISPONIBLE";

const getStatusMeta = (rawStatus: string | null): StatusOption => {
  const normalized = (rawStatus || DEFAULT_STATUS_VALUE).toUpperCase().trim();
  const match = STATUS_OPTIONS.find((s) => s.value === normalized);
  return (
    match ??
    (STATUS_OPTIONS.find((s) => s.value === DEFAULT_STATUS_VALUE) ??
      STATUS_OPTIONS[0])
  );
};

type PageState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "loaded" }
  | { type: "error"; message: string };

export default function PropertiesPage() {
  const [state, setState] = useState<PageState>({ type: "loading" });
  const [properties, setProperties] = useState<EditablePropertyFields[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Fetch properties once on mount.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState({ type: "loading" });
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("propiedades")
          .select("*")
          .order("nombre_interno", { ascending: true });

        if (error) {
          throw error;
        }

        if (cancelled) return;

        const editable = (data ?? []).map((row) => ({
          id: row.id,
          nombre_interno: row.nombre_interno,
          tipo_inmueble: row.tipo_inmueble,
          estatus: row.estatus,
          direccion_completa: row.direccion_completa,
          cuenta_predial: row.cuenta_predial,
          clave_catastral: row.clave_catastral,
          notas_operativas: row.notas_operativas,
          metros_cuadrados: row.metros_cuadrados,
          precio_renta_base: row.precio_renta_base,
          cuota_mantenimiento_base: row.cuota_mantenimiento_base,
        }));

        setProperties(editable);
        setState({ type: "loaded" });
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setState({
          type: "error",
          message:
            "No pudimos cargar las propiedades. Intenta de nuevo en unos minutos.",
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFieldChange = <K extends keyof EditablePropertyFields>(
    id: string,
    field: K,
    value: EditablePropertyFields[K],
  ) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleSave = async (id: string) => {
    const current = properties.find((p) => p.id === id);
    if (!current) return;

    setSavingId(id);

    // Normalize incoming values before persisting to Supabase (e.g. empty -> null).
    const payload: Partial<EditablePropertyFields> = {
      nombre_interno: current.nombre_interno?.trim() || "Sin nombre",
      tipo_inmueble: current.tipo_inmueble?.trim() || null,
      estatus: getStatusMeta(current.estatus ?? null).value,
      direccion_completa: current.direccion_completa?.trim() || null,
      cuenta_predial: current.cuenta_predial?.trim() || null,
      clave_catastral: current.clave_catastral?.trim() || null,
      notas_operativas: current.notas_operativas?.trim() || null,
      metros_cuadrados:
        typeof current.metros_cuadrados === "number" &&
        Number.isFinite(current.metros_cuadrados)
          ? current.metros_cuadrados
          : null,
      precio_renta_base:
        typeof current.precio_renta_base === "number" &&
        Number.isFinite(current.precio_renta_base)
          ? current.precio_renta_base
          : null,
      cuota_mantenimiento_base:
        typeof current.cuota_mantenimiento_base === "number" &&
        Number.isFinite(current.cuota_mantenimiento_base)
          ? current.cuota_mantenimiento_base
          : null,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("propiedades")
        .update(payload)
        .eq("id", id);

      if (error) {
        throw error;
      }

      setLastSavedAt(
        new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (err) {
      console.error(err);
      alert("No pudimos guardar los cambios. Intenta de nuevo.");
    } finally {
      setSavingId((prev) => (prev === id ? null : prev));
    }
  };

  const hasProperties = properties.length > 0;

  const headerSubtitle = useMemo(() => {
    if (state.type === "loading") {
      return "Cargando propiedades…";
    }
    if (!hasProperties) {
      return "No hay propiedades registradas aún.";
    }
    return "Toca cualquier propiedad para ver y actualizar sus detalles.";
  }, [state.type, hasProperties]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Propiedades
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{headerSubtitle}</p>
        {lastSavedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Último guardado: {lastSavedAt}
          </p>
        )}
      </div>

      {state.type === "error" && (
        <Card className="border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {state.message}
        </Card>
      )}

      {state.type === "loading" && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {state.type === "loaded" && hasProperties && (
        <div className="space-y-3">
          {properties.map((property) => {
            const isExpanded = expandedId === property.id;
            const statusMeta = getStatusMeta(property.estatus ?? null);

            return (
              <Card
                key={property.id}
                className="cursor-pointer border-border/70 bg-card/80 shadow-sm transition hover:border-primary/60"
                onClick={() =>
                  setExpandedId((prev) =>
                    prev === property.id ? null : property.id,
                  )
                }
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  <button
                    type="button"
                    aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedId((prev) =>
                        prev === property.id ? null : property.id,
                      );
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {property.nombre_interno || "Sin nombre"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {property.direccion_completa || "Sin dirección capturada"}
                    </p>
                  </div>

                  <span
                    className={[
                      "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                      statusMeta.tone === "green" &&
                        "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
                      statusMeta.tone === "blue" &&
                        "border-blue-600/40 bg-blue-600/10 text-blue-700",
                      statusMeta.tone === "yellow" &&
                        "border-amber-500/40 bg-amber-400/15 text-amber-700",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                {isExpanded && (
                  <div
                    className="space-y-4 border-t border-border/60 px-3 pb-3 pt-2 text-sm"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Nombre interno
                        </label>
                        <Input
                          value={property.nombre_interno || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "nombre_interno",
                              event.target.value,
                            )
                          }
                          autoComplete="off"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Estatus
                        </label>
                        <select
                          value={getStatusMeta(property.estatus ?? null).value}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "estatus",
                              event.target.value,
                            )
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Tipo de inmueble
                        </label>
                        <Input
                          value={property.tipo_inmueble || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "tipo_inmueble",
                              event.target.value,
                            )
                          }
                          autoComplete="off"
                          placeholder="Local, oficina, bodega…"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Metros cuadrados
                        </label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={
                            property.metros_cuadrados === null ||
                            property.metros_cuadrados === undefined
                              ? ""
                              : String(property.metros_cuadrados)
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "metros_cuadrados",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Renta base mensual (MXN)
                        </label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={
                            property.precio_renta_base === null ||
                            property.precio_renta_base === undefined
                              ? ""
                              : String(property.precio_renta_base)
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "precio_renta_base",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Cuota de mantenimiento (MXN)
                        </label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={
                            property.cuota_mantenimiento_base === null ||
                            property.cuota_mantenimiento_base === undefined
                              ? ""
                              : String(property.cuota_mantenimiento_base)
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "cuota_mantenimiento_base",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Dirección completa
                        </label>
                        <textarea
                          value={property.direccion_completa || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "direccion_completa",
                              event.target.value,
                            )
                          }
                          rows={2}
                          className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Cuenta predial
                        </label>
                        <Input
                          value={property.cuenta_predial || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "cuenta_predial",
                              event.target.value,
                            )
                          }
                          autoComplete="off"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Clave catastral
                        </label>
                        <Input
                          value={property.clave_catastral || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "clave_catastral",
                              event.target.value,
                            )
                          }
                          autoComplete="off"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Notas operativas
                        </label>
                        <textarea
                          value={property.notas_operativas || ""}
                          onChange={(event) =>
                            handleFieldChange(
                              property.id,
                              "notas_operativas",
                              event.target.value,
                            )
                          }
                          rows={3}
                          className="min-h-[72px] w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => setExpandedId(null)}
                      >
                        Cerrar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 px-4 text-xs"
                        disabled={savingId === property.id}
                        onClick={() => void handleSave(property.id)}
                      >
                        {savingId === property.id ? "Guardando…" : "Guardar"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {state.type === "loaded" && !hasProperties && (
        <Card className="p-4 text-sm text-muted-foreground">
          No encontramos propiedades. Por ahora, puedes darlas de alta
          directamente en Supabase y aparecerán aquí automáticamente.
        </Card>
      )}
    </div>
  );
}
