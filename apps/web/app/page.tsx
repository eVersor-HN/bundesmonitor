import { Dashboard } from "@/app/components/Dashboard";
import { SeatsBar } from "@/app/components/SeatsBar";
import { StartOverview } from "@/app/components/StartOverview";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">Bundesmonitor – Überblick</h1>
      <SeatsBar />
      <Dashboard />
      <StartOverview />
    </div>
  );
}
