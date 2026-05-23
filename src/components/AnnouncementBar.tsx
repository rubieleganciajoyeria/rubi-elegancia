import { useQuery } from "@tanstack/react-query";
import { getGlobalSettings } from "@/lib/site-content.functions";

export function AnnouncementBar() {
  const { data } = useQuery({
    queryKey: ["global-settings"],
    queryFn: () => getGlobalSettings(),
    staleTime: 60_000,
  });
  const msg = data?.announcement?.trim();
  if (!msg) return null;
  return (
    <div className="bg-wine text-background">
      <p className="mx-auto max-w-7xl px-6 py-2 text-center text-[11px] uppercase tracking-[0.25em] md:px-10">
        {msg}
      </p>
    </div>
  );
}