/**
 * MVP-only: pretend "today" is one year ago so dashboard charts use historic data.
 * Facturas only have invoices through Dec 2025; with this on, "this year" = 2025, "last year" = 2024.
 * Set to false once real movimientos/cargos and current dates are in use.
 */
export const MOCK_TODAY_ONE_YEAR_AGO = true;

/** Returns the date to use as "today" for dashboard logic (real or mocked). */
export function getDashboardToday(): Date {
  const real = new Date();
  if (!MOCK_TODAY_ONE_YEAR_AGO) return real;
  return new Date(real.getFullYear() - 1, real.getMonth(), real.getDate());
}
