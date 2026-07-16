import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { STEUERN_UEBRIGE_2025 } from "@/lib/steuern";

// Die "uebrigen" Steuerarten im Detail: alles jenseits der fuenf groessten.

export default function UebrigeSteuernPage() {
  const u = STEUERN_UEBRIGE_2025;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="uebrigesteuern.titel" />}
        sub={`${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(u.total)} Mrd € (${u.year}) jenseits der fünf größten Steuern – hier die volle Aufschlüsselung. Zeile mit ⓘ antippen: wer zahlt das eigentlich?`}
      />

      <section className="bm-card p-3.5">
        <PostenListe items={u.arten} color="var(--bm-accent-2)" />
        <SourceLine sources={[u.source]} />
      </section>

      <p className="text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
        <Link className="bm-link" href="/geld/steuer/energiesteuer">
          <T k="energie.detail" />
        </Link>
      </p>

    </div>
  );
}
