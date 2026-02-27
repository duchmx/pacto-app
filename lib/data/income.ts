import { createClient } from "@/lib/supabase/server";
import { getDashboardToday } from "@/lib/dashboard-config";

/** SAT product/service key range for rent-related conceptos (arrendamiento). */
const RENT_CLAVE_MIN = 80131500;
const RENT_CLAVE_MAX = 80131599;

export interface IncomeDashboardData {
  /** Total rent income year-to-date (current year). */
  ytdTotal: number;
  /** Rent income for the current month only. */
  currentMonthTotal: number;
  /** Month index (1–12) for the current date; used for chart reference line. */
  currentMonthIndex: number;
  /** Accumulated rent income by month for the full year. Index 0 = Jan, 11 = Dec. */
  thisYearAccumulated: number[];
  /** Same for previous year (full 12 months). */
  lastYearAccumulated: number[];
  /** YoY delta at current month: (thisYear - lastYear) / lastYear * 100. Null if last year has no data for comparison. */
  yoyPercent: number | null;
  /** Short month labels for the X axis. */
  monthLabels: string[];
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Builds monthly buckets (1–12) of rent income for a given year from factura+concepto rows.
 * Only conceptos with clave_prod_serv between RENT_CLAVE_MIN and RENT_CLAVE_MAX are counted.
 */
function buildMonthlyRent(
  facturas: { id: string; fecha_emision: string }[],
  conceptos: { factura_id: string; clave_prod_serv: number; importe: number }[]
): number[] {
  const byMonth = new Array<number>(12).fill(0);
  const fechaByFactura = new Map(facturas.map((f) => [f.id, f.fecha_emision]));

  for (const c of conceptos) {
    if (c.clave_prod_serv < RENT_CLAVE_MIN || c.clave_prod_serv > RENT_CLAVE_MAX) continue;
    const fecha = fechaByFactura.get(c.factura_id);
    if (!fecha) continue;
    const d = new Date(fecha);
    const monthIndex = d.getMonth();
    if (monthIndex >= 0 && monthIndex <= 11) {
      byMonth[monthIndex] += c.importe;
    }
  }
  return byMonth;
}

/** Turns monthly totals into accumulated (running sum) series. */
function accumulate(monthly: number[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const m of monthly) {
    sum += m;
    out.push(sum);
  }
  return out;
}

/**
 * Fetches facturas with their conceptos and computes rent-only income metrics for the dashboard.
 * Uses only conceptos with SAT clave_prod_serv between 80131500 and 80131599 (rent).
 */
export async function getIncomeDashboardData(): Promise<IncomeDashboardData> {
  const supabase = await createClient();

  const { data: facturas, error: facturasError } = await supabase
    .from("facturas")
    .select("id, fecha_emision");

  if (facturasError) {
    console.error("getIncomeDashboardData facturas:", facturasError);
    return emptyIncomeData();
  }

  const { data: conceptos, error: conceptosError } = await supabase
    .from("conceptos")
    .select("factura_id, clave_prod_serv, importe");

  if (conceptosError) {
    console.error("getIncomeDashboardData conceptos:", conceptosError);
    return emptyIncomeData();
  }

  const now = getDashboardToday();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const currentMonthIndex = now.getMonth();

  // Filter facturas to this year and last year for date parsing
  const facturasThisYear = (facturas ?? []).filter((f) => {
    const y = new Date(f.fecha_emision).getFullYear();
    return y === thisYear;
  });
  const facturasLastYear = (facturas ?? []).filter((f) => {
    const y = new Date(f.fecha_emision).getFullYear();
    return y === lastYear;
  });

  const monthlyThisYear = buildMonthlyRent(facturasThisYear, conceptos ?? []);
  const monthlyLastYear = buildMonthlyRent(facturasLastYear, conceptos ?? []);

  const thisYearAccumulated = accumulate(monthlyThisYear);
  const lastYearAccumulated = accumulate(monthlyLastYear);

  const ytdTotal = thisYearAccumulated[currentMonthIndex] ?? 0;
  const currentMonthTotal = monthlyThisYear[currentMonthIndex] ?? 0;

  const lastYearYtdAtSameMonth = lastYearAccumulated[currentMonthIndex] ?? 0;
  const yoyPercent =
    lastYearYtdAtSameMonth !== 0
      ? ((ytdTotal - lastYearYtdAtSameMonth) / lastYearYtdAtSameMonth) * 100
      : null;

  return {
    ytdTotal,
    currentMonthTotal,
    currentMonthIndex,
    thisYearAccumulated: thisYearAccumulated.length ? thisYearAccumulated : new Array(12).fill(0),
    lastYearAccumulated: lastYearAccumulated.length ? lastYearAccumulated : new Array(12).fill(0),
    yoyPercent,
    monthLabels: MONTH_LABELS,
  };
}

function emptyIncomeData(): IncomeDashboardData {
  const now = getDashboardToday();
  return {
    ytdTotal: 0,
    currentMonthTotal: 0,
    currentMonthIndex: now.getMonth(),
    thisYearAccumulated: new Array(12).fill(0),
    lastYearAccumulated: new Array(12).fill(0),
    yoyPercent: null,
    monthLabels: MONTH_LABELS,
  };
}
