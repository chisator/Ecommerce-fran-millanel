"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { Package, CreditCard, CheckCircle, XCircle, Clock, Search } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  preparing: "bg-sky-50 text-sky-800 border-sky-200",
  ready: "bg-violet-50 text-violet-800 border-violet-200",
  completed: "bg-stone-100 text-stone-700 border-stone-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

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

  async function updatePaymentStatus(id: string, paymentStatus: string) {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, paymentStatus }),
    });
    fetchOrders();
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.paymentStatus === "approved").length,
    pending: orders.filter((o) => o.paymentStatus === "pending").length,
    rejected: orders.filter((o) => o.paymentStatus === "rejected").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors duration-200 hover:bg-muted"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total", value: stats.total, icon: Package, color: "bg-muted" },
          { label: "Pagados", value: stats.paid, icon: CreditCard, color: "bg-emerald-50 text-emerald-800" },
          { label: "Sin pagar", value: stats.pending, icon: Clock, color: "bg-amber-50 text-amber-800" },
          { label: "Rechazados", value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-800" },
          { label: "Preparando", value: stats.preparing, icon: Package, color: "bg-sky-50 text-sky-800" },
          { label: "Completados", value: stats.completed, icon: CheckCircle, color: "bg-stone-100 text-stone-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border border-border p-3 ${stat.color}`}>
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, email o ID..."
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="preparing">Preparando</option>
            <option value="ready">Listo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none"
          >
            <option value="all">Todos los pagos</option>
            <option value="approved">Pagados</option>
            <option value="pending">Sin pagar</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay pedidos que coincidan con los filtros.</p>
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
                <th className="px-4 py-3 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, index) => (
                <tr
                  key={o.id}
                  className={`border-b border-border/50 transition-colors duration-150 hover:bg-muted/30 ${
                    o.paymentStatus === "approved" ? "bg-emerald-50/30" : ""
                  }`}
                  style={{
                    transitionTimingFunction: "var(--ease-out)",
                    animation: `rowIn 200ms var(--ease-out) ${index * 30}ms both`,
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">${o.total.toLocaleString("es-AR")}</td>
                  <td className="px-4 py-3 capitalize">
                    {o.deliveryMethod === "sarmiento" ? "Sarmiento" : "Retiro"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[o.status]}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        o.paymentStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : o.paymentStatus === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {o.paymentStatus === "approved"
                          ? "✓ PAGADO"
                          : o.paymentStatus === "rejected"
                          ? "✗ RECHAZADO"
                          : "○ PENDIENTE"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {o.paymentMethod === "mercadopago" ? "Mercado Pago" : o.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
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
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => updatePaymentStatus(o.id, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none transition-shadow duration-150 focus:ring-1 ring-ring"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <option value="pending">Pago pendiente</option>
                        <option value="approved">Pago aprobado</option>
                        <option value="rejected">Pago rechazado</option>
                        <option value="refunded">Reembolsado</option>
                      </select>
                    </div>
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
