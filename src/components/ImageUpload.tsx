import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  folder: "products" | "banners" | "home" | "footer";
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
  accept?: string;
  maxSizeMb?: number;
  successMessage?: string;
  errorSizeMessage?: string;
};

export function ImageUpload({
  folder,
  onUploaded,
  label = "Subir imagen",
  className = "",
  accept = "image/*",
  maxSizeMb = 5,
  successMessage = "Imagen subida",
  errorSizeMessage,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(errorSizeMessage ?? `Máx ${maxSizeMb}MB por archivo`);
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onUploaded(data.publicUrl);
      toast.success(successMessage);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className={`text-[11px] uppercase tracking-[0.25em] text-wine hover:opacity-80 disabled:opacity-40 ${className}`}
      >
        {busy ? "Subiendo…" : label}
      </button>
    </>
  );
}
