"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/components/AuthProvider";
import { DeliverySelector } from "@/components/DeliverySelector";
import { DeliveryMethod } from "@/types";
import { useToastStore } from "@/store/toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArrowRight, CheckCircle, AlertCircle, XCircle, RefreshCw, ShoppingBag } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const totalPrice = useCart((s) => s.totalPrice());

  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failure">("idle");
  const addToast = useToastStore((s) => s.addToast);

  const mpStatus = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const merchantOrderId = searchParams.get("merchant_order_id");

  // Verificar si el pago fue confirmado por webhook mientras el usuario está en MP
  useEffect(() => {
    if (mpStatus === "success" && paymentId) {
      // El pago fue exitoso, limpiar carrito y mostrar confirmación
      clearCart();
      addToast({
        message: "¡Pago confirmado! Tu pedido está en proceso.",
        type: "success",
        duration: 5000,
      });
    } else if (mpStatus === "failure") {
      addToast({
        message: "El pago fue rechazado. Intentá de nuevo o probá con otro método.",
        type: "error",
        duration: 5000,
      });
    } else if (mpStatus === "pending") {
      addToast({
        message: "Pago pendiente. Te avisamos por email cuando se confirme.",
        type: "info",
        duration: 5000,
      });
    }
  }, [mpStatus, paymentId]);

  if (items.length === 0 && !mpStatus) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
        <ShoppingBag className="mb-6 h-14 w-14 text-muted-foreground/30" strokeWidth={1} />
        <h1 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-tight">
          Tu carrito está vacío
        </h1>
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Agregá productos para empezar tu compra.
        </p>
        <Link
          href="/shop"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <span className="relative z-10 tracking-wide">Ver tienda</span>
          <ArrowRight className="relative z-10 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Pago exitoso
  if (mpStatus === "success") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <CheckCircle className="mb-6 h-14 w-14 text-green-600" strokeWidth={1.5} />
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight">
          ¡Pago confirmado!
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Tu pedido fue procesado correctamente. Te contactaremos para coordinar la entrega.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-medium transition-colors duration-200 hover:bg-muted"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  // Pago fallido
  if (mpStatus === "failure") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <XCircle className="mb-6 h-14 w-14 text-red-600" strokeWidth={1.5} />
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight">
          Pago rechazado
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          El pago no pudo ser procesado. Tu carrito sigue intacto, podés intentar de nuevo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar pago
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-medium transition-colors duration-200 hover:bg-muted"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  // Pago pendiente
  if (mpStatus === "pending") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <AlertCircle className="mb-6 h-14 w-14 text-amber-600" strokeWidth={1.5} />
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight">
          Pago pendiente
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (!user.email) {
      addToast({
        message: "Tu cuenta no tiene un email registrado. Actualizá tu perfil.",
        type: "error",
        duration: 4000,
      });
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
          payer: { name: user.displayName || "Cliente", email: user.email },
        }),
      });
      const prefData = await prefRes.json();
      if (!prefRes.ok) throw new Error(prefData.error || "Failed to create preference");

      // NO limpiar el carrito todavía. Solo redirigir a MP.
      // El carrito se limpiará cuando el webhook confirme el pago o cuando vuelva con success.
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
        <p className="text-sm">Cargando checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
