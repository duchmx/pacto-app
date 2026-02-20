import Database from "better-sqlite3";
import type { RawFacturaRow } from "./types";

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS raw_facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file TEXT NOT NULL,
  cfdi_version TEXT,
  serie TEXT,
  folio TEXT,
  fecha TEXT,
  tipo_comprobante TEXT,
  forma_pago TEXT,
  subtotal REAL,
  total REAL,
  moneda TEXT,
  lugar_expedicion TEXT,
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
  conceptos_json TEXT,
  complementos_json TEXT,
  raw_comprobante_attrs_json TEXT
);
`;

const INDEX_UUID = `CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_facturas_tfd_uuid ON raw_facturas(tfd_uuid) WHERE tfd_uuid IS NOT NULL;`;
const INDEX_EMISOR_FECHA = `CREATE INDEX IF NOT EXISTS idx_raw_facturas_emisor_fecha ON raw_facturas(emisor_rfc, fecha);`;
const INDEX_RECEPTOR_FECHA = `CREATE INDEX IF NOT EXISTS idx_raw_facturas_receptor_fecha ON raw_facturas(receptor_rfc, fecha);`;

// OR IGNORE: duplicate tfd_uuid (same CFDI in another file/path) is skipped by SQLite; no app-side check.
const INSERT_SQL = `
INSERT OR IGNORE INTO raw_facturas (
  source_file, cfdi_version, serie, folio, fecha, tipo_comprobante, forma_pago,
  subtotal, total, moneda, lugar_expedicion,
  emisor_rfc, emisor_nombre, emisor_regimen_fiscal,
  receptor_rfc, receptor_nombre, receptor_uso_cfdi, receptor_domicilio_fiscal, receptor_regimen_fiscal,
  tfd_uuid, tfd_fecha_timbrado, tfd_rfc_proveedor_certificacion,
  conceptos_json, complementos_json, raw_comprobante_attrs_json
) VALUES (
  @source_file, @cfdi_version, @serie, @folio, @fecha, @tipo_comprobante, @forma_pago,
  @subtotal, @total, @moneda, @lugar_expedicion,
  @emisor_rfc, @emisor_nombre, @emisor_regimen_fiscal,
  @receptor_rfc, @receptor_nombre, @receptor_uso_cfdi, @receptor_domicilio_fiscal, @receptor_regimen_fiscal,
  @tfd_uuid, @tfd_fecha_timbrado, @tfd_rfc_proveedor_certificacion,
  @conceptos_json, @complementos_json, @raw_comprobante_attrs_json
);
`;

export function openDb(dbPath: string): Database.Database {
  return new Database(dbPath);
}

export function createTable(db: Database.Database): void {
  db.exec(TABLE_SQL);
  db.exec(INDEX_UUID);
  db.exec(INDEX_EMISOR_FECHA);
  db.exec(INDEX_RECEPTOR_FECHA);
}

/** Insert multiple rows in a transaction. Returns the number of rows actually inserted (duplicates by tfd_uuid are ignored). */
export function insertBatch(db: Database.Database, rows: RawFacturaRow[]): number {
  if (rows.length === 0) return 0;
  const insert = db.prepare(INSERT_SQL);
  let inserted = 0;
  db.transaction(() => {
    for (const row of rows) {
      const result = insert.run(toDbParams(row));
      inserted += result.changes;
    }
  })();
  return inserted;
}

function toDbParams(row: RawFacturaRow): Record<string, unknown> {
  return {
    source_file: row.source_file,
    cfdi_version: row.cfdi_version ?? null,
    serie: row.serie ?? null,
    folio: row.folio ?? null,
    fecha: row.fecha ?? null,
    tipo_comprobante: row.tipo_comprobante ?? null,
    forma_pago: row.forma_pago ?? null,
    subtotal: row.subtotal ?? null,
    total: row.total ?? null,
    moneda: row.moneda ?? null,
    lugar_expedicion: row.lugar_expedicion ?? null,
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
    conceptos_json: row.conceptos_json ?? null,
    complementos_json: row.complementos_json ?? null,
    raw_comprobante_attrs_json: row.raw_comprobante_attrs_json ?? null,
  };
}
