import { Suspense } from "react";
import { MatterClient } from "@/app/components/MatterClient";

export default function VorgangPage() {
  return (
    <Suspense fallback={<p className="text-sm">Lädt…</p>}>
      <MatterClient />
    </Suspense>
  );
}
