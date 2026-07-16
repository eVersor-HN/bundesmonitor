import { ElectionCountdown } from "@/app/components/ElectionCountdown";
import { HashScroll } from "@/app/components/HashScroll";
import { PageHeader } from "@/app/components/PageHeader";
import { SessionWeeks } from "@/app/components/SessionWeeks";
import { T } from "@/app/components/LangProvider";

export default function AnstehendPage() {
  return (
    <div className="flex flex-col gap-4">
      <HashScroll />
      <PageHeader
        title={<T k="nav.anstehend" />}
        sub={<T k="anstehend.sub" />}
      />

      <div id="wahl" className="scroll-mt-20">
        <ElectionCountdown />
      </div>
      <div id="sitzungen" className="scroll-mt-20">
        <SessionWeeks />
      </div>
    </div>
  );
}
