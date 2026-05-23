import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type OrderStatus = "pending" | "confirmed" | "paid" | "shipped" | "delivered" | "cancelled";

function mapStatus(wompiStatus: string): OrderStatus {
  switch (wompiStatus) {
    case "APPROVED":
      return "paid";
    case "DECLINED":
    case "ERROR":
    case "VOIDED":
      return "cancelled";
    default:
      return "pending";
  }
}

export const Route = createFileRoute("/api/public/wompi-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
        if (!eventsSecret) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const props: string[] = payload?.signature?.properties ?? [];
        const checksum: string = payload?.signature?.checksum ?? "";
        const timestamp = payload?.timestamp ?? "";
        const data = payload?.data ?? {};

        // Build concatenated string from listed properties (e.g. "transaction.id")
        const concat = props
          .map((path) => {
            const parts = path.split(".");
            let v: any = data;
            for (const p of parts) v = v?.[p];
            return v ?? "";
          })
          .join("");

        const expected = createHash("sha256")
          .update(`${concat}${timestamp}${eventsSecret}`)
          .digest("hex");

        if (expected.toLowerCase() !== String(checksum).toLowerCase()) {
          return new Response("Invalid signature", { status: 401 });
        }

        const tx = data?.transaction;
        if (!tx) return new Response("ok");

        const reference: string = tx.reference ?? "";
        const status: string = tx.status ?? "";
        const txId: string = tx.id ?? "";

        if (!reference) return new Response("ok");

        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            status: mapStatus(status),
            wompi_transaction_id: txId,
            wompi_payload: payload as any,
          })
          .eq("wompi_reference", reference);
        if (error) console.error("Wompi webhook update error:", error.message);

        return new Response("ok");
      },
    },
  },
});