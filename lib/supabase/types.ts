export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Supabase public schema definition.
 * This is kept in sync manually with the tables created in Supabase
 * so we get strong typing and autocomplete across the app.
 */
export interface Database {
  public: {
    Tables: {
      personas: {
        Row: {
          id: string;
          rfc: string;
          razon_social: string;
          regimen_fiscal: string;
          nombre_clave: string;
        };
        Insert: {
          id?: string;
          rfc: string;
          razon_social: string;
          regimen_fiscal: string;
          nombre_clave: string;
        };
        Update: {
          id?: string;
          rfc?: string;
          razon_social?: string;
          regimen_fiscal?: string;
          nombre_clave?: string;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          rfc: string;
          razon_social: string;
          nombre_comercial: string;
          regimen_fiscal: string | null;
          codigo_postal: string | null;
          representante_legal: string | null;
          correo_facturacion: string | null;
          correo_operativo: string | null;
          telefono: string | null;
          giro_comercial: string | null;
        };
        Insert: {
          id?: string;
          rfc: string;
          razon_social: string;
          nombre_comercial: string;
          regimen_fiscal: string | null;
          codigo_postal: string | null;
          representante_legal: string | null;
          correo_facturacion: string | null;
          correo_operativo: string | null;
          telefono: string | null;
          giro_comercial: string | null;
        };
        Update: {
          id?: string;
          rfc?: string;
          razon_social?: string;
          nombre_comercial?: string;
          regimen_fiscal?: string;
          codigo_postal?: string | null;
          representante_legal?: string | null;
          correo_facturacion?: string | null;
          correo_operativo?: string | null;
          telefono?: string | null;
          giro_comercial?: string | null;
        };
        Relationships: [];
      };
      propiedades: {
        Row: {
          id: string;
          empresa_id: string;
          nombre_interno: string;
          tipo_inmueble: string | null;
          estatus: string | null;
          direccion_completa: string | null;
          cuenta_predial: string | null;
          clave_catastral: string | null;
          notas_operativas: string | null;
          metros_cuadrados: number | null;
          precio_renta_base: number | null;
          cuota_mantenimiento_base: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nombre_interno: string;
          tipo_inmueble?: string | null;
          estatus?: string | null;
          direccion_completa?: string | null;
          cuenta_predial?: string | null;
          clave_catastral?: string | null;
          notas_operativas?: string | null;
          metros_cuadrados?: number | null;
          precio_renta_base?: number | null;
          cuota_mantenimiento_base?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          nombre_interno?: string;
          tipo_inmueble?: string | null;
          estatus?: string | null;
          direccion_completa?: string | null;
          cuenta_predial?: string | null;
          clave_catastral?: string | null;
          notas_operativas?: string | null;
          metros_cuadrados?: number | null;
          precio_renta_base?: number | null;
          cuota_mantenimiento_base?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "propiedades_empresa_id_fkey";
            columns: ["empresa_id"];
            referencedRelation: "personas";
            referencedColumns: ["id"];
          },
        ];
      };
      contratos: {
        Row: {
          id: string;
          propiedad_id: string;
          cliente_id: string;
          estatus: string | null;
          tipo_incremento_anual: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          monto_renta_mensual: number;
          monto_mantenimiento: number | null;
          tasa_penalizacion_porcentaje: number | null;
          monto_deposito_garantia: number | null;
          dia_limite_pago: number | null;
          meses_de_gracia: number | null;
          tiene_aval: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          propiedad_id: string;
          cliente_id: string;
          estatus?: string | null;
          tipo_incremento_anual?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          monto_renta_mensual: number;
          monto_mantenimiento?: number | null;
          tasa_penalizacion_porcentaje?: number | null;
          monto_deposito_garantia?: number | null;
          dia_limite_pago?: number | null;
          meses_de_gracia?: number | null;
          tiene_aval?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          propiedad_id?: string;
          cliente_id?: string;
          estatus?: string | null;
          tipo_incremento_anual?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          monto_renta_mensual?: number;
          monto_mantenimiento?: number | null;
          tasa_penalizacion_porcentaje?: number | null;
          monto_deposito_garantia?: number | null;
          dia_limite_pago?: number | null;
          meses_de_gracia?: number | null;
          tiene_aval?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contratos_propiedad_id_fkey";
            columns: ["propiedad_id"];
            referencedRelation: "propiedades";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      facturas: {
        Row: {
          id: string;
          persona_id: string;
          cliente_id: string;
          fecha_emision: string;
          subtotal: number;
          retenciones: number;
          traslados: number;
          total: number;
        };
        Insert: {
          id?: string;
          persona_id: string;
          cliente_id: string;
          fecha_emision: string;
          subtotal: number;
          retenciones: number;
          traslados: number;
          total: number;
        };
        Update: {
          id?: string;
          persona_id?: string;
          cliente_id?: string;
          fecha_emision?: string;
          subtotal?: number;
          retenciones?: number;
          traslados?: number;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "facturas_persona_id_fkey";
            columns: ["persona_id"];
            referencedRelation: "personas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "facturas_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      conceptos: {
        Row: {
          id: string;
          factura_id: string;
          clave_prod_serv: number;
          descripcion_sat: string;
          concepto: string;
          cantidad: number;
          valor_unitario: number;
          importe: number;
        };
        Insert: {
          id?: string;
          factura_id: string;
          clave_prod_serv: number;
          descripcion_sat: string;
          concepto: string;
          cantidad: number;
          valor_unitario: number;
          importe: number;
        };
        Update: {
          id?: string;
          factura_id?: string;
          clave_prod_serv?: number;
          descripcion_sat?: string;
          concepto?: string;
          cantidad?: number;
          valor_unitario?: number;
          importe?: number;
        };
        Relationships: [
          {
            foreignKeyName: "conceptos_factura_id_fkey";
            columns: ["factura_id"];
            referencedRelation: "facturas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
