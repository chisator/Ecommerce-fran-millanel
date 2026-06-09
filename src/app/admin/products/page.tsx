"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    images: [],
    isActive: true,
  });

  async function fetchProducts() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/products?active=false", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, stock: 0, category: "", images: [], isActive: true });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...product });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const token = await user.getIdToken();
    const isEdit = !!editing;
    const url = "/api/products";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(isEdit ? { id: editing.id, ...form } : form),
    });
    if (res.ok) {
      setModalOpen(false);
      fetchProducts();
    } else {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("¿Eliminar producto?")) return;
    const token = await user.getIdToken();
    await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-normal">Nombre</th>
                <th className="px-4 py-3 font-normal">Precio</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal">Categoría</th>
                <th className="px-4 py-3 font-normal">Estado</th>
                <th className="px-4 py-3 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/30"
                  style={{
                    transitionTimingFunction: "var(--ease-out)",
                    animation: `rowIn 200ms var(--ease-out) ${index * 30}ms both`,
                  }}
                >
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">${p.price.toLocaleString("es-AR")}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.isActive ? "Activo" : "Inactivo"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-muted-foreground transition-colors duration-150 hover:text-foreground active:scale-[0.93]"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-muted-foreground transition-colors duration-150 hover:text-destructive active:scale-[0.93]"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            style={{ animation: "fadeIn 150ms var(--ease-out) forwards" }}
          />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl"
            style={{
              transformOrigin: "center",
              animation: "modalIn 200ms var(--ease-out) forwards",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 transition-colors duration-150 hover:bg-muted active:scale-[0.93]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Nombre</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Descripción</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium">Precio</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium">Categoría</label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Imagen URL</label>
                  <input
                    value={form.images?.[0] || ""}
                    onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Activo
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
