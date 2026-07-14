"use client";

import { useEffect, useState } from "react";
import { debtNow } from "@/app/components/DebtTicker";
import { formatEuro } from "@/lib/kennzahlen";

// Blatt-Komponente: nur die live hochgerechnete Schuldenzahl tickt hier. Dadurch
// rendert das umgebende Dashboard NICHT bei jedem Tick neu. Pausiert im
// Hintergrund und bei "prefers-reduced-motion".
export function LiveDebtAmount({ baseEur, rateYearEur }: { baseEur: number; rateYearEur: number }) {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(debtNow(baseEur, rateYearEur));
    if (reduce) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setAmount(debtNow(baseEur, rateYearEur));
    }, 120);
    return () => window.clearInterval(id);
  }, [baseEur, rateYearEur]);

  return <>{formatEuro(amount ?? baseEur)}</>;
}
