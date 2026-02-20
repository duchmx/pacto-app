import crypto from "crypto";
import fs from "fs";
import path from "path";
import { openDb, createTable, insertBatch } from "./db";
import { parseCfdi } from "./cfdi-mapper";
import type { FacturaRow, ConceptoRow } from "./types";

const BATCH_SIZE = 500;
const FALLBACK_DB_NAME = "cfdi_export";

/** Sanitize folder name for use as a DB filename (alphanumeric, _, -, . only). */
function sanitizeDbName(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return sanitized.length > 0 ? sanitized : FALLBACK_DB_NAME;
}

/**
 * Recursively find all .xml files under rootDir using fs.
 * Returns absolute paths.
 */
function findXmlFiles(rootDir: string): string[] {
  const results: string[] = [];
  const stack = [path.resolve(rootDir)];

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      console.error(`Cannot read directory ${dir}:`, err);
      continue;
    }

    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(fullPath);
      } else if (ent.isFile() && path.extname(ent.name).toLowerCase() === ".xml") {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function main(): void {
  const inputDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd();

  if (!fs.existsSync(inputDir)) {
    console.error("Input directory does not exist:", inputDir);
    process.exit(1);
  }

  const dbDir = path.dirname(inputDir);
  const folderName = path.basename(inputDir);
  const dbName = sanitizeDbName(folderName);
  const dbPath = path.join(dbDir, `${dbName}.db`);

  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create output directory:", err);
    process.exit(1);
  }

  const db = openDb(dbPath);
  createTable(db);

  console.log("Writing DB:", dbPath);
  console.log("Scanning for .xml files in:", inputDir);
  const xmlPaths = findXmlFiles(inputDir);
  console.log("Found", xmlPaths.length, "XML file(s).");

  const batch: { factura: FacturaRow; conceptos: ConceptoRow[] }[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const filePath of xmlPaths) {
    let xml: string;
    try {
      xml = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      console.error("Read error:", filePath, err);
      skipped++;
      continue;
    }

    const parsed = parseCfdi(xml, filePath);
    if (!parsed) {
      console.error("Parse/skip (not CFDI or invalid):", filePath);
      skipped++;
      continue;
    }

    const factura_uuid = parsed.factura.tfd_uuid ?? crypto.randomUUID();
    const factura: FacturaRow = {
      ...parsed.factura,
      factura_uuid,
    };
    const conceptos: ConceptoRow[] = parsed.conceptos.map((c) => ({
      ...c,
      id: crypto.randomUUID(),
      factura_uuid,
    }));

    batch.push({ factura, conceptos });
    if (batch.length >= BATCH_SIZE) {
      inserted += insertBatch(db, batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    inserted += insertBatch(db, batch);
  }

  db.close();

  console.log("Done. Inserted:", inserted, "| Skipped:", skipped, "(duplicates by UUID ignored)");
}

main();
