import { Suspense } from "react";
import { ParteienClient } from "@/app/components/ParteienClient";

export default function ParteienPage() {
  return (
    <Suspense fallback={<p className="text-sm">Lädt…</p>}>
      <ParteienClient />
    </Suspense>
  );
}
