import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPaymentApprovedEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Mercado Pago sends payment notifications
    if (type === "payment" && data?.id) {
      const paymentId = data.id;
      // Optionally verify payment with MP API using access token
      // For simplicity, update order status based on external_reference
      // In production, verify the signature!
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });
      const paymentData = await paymentRes.json();

      if (paymentData.external_reference) {
        const orderId = paymentData.external_reference;
        const orderRef = getAdminDb().collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          const orderData = orderSnap.data();
          const previousStatus = orderData?.paymentStatus;
          const status = paymentData.status;
          const updates: Record<string, unknown> = {
            mpPaymentId: String(paymentId),
            updatedAt: new Date().toISOString(),
          };
          if (status === "approved") {
            updates.paymentStatus = "approved";
            updates.status = "preparing";
          } else if (status === "rejected") {
            updates.paymentStatus = "rejected";
            updates.status = "cancelled";
          } else if (status === "in_process" || status === "pending") {
            updates.paymentStatus = "pending";
          }
          await orderRef.update(updates);

          // Send payment approved email only if transitioning to approved
          if (status === "approved" && previousStatus !== "approved") {
            try {
              await sendPaymentApprovedEmail({
                to: orderData?.customerEmail || "",
                orderId: orderId,
                customerName: orderData?.customerName || "Cliente",
                items: (orderData?.items || []).map((i: { name: string; quantity: number; price: number }) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                })),
                total: orderData?.total || 0,
              });
            } catch (emailError) {
              console.error("Payment approved email failed (non-blocking):", emailError);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
