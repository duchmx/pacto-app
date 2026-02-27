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
          }
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
          }
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

