"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { useAuth } from "@/components/AuthProvider";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reembolsado",
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [user]);

  async function updateStatus(id: string, status: string) {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Pedidos</h1>
      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay pedidos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-normal">ID</th>
                <th className="px-4 py-3 font-normal">Cliente</th>
                <th className="px-4 py-3 font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Entrega</th>
                <th className="px-4 py-3 font-normal">Estado</th>
                <th className="px-4 py-3 font-normal">Pago</th>
                <th className="px-4 py-3 font-normal">Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, index) => (
                <tr
                  key={o.id}
                  className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/30"
                  style={{
                    transitionTimingFunction: "var(--ease-out)",
                    animation: `rowIn 200ms var(--ease-out) ${index * 30}ms both`,
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">${o.total.toLocaleString("es-AR")}</td>
                  <td className="px-4 py-3 capitalize">{o.deliveryMethod === "sarmiento" ? "Sarmiento" : "Retiro"}</td>
                  <td className="px-4 py-3">{statusLabels[o.status] || o.status}</td>
                  <td className="px-4 py-3">{paymentStatusLabels[o.paymentStatus] || o.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none transition-shadow duration-150 focus:ring-1 ring-ring"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Listo</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
