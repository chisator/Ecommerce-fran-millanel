"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { Package, ShoppingCart, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/products?active=false", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData.orders || []);
        setProductsCount(productsData.products?.length || 0);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    }
    fetchData();
  }, [user]);

  const totalSales = orders.filter((o) => o.paymentStatus === "approved").reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Productos", value: productsCount, icon: Package },
          { label: "Pedidos", value: orders.length, icon: ShoppingCart },
          { label: "Ventas", value: `$${totalSales.toLocaleString("es-AR")}`, icon: DollarSign },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-sm"
            style={{
              transitionTimingFunction: "var(--ease-out)",
              animation: `cardIn 250ms var(--ease-out) ${index * 60}ms both`,
            }}
          >
            <div className="flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Pedidos recientes</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pedidos todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-normal">ID</th>
                  <th className="pb-2 pr-4 font-normal">Cliente</th>
                  <th className="pb-2 pr-4 font-normal">Total</th>
                  <th className="pb-2 pr-4 font-normal">Estado</th>
                  <th className="pb-2 font-normal">Pago</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/30"
                    style={{
                      transitionTimingFunction: "var(--ease-out)",
                      animation: `rowIn 200ms var(--ease-out) ${index * 30}ms both`,
                    }}
                  >
                    <td className="py-2 pr-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="py-2 pr-4">{order.customerName}</td>
                    <td className="py-2 pr-4">${order.total.toLocaleString("es-AR")}</td>
                    <td className="py-2 pr-4 capitalize">{order.status}</td>
                    <td className="py-2 capitalize">{order.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
