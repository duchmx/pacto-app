import { getIncomeDashboardData } from "@/lib/data/income";
import { IncomeCard } from "@/components/dashboard/income-card";

export default async function DashboardPage() {
  const incomeData = await getIncomeDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Financial overview and rent income from facturas (SAT rent keys
          80131500–80131599).
        </p>
      </div>

      <section aria-label="Rent income YTD">
        <IncomeCard data={incomeData} />
      </section>
    </div>
  );
}
