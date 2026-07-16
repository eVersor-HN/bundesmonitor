import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  IconActivity,
  IconCalendar,
  IconChevron,
  IconDoc,
  IconGear,
  IconInfo,
  IconMegaphone,
  IconSpeaker,
  IconStar,
  IconStats,
  IconTag,
} from "@/app/components/icons";

// „Mehr": Sammelpunkt für die Bereiche, die nicht zu den fünf Haupt-Achsen
// gehören – Kontext-Statistik, Termine, Mitmachen sowie Info/Rechtliches.
// Titel/Beschreibungen bewusst identisch zum Suchindex (lib/siteIndex.ts).
type Item = { href: string; icon: ReactNode; label: string; desc: string };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Entdecken",
    items: [
      { href: "/merkliste", icon: <IconStar size={18} />, label: "Merkliste", desc: "Deine gemerkten Vorgänge – lokal gespeichert" },
      { href: "/themen", icon: <IconTag size={20} />, label: "Themen", desc: "Vorgänge nach Sachgebiet durchstöbern" },
      { href: "/zahlen", icon: <IconStats />, label: "Statistik", desc: "Kriminalität, Wirtschaft, Bevölkerung, Länder" },
      { href: "/anstehend", icon: <IconCalendar />, label: "Termine & Wahlen", desc: "Wahl-Countdown & Sitzungswochen" },
      { href: "/mitmachen", icon: <IconMegaphone />, label: "Mitmachen", desc: "Petition, Beschwerde, Auskunft" },
      { href: "/rundfunk", icon: <IconSpeaker />, label: "Öffentlich-rechtlicher Rundfunk", desc: "Beitrag, Verteilung, Gehälter" },
    ],
  },
  {
    title: "Info & Rechtliches",
    items: [
      { href: "/status", icon: <IconActivity />, label: "Quellenstatus", desc: "Woher die Daten kommen und ob der Abruf läuft" },
      { href: "/ueber", icon: <IconInfo />, label: "Über Bundesmonitor", desc: "Projekt, Kontakt, Spenden" },
      { href: "/rechtliches", icon: <IconDoc />, label: "Rechtliche Hinweise", desc: "Datenschutz, Haftung, Quellen" },
      { href: "/einstellungen", icon: <IconGear size={20} />, label: "Optionen", desc: "Sprache, Design, Bundesland, Benachrichtigungen" },
    ],
  },
];

export default function MehrPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Mehr" sub="Weitere Bereiche, Kontext-Zahlen und Rechtliches." />
      {GROUPS.map((g) => (
        <section key={g.title} className="flex flex-col gap-2">
          <h2 className="bm-sect px-1">{g.title}</h2>
          <ul className="flex flex-col gap-2">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="bm-card bm-card--hover flex items-center gap-3 p-3.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--bm-surface-2)", color: "var(--bm-accent)" }}
                  >
                    {it.icon}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[0.9rem] font-semibold">{it.label}</span>
                    <span className="text-[0.74rem]" style={{ color: "var(--bm-text-muted)" }}>
                      {it.desc}
                    </span>
                  </span>
                  <span className="-rotate-90" style={{ marginLeft: "auto", color: "var(--bm-text-muted)", flex: "none" }}>
                    <IconChevron size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
