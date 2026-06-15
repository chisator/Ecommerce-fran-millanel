import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Order } from "@/types";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    const role = userSnap.exists ? userSnap.data()?.role : "customer";

    let query: FirebaseFirestore.Query = getAdminDb().collection("orders");
    if (role !== "admin") {
      query = query.where("userId", "==", decoded.uid);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderRef = getAdminDb().collection("orders").doc();
    const orderData: Record<string, unknown> = {
      id: orderRef.id,
      userId: body.userId || "guest",
      customerEmail: body.customerEmail || "",
      customerName: body.customerName || "",
      items: body.items || [],
      total: Number(body.total) || 0,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: body.paymentMethod || "mercadopago",
      deliveryMethod: body.deliveryMethod || "pickup",
      deliveryDetails: body.deliveryDetails || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (body.mpPreferenceId) {
      orderData.mpPreferenceId = body.mpPreferenceId;
    }
    await orderRef.set(orderData);
    const order = orderData as unknown as Order;

    // Update stock
    for (const item of order.items) {
      const productRef = getAdminDb().collection("products").doc(item.productId);
      const productSnap = await productRef.get();
      if (productSnap.exists) {
        const currentStock = productSnap.data()?.stock || 0;
        await productRef.update({ stock: Math.max(0, currentStock - item.quantity) });
      }
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        to: order.customerEmail,
        orderId: order.id,
        customerName: order.customerName,
        items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: order.total,
        deliveryMethod: order.deliveryMethod,
        deliveryDetails: order.deliveryDetails,
      });
    } catch (emailError) {
      console.error("Email send failed (non-blocking):", emailError);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    const isAdmin = userSnap.exists && userSnap.data()?.role === "admin";

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const ref = getAdminDb().collection("orders").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = snap.data();
    const isOwner = orderData?.userId === decoded.uid;

    // If not admin, only allow owner to cancel their own pending orders
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Only allow cancelling pending orders
      if (orderData?.status !== "pending" || orderData?.paymentStatus === "approved") {
        return NextResponse.json({ error: "Cannot modify this order" }, { status: 403 });
      }
      // Only allow status changes to cancelled
      if (data.status && data.status !== "cancelled") {
        return NextResponse.json({ error: "Can only cancel orders" }, { status: 403 });
      }
      if (data.paymentStatus && data.paymentStatus !== "rejected") {
        return NextResponse.json({ error: "Can only cancel orders" }, { status: 403 });
      }
    }

    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updated = await ref.get();
    return NextResponse.json({ order: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
