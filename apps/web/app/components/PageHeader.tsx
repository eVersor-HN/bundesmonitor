import type { ReactNode } from "react";

// Einheitlicher, kompakter Seitenkopf fuer alle Unterseiten.
// Kleine, praezise Typografie statt grosser Ueberschriften (Signal-Stil).
export function PageHeader({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="bm-h1">{title}</h1>
      {sub && <p className="bm-sub max-w-prose">{sub}</p>}
    </div>
  );
}
