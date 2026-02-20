import Database from "better-sqlite3";
import type { FacturaRow, ConceptoRow } from "./types";

const FACTURAS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_uuid TEXT NOT NULL UNIQUE,
  source_file TEXT NOT NULL,
  cfdi_version TEXT,
  serie TEXT,
  folio TEXT,
  fecha TEXT,
  tipo_comprobante TEXT,
  forma_pago TEXT,
  metodo_pago TEXT,
  subtotal REAL,
  total REAL,
  moneda TEXT,
  lugar_expedicion TEXT,
  total_impuestos_retenidos REAL,
  total_impuestos_trasladados REAL,
  emisor_rfc TEXT,
  emisor_nombre TEXT,
  emisor_regimen_fiscal TEXT,
  receptor_rfc TEXT,
  receptor_nombre TEXT,
  receptor_uso_cfdi TEXT,
  receptor_domicilio_fiscal TEXT,
  receptor_regimen_fiscal TEXT,
  tfd_uuid TEXT,
  tfd_fecha_timbrado TEXT,
  tfd_rfc_proveedor_certificacion TEXT,
  retenciones_json TEXT,
  traslados_json TEXT,
  complementos_json TEXT,
  raw_comprobante_attrs_json TEXT
);
`;

const CONCEPTOS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS conceptos (
  id TEXT PRIMARY KEY,
  factura_uuid TEXT NOT NULL,
  clave_prod_serv TEXT,
  descripcion TEXT,
  cantidad REAL,
  valor_unitario REAL,
  importe REAL
);
`;

const INDEX_TFD_UUID = `CREATE UNIQUE INDEX IF NOT EXISTS idx_facturas_tfd_uuid ON facturas(tfd_uuid) WHERE tfd_uuid IS NOT NULL;`;
const INDEX_EMISOR_FECHA = `CREATE INDEX IF NOT EXISTS idx_facturas_emisor_fecha ON facturas(emisor_rfc, fecha);`;
const INDEX_RECEPTOR_FECHA = `CREATE INDEX IF NOT EXISTS idx_facturas_receptor_fecha ON facturas(receptor_rfc, fecha);`;
const INDEX_CONCEPTOS_FACTURA = `CREATE INDEX IF NOT EXISTS idx_conceptos_factura_uuid ON conceptos(factura_uuid);`;

// Duplicate factura_uuid (same CFDI) is skipped; we only insert conceptos when factura is actually inserted.
const INSERT_FACTURA_SQL = `
INSERT OR IGNORE INTO facturas (
  factura_uuid, source_file, cfdi_version, serie, folio, fecha, tipo_comprobante, forma_pago, metodo_pago,
  subtotal, total, moneda, lugar_expedicion, total_impuestos_retenidos, total_impuestos_trasladados,
  emisor_rfc, emisor_nombre, emisor_regimen_fiscal,
  receptor_rfc, receptor_nombre, receptor_uso_cfdi, receptor_domicilio_fiscal, receptor_regimen_fiscal,
  tfd_uuid, tfd_fecha_timbrado, tfd_rfc_proveedor_certificacion,
  retenciones_json, traslados_json, complementos_json, raw_comprobante_attrs_json
) VALUES (
  @factura_uuid, @source_file, @cfdi_version, @serie, @folio, @fecha, @tipo_comprobante, @forma_pago, @metodo_pago,
  @subtotal, @total, @moneda, @lugar_expedicion, @total_impuestos_retenidos, @total_impuestos_trasladados,
  @emisor_rfc, @emisor_nombre, @emisor_regimen_fiscal,
  @receptor_rfc, @receptor_nombre, @receptor_uso_cfdi, @receptor_domicilio_fiscal, @receptor_regimen_fiscal,
  @tfd_uuid, @tfd_fecha_timbrado, @tfd_rfc_proveedor_certificacion,
  @retenciones_json, @traslados_json, @complementos_json, @raw_comprobante_attrs_json
);
`;

const INSERT_CONCEPTO_SQL = `
INSERT INTO conceptos (id, factura_uuid, clave_prod_serv, descripcion, cantidad, valor_unitario, importe)
VALUES (@id, @factura_uuid, @clave_prod_serv, @descripcion, @cantidad, @valor_unitario, @importe);
`;

export function openDb(dbPath: string): Database.Database {
  return new Database(dbPath);
}

export function createTable(db: Database.Database): void {
  db.exec(FACTURAS_TABLE_SQL);
  db.exec(CONCEPTOS_TABLE_SQL);
  db.exec(INDEX_TFD_UUID);
  db.exec(INDEX_EMISOR_FECHA);
  db.exec(INDEX_RECEPTOR_FECHA);
  db.exec(INDEX_CONCEPTOS_FACTURA);
}

export interface FacturaWithConceptos {
  factura: FacturaRow;
  conceptos: ConceptoRow[];
}

/** Insert facturas and their conceptos. Returns the number of facturas actually inserted (duplicates by factura_uuid/tfd_uuid ignored). */
export function insertBatch(db: Database.Database, items: FacturaWithConceptos[]): number {
  if (items.length === 0) return 0;
  const insertFactura = db.prepare(INSERT_FACTURA_SQL);
  const insertConcepto = db.prepare(INSERT_CONCEPTO_SQL);
  let inserted = 0;
  db.transaction(() => {
    for (const { factura, conceptos } of items) {
      const result = insertFactura.run(toFacturaParams(factura));
      inserted += result.changes;
      if (result.changes > 0) {
        for (const c of conceptos) {
          insertConcepto.run(toConceptoParams(c));
        }
      }
    }
  })();
  return inserted;
}

function toFacturaParams(row: FacturaRow): Record<string, unknown> {
  return {
    factura_uuid: row.factura_uuid,
    source_file: row.source_file,
    cfdi_version: row.cfdi_version ?? null,
    serie: row.serie ?? null,
    folio: row.folio ?? null,
    fecha: row.fecha ?? null,
    tipo_comprobante: row.tipo_comprobante ?? null,
    forma_pago: row.forma_pago ?? null,
    metodo_pago: row.metodo_pago ?? null,
    subtotal: row.subtotal ?? null,
    total: row.total ?? null,
    moneda: row.moneda ?? null,
    lugar_expedicion: row.lugar_expedicion ?? null,
    total_impuestos_retenidos: row.total_impuestos_retenidos ?? null,
    total_impuestos_trasladados: row.total_impuestos_trasladados ?? null,
    emisor_rfc: row.emisor_rfc ?? null,
    emisor_nombre: row.emisor_nombre ?? null,
    emisor_regimen_fiscal: row.emisor_regimen_fiscal ?? null,
    receptor_rfc: row.receptor_rfc ?? null,
    receptor_nombre: row.receptor_nombre ?? null,
    receptor_uso_cfdi: row.receptor_uso_cfdi ?? null,
    receptor_domicilio_fiscal: row.receptor_domicilio_fiscal ?? null,
    receptor_regimen_fiscal: row.receptor_regimen_fiscal ?? null,
    tfd_uuid: row.tfd_uuid ?? null,
    tfd_fecha_timbrado: row.tfd_fecha_timbrado ?? null,
    tfd_rfc_proveedor_certificacion: row.tfd_rfc_proveedor_certificacion ?? null,
    retenciones_json: row.retenciones_json ?? null,
    traslados_json: row.traslados_json ?? null,
    complementos_json: row.complementos_json ?? null,
    raw_comprobante_attrs_json: row.raw_comprobante_attrs_json ?? null,
  };
}

function toConceptoParams(row: ConceptoRow): Record<string, unknown> {
  return {
    id: row.id,
    factura_uuid: row.factura_uuid,
    clave_prod_serv: row.clave_prod_serv ?? null,
    descripcion: row.descripcion ?? null,
    cantidad: row.cantidad ?? null,
    valor_unitario: row.valor_unitario ?? null,
    importe: row.importe ?? null,
  };
}
