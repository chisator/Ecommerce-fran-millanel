"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Order, OrderStatus } from "@/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo",
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

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // Note: Firestore requires a composite index for where+orderBy.
    // We sort client-side to avoid the index requirement during dev.
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

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
        className="mb-10 mt-8 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight"
        style={{ animation: "fadeInUp 500ms var(--ease-out) 50ms both" }}
      >
        Mis pedidos
      </h1>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-200 hover:shadow-sm"
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
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
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
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Pago
                    </h3>
                    <p className="text-sm text-foreground capitalize">
                      {order.paymentMethod === "mercadopago" ? "Mercado Pago" : order.paymentMethod}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.paymentStatus === "approved"
                        ? "Aprobado"
                        : order.paymentStatus === "rejected"
                        ? "Rechazado"
                        : order.paymentStatus === "refunded"
                        ? "Reembolsado"
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
