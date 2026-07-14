import { PageHeader } from "@/app/components/PageHeader";
import { SearchClient } from "@/app/components/SearchClient";
import { T } from "@/app/components/LangProvider";

export default function SuchePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={<T k="suche.titel" />} sub={<T k="suche.sub" />} />
      <SearchClient />
    </div>
  );
}
