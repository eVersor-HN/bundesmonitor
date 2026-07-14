import type { ReactNode } from "react";

// template.tsx wird bei JEDEM Seitenwechsel neu gemountet (anders als layout.tsx).
// Der Wrapper spielt darum bei jeder Navigation eine sanfte Einblendung ab –
// angenehmere Uebergaenge zwischen den Seiten. Header/Bottom-Nav bleiben ruhig
// (die liegen im Layout, nicht hier). "prefers-reduced-motion" schaltet die
// Animation global aus (siehe globals.css).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="bm-page">{children}</div>;
}
