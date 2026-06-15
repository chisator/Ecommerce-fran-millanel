"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Order, OrderStatus } from "@/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronDown, ChevronUp, XCircle, CreditCard, Truck, Clock } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo para entregar",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  preparing: "bg-sky-50 text-sky-800 border-sky-200",
  ready: "bg-violet-50 text-violet-800 border-violet-200",
  completed: "bg-stone-100 text-stone-700 border-stone-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />,
  paid: <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />,
  preparing: <Package className="h-3.5 w-3.5" strokeWidth={1.5} />,
  ready: <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />,
  completed: <Package className="h-3.5 w-3.5" strokeWidth={1.5} />,
  cancelled: <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />,
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "unpaid">("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "paid") return o.paymentStatus === "approved" || o.status === "paid" || o.status === "preparing" || o.status === "ready" || o.status === "completed";
    if (activeFilter === "unpaid") return o.paymentStatus !== "approved" && o.status !== "paid" && o.status !== "preparing" && o.status !== "ready" && o.status !== "completed";
    return true;
  });

  const paidCount = orders.filter((o) => o.paymentStatus === "approved" || o.status === "paid" || o.status === "preparing" || o.status === "ready" || o.status === "completed").length;
  const unpaidCount = orders.length - paidCount;

  const cancelOrder = async (orderId: string) => {
    if (!user) return;
    if (!confirm("¿Cancelar este pedido?")) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: orderId, status: "cancelled", paymentStatus: "rejected" }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
    } catch (error) {
      console.error("Cancel error:", error);
      alert("No se pudo cancelar el pedido");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
        <Package className="mb-6 h-14 w-14 text-muted-foreground/30" strokeWidth={1} />
        <h1 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-tight">
          Iniciá sesión
        </h1>
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Para ver tus pedidos necesitás iniciar sesión.
        </p>
        <Link
          href="/login?redirect=/orders"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <span className="relative z-10 tracking-wide">Ingresar</span>
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
        <Package className="mb-6 h-14 w-14 text-muted-foreground/30" strokeWidth={1} />
        <h1 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-tight">
          Sin pedidos aún
        </h1>
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Todavía no realizaste ningún pedido.
        </p>
        <Link
          href="/shop"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <span className="relative z-10 tracking-wide">Ver tienda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}>
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Mis pedidos" }]} />
      </div>
      <h1
        className="mb-6 mt-8 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight"
        style={{ animation: "fadeInUp 500ms var(--ease-out) 50ms both" }}
      >
        Mis pedidos
      </h1>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2" style={{ animation: "fadeInUp 500ms var(--ease-out) 100ms both" }}>
        {[
          { key: "all" as const, label: `Todos (${orders.length})` },
          { key: "paid" as const, label: `Pagados (${paidCount})` },
          { key: "unpaid" as const, label: `Sin pagar (${unpaidCount})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
              activeFilter === f.key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          const isPaid = order.paymentStatus === "approved" || order.status === "paid" || order.status === "preparing" || order.status === "ready" || order.status === "completed";
          const isPending = order.status === "pending" && order.paymentStatus !== "approved";
          return (
            <div
              key={order.id}
              className={`overflow-hidden rounded-2xl border bg-card transition-shadow duration-200 hover:shadow-sm ${
                isPending ? "border-amber-300" : "border-border"
              }`}
              style={{
                animation: `fadeInUp 400ms var(--ease-out) ${index * 80}ms both`,
                transitionTimingFunction: "var(--ease-out)",
              }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido</p>
                    <p className="font-medium tracking-tight">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-sm text-foreground">
                      {new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-medium">
                      ${order.total.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                    >
                      {statusIcons[order.status]}
                      {statusLabels[order.status]}
                    </span>
                    {isPending && (
                      <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                        Esperando pago
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>

              {isExpanded && (
                <div
                  className="border-t border-border px-6 py-5"
                  style={{ animation: "fadeInUp 300ms var(--ease-out) forwards" }}
                >
                  <div className="mb-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Productos
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} x ${item.price.toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Entrega
                    </h3>
                    <p className="text-sm text-foreground">
                      {order.deliveryMethod === "pickup" ? "Retiro en punto" : "Línea Sarmiento"}
                    </p>
                    {order.deliveryDetails && (
                      <p className="text-sm text-muted-foreground">{order.deliveryDetails}</p>
                    )}
                  </div>
                  <div className="mb-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Pago
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground capitalize">
                        {order.paymentMethod === "mercadopago" ? "Mercado Pago" : order.paymentMethod}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isPaid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.paymentStatus === "rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {isPaid ? "PAGADO" : order.paymentStatus === "rejected" ? "RECHAZADO" : "PENDIENTE"}
                      </span>
                    </div>
                  </div>

                  {/* Actions for pending orders */}
                  {isPending && (
                    <div className="flex gap-3 pt-2">
                      <Link
                        href="/cart"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Pagar ahora
                      </Link>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
