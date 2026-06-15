import { NextRequest, NextResponse } from "next/server";
import { getMpAccessToken } from "@/lib/mp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, orderId, payer } = body;

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}` || "http://localhost:3000";

    const successUrl = `${origin}/checkout?status=success`;
    const failureUrl = `${origin}/checkout?status=failure`;
    const pendingUrl = `${origin}/checkout?status=pending`;

    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

    // Ensure price is a valid number with 2 decimal places
    const formattedItems = items.map((item: { title: string; unit_price: number; quantity: number }) => ({
      title: item.title.slice(0, 256), // MP limit
      unit_price: Number(Number(item.unit_price).toFixed(2)),
      quantity: Number(item.quantity),
      currency_id: "ARS",
    }));

    const preference: Record<string, unknown> = {
      items: formattedItems,
      payer: {
        name: (payer?.name || "Cliente").slice(0, 60),
        email: payer?.email || "cliente@example.com",
        identification: {
          type: "DNI",
          number: "12345678",
        },
        phone: {
          area_code: "",
          number: "1112345678",
        },
        address: {
          zip_code: "",
          street_name: "",
          street_number: null,
        },
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      external_reference: orderId,
      notification_url: `${origin}/api/payment/webhook`,
      statement_descriptor: "FRANCOSMETICOS",
    };

    // auto_return requires public URLs; skip on localhost
    if (!isLocalhost) {
      preference.auto_return = "approved";
    }

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getMpAccessToken()}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Mercado Pago error:", data);
      return NextResponse.json({ error: data.message || "MP error" }, { status: 500 });
    }

    return NextResponse.json({
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    return NextResponse.json({ error: "Failed to create preference" }, { status: 500 });
  }
}
