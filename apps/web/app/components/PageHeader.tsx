import type { ReactNode } from "react";

// Einheitlicher, kompakter Seitenkopf fuer alle Unterseiten.
// Kleine, praezise Typografie statt grosser Ueberschriften (Signal-Stil).
export function PageHeader({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-4 w-[3px] shrink-0 rounded-full"
          style={{ background: "var(--bm-accent)", boxShadow: "var(--bm-glow)" }}
        />
        <h1 className="bm-h1">{title}</h1>
      </div>
      {sub && <p className="bm-sub max-w-prose">{sub}</p>}
    </div>
  );
}
