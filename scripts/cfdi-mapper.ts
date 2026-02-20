import { XMLParser } from "fast-xml-parser";
import type { ParsedCfdi } from "./types";

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  parseTagValue: false,
};

const parser = new XMLParser(PARSER_OPTIONS);

/** Get first key that ends with 'Comprobante' (handles cfdi:Comprobante or Comprobante). */
function getComprobanteRoot(parsed: Record<string, unknown>): Record<string, unknown> | null {
  const key = Object.keys(parsed).find((k) => k.endsWith("Comprobante") || k === "Comprobante");
  if (!key) return null;
  const comp = parsed[key];
  return comp && typeof comp === "object" && !Array.isArray(comp) ? (comp as Record<string, unknown>) : null;
}

function attr(obj: Record<string, unknown> | undefined, name: string): string | undefined {
  if (!obj) return undefined;
  const v = obj["@_" + name];
  return v !== undefined && v !== null ? String(v) : undefined;
}

function attrNum(obj: Record<string, unknown> | undefined, name: string): number | undefined {
  const v = attr(obj, name);
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Extract TimbreFiscalDigital from Complemento (may be under tfd:TimbreFiscalDigital or local name). */
function extractTfd(complemento: unknown): Record<string, unknown> | null {
  if (!complemento || typeof complemento !== "object") return null;
  const o = complemento as Record<string, unknown>;
  const key = Object.keys(o).find(
    (k) => k.endsWith("TimbreFiscalDigital") || k === "TimbreFiscalDigital"
  );
  if (!key) return null;
  const tfd = o[key];
  if (Array.isArray(tfd)) return (tfd[0] as Record<string, unknown>) ?? null;
  return tfd && typeof tfd === "object" ? (tfd as Record<string, unknown>) : null;
}

/** Normalize Conceptos: may be single Concepto or array. */
function normalizeConceptos(conceptos: unknown): Record<string, unknown>[] {
  if (!conceptos || typeof conceptos !== "object") return [];
  const o = conceptos as Record<string, unknown>;
  const concepto = o.Concepto;
  if (!concepto) return [];
  if (Array.isArray(concepto)) return concepto as Record<string, unknown>[];
  return [concepto as Record<string, unknown>];
}

/** Extract Impuestos: TotalImpuestosRetenidos, TotalImpuestosTrasladados, and Retenciones/Traslados as JSON. */
function extractImpuestos(comp: Record<string, unknown>): {
  totalImpuestosRetenidos: number | undefined;
  totalImpuestosTrasladados: number | undefined;
  retencionesJson: string | null;
  trasladosJson: string | null;
} {
  const impuestos = comp.Impuestos as Record<string, unknown> | undefined;
  if (!impuestos || typeof impuestos !== "object") {
    return { totalImpuestosRetenidos: undefined, totalImpuestosTrasladados: undefined, retencionesJson: null, trasladosJson: null };
  }
  const totalImpuestosRetenidos = attrNum(impuestos, "TotalImpuestosRetenidos");
  const totalImpuestosTrasladados = attrNum(impuestos, "TotalImpuestosTrasladados");
  const retenciones = impuestos.Retenciones;
  const traslados = impuestos.Traslados;
  const retencionesJson = retenciones != null && typeof retenciones === "object" ? JSON.stringify(retenciones) : null;
  const trasladosJson = traslados != null && typeof traslados === "object" ? JSON.stringify(traslados) : null;
  return { totalImpuestosRetenidos, totalImpuestosTrasladados, retencionesJson, trasladosJson };
}

/**
 * Parse CFDI XML string and return factura + conceptos, or null if not a valid CFDI Comprobante.
 */
export function parseCfdi(xmlString: string, sourcePath: string): ParsedCfdi | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xmlString) as Record<string, unknown>;
  } catch {
    return null;
  }

  const comp = getComprobanteRoot(parsed);
  if (!comp) return null;

  const version = attr(comp, "Version");
  if (!version) return null;

  const emisor = comp.Emisor as Record<string, unknown> | undefined;
  const receptor = comp.Receptor as Record<string, unknown> | undefined;
  const conceptosNode = comp.Conceptos as Record<string, unknown> | undefined;
  const conceptosList = conceptosNode ? normalizeConceptos(conceptosNode) : [];

  const { totalImpuestosRetenidos, totalImpuestosTrasladados, retencionesJson, trasladosJson } = extractImpuestos(comp);

  let complementosJson: string | null = null;
  let tfdUuid: string | undefined;
  let tfdFechaTimbrado: string | undefined;
  let tfdRfcProvCertif: string | undefined;

  const complemento = comp.Complemento;
  if (complemento && typeof complemento === "object") {
    const tfd = extractTfd(complemento);
    if (tfd) {
      tfdUuid = attr(tfd, "UUID");
      tfdFechaTimbrado = attr(tfd, "FechaTimbrado");
      tfdRfcProvCertif = attr(tfd, "RfcProvCertif");
    }
    complementosJson = JSON.stringify(complemento);
  }

  // Raw Comprobante attributes excluding MetodoPago (stored in metodo_pago column).
  const rawComprobanteAttrs: Record<string, unknown> = {};
  for (const key of Object.keys(comp)) {
    if (!key.startsWith("@_")) continue;
    const attrName = key.slice(2);
    if (attrName === "MetodoPago") continue;
    rawComprobanteAttrs[attrName] = (comp as Record<string, unknown>)[key];
  }
  const rawComprobanteAttrsJson =
    Object.keys(rawComprobanteAttrs).length > 0 ? JSON.stringify(rawComprobanteAttrs) : null;

  const factura: ParsedCfdi["factura"] = {
    source_file: sourcePath,
    cfdi_version: version,
    serie: attr(comp, "Serie"),
    folio: attr(comp, "Folio"),
    fecha: attr(comp, "Fecha"),
    tipo_comprobante: attr(comp, "TipoDeComprobante"),
    forma_pago: attr(comp, "FormaPago"),
    metodo_pago: attr(comp, "MetodoPago"),
    subtotal: attrNum(comp, "SubTotal"),
    total: attrNum(comp, "Total"),
    moneda: attr(comp, "Moneda"),
    lugar_expedicion: attr(comp, "LugarExpedicion"),
    total_impuestos_retenidos: totalImpuestosRetenidos,
    total_impuestos_trasladados: totalImpuestosTrasladados,
    emisor_rfc: emisor ? attr(emisor, "Rfc") : undefined,
    emisor_nombre: emisor ? attr(emisor, "Nombre") : undefined,
    emisor_regimen_fiscal: emisor ? attr(emisor, "RegimenFiscal") : undefined,
    receptor_rfc: receptor ? attr(receptor, "Rfc") : undefined,
    receptor_nombre: receptor ? attr(receptor, "Nombre") : undefined,
    receptor_uso_cfdi: receptor ? attr(receptor, "UsoCFDI") : undefined,
    receptor_domicilio_fiscal: receptor ? attr(receptor, "DomicilioFiscalReceptor") : undefined,
    receptor_regimen_fiscal: receptor ? attr(receptor, "RegimenFiscalReceptor") : undefined,
    tfd_uuid: tfdUuid,
    tfd_fecha_timbrado: tfdFechaTimbrado,
    tfd_rfc_proveedor_certificacion: tfdRfcProvCertif,
    retenciones_json: retencionesJson,
    traslados_json: trasladosJson,
    complementos_json: complementosJson,
    raw_comprobante_attrs_json: rawComprobanteAttrsJson,
  };

  const conceptos: ParsedCfdi["conceptos"] = conceptosList.map((c) => ({
    clave_prod_serv: attr(c, "ClaveProdServ"),
    descripcion: attr(c, "Descripcion"),
    cantidad: attrNum(c, "Cantidad"),
    valor_unitario: attrNum(c, "ValorUnitario"),
    importe: attrNum(c, "Importe"),
  }));

  return { factura, conceptos };
}
