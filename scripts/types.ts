/**
 * Row shape for facturas table. One row per CFDI document.
 * factura_uuid is set on insert (tfd_uuid or generated); used to link conceptos.
 */
export interface FacturaRow {
  source_file: string;
  factura_uuid: string;
  cfdi_version?: string | null;
  serie?: string | null;
  folio?: string | null;
  fecha?: string | null;
  tipo_comprobante?: string | null;
  forma_pago?: string | null;
  metodo_pago?: string | null;
  subtotal?: number | null;
  total?: number | null;
  moneda?: string | null;
  lugar_expedicion?: string | null;
  total_impuestos_retenidos?: number | null;
  total_impuestos_trasladados?: number | null;
  emisor_rfc?: string | null;
  emisor_nombre?: string | null;
  emisor_regimen_fiscal?: string | null;
  receptor_rfc?: string | null;
  receptor_nombre?: string | null;
  receptor_uso_cfdi?: string | null;
  receptor_domicilio_fiscal?: string | null;
  receptor_regimen_fiscal?: string | null;
  tfd_uuid?: string | null;
  tfd_fecha_timbrado?: string | null;
  tfd_rfc_proveedor_certificacion?: string | null;
  retenciones_json?: string | null;
  traslados_json?: string | null;
  complementos_json?: string | null;
  raw_comprobante_attrs_json?: string | null;
}

/**
 * Row for conceptos table. One row per line item; linked to facturas via factura_uuid.
 * id is a generated UUID; factura_uuid is set when inserting (from parent factura).
 */
export interface ConceptoRow {
  id: string;
  factura_uuid: string;
  clave_prod_serv?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
  valor_unitario?: number | null;
  importe?: number | null;
}

/** Parsed CFDI: factura row (factura_uuid to be set on insert) + conceptos to insert. */
export interface ParsedCfdi {
  factura: Omit<FacturaRow, "factura_uuid"> & { factura_uuid?: never };
  conceptos: Omit<ConceptoRow, "id" | "factura_uuid">[];
}
