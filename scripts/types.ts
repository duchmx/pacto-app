/**
 * Row shape for raw_facturas table. One row per CFDI document.
 * All fields are optional except source_file; nulls for missing/unmapped data.
 */
export interface RawFacturaRow {
  source_file: string;
  cfdi_version?: string | null;
  serie?: string | null;
  folio?: string | null;
  fecha?: string | null;
  tipo_comprobante?: string | null;
  forma_pago?: string | null;
  subtotal?: number | null;
  total?: number | null;
  moneda?: string | null;
  lugar_expedicion?: string | null;
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
  conceptos_json?: string | null;
  complementos_json?: string | null;
  raw_comprobante_attrs_json?: string | null;
}
