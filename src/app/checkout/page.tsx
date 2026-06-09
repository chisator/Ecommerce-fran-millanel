"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/components/AuthProvider";
import { DeliverySelector } from "@/components/DeliverySelector";
import { DeliveryMethod } from "@/types";
import { useToastStore } from "@/store/toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const totalPrice = useCart((s) => s.totalPrice());

  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failure">("idle");
  const addToast = useToastStore((s) => s.addToast);

  if (items.length === 0 && status !== "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
        <p className="text-sm">Tu carrito está vacío. Agregá productos para continuar.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
        <h1 className="mb-2 text-xl font-semibold">¡Pedido realizado!</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Te redirigimos a Mercado Pago para completar el pago. Una vez aprobado, coordinamos la entrega.
        </p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    setLoading(true);
    try {
      const outOfStock = items.filter((i) => i.quantity > i.product.stock);
      if (outOfStock.length > 0) {
        const names = outOfStock.map((i) => i.product.name).join(", ");
        addToast({
          message: `Stock insuficiente para: ${names}. Revisá tu carrito.`,
          type: "error",
          duration: 4000,
        });
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          customerEmail: user.email,
          customerName: user.displayName || user.email || "Cliente",
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          total: totalPrice,
          paymentMethod: "mercadopago",
          deliveryMethod: delivery,
          deliveryDetails,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const prefRes = await fetch("/api/payment/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            title: i.product.name,
            unit_price: i.product.price,
            quantity: i.quantity,
          })),
          orderId: orderData.order.id,
          payer: { name: user.displayName || "", email: user.email || "" },
        }),
      });
      const prefData = await prefRes.json();
      if (!prefRes.ok) throw new Error(prefData.error || "Failed to create preference");

      clearCart();
      setStatus("success");
      if (prefData.initPoint) {
        window.location.href = prefData.initPoint;
      } else if (prefData.sandboxInitPoint) {
        window.location.href = prefData.sandboxInitPoint;
      }
    } catch (error) {
      console.error(error);
      setStatus("failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Carrito", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Finalizar compra</h1>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Productos</h2>
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {product.name} x {quantity}
              </span>
              <span>${(product.price * quantity).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span>${totalPrice.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Método de entrega</h2>
        <DeliverySelector value={delivery} onChange={setDelivery} />
        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted-foreground">Detalles / preferencia de horario</label>
          <input
            type="text"
            value={deliveryDetails}
            onChange={(e) => setDeliveryDetails(e.target.value)}
            placeholder={delivery === "sarmiento" ? "¿Qué estación de la línea Sarmiento?" : "Horario preferido de retiro"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
        </div>
      </div>

      {status === "failure" && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          style={{ animation: "fadeIn 150ms var(--ease-out)" }}
        >
          <AlertCircle className="h-4 w-4" />
          Hubo un error al procesar el pedido. Intentá de nuevo.
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97] disabled:opacity-60"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {loading ? "Procesando..." : (
          <>
            Pagar con Mercado Pago <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
