"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SiteConfig, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, Truck, Shield, CheckCircle, X, Search, GripVertical } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
  truck: <Truck className="h-5 w-5" strokeWidth={1.5} />,
  shield: <Shield className="h-5 w-5" strokeWidth={1.5} />,
};

export default function AdminSitePage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [configRes, productsRes] = await Promise.all([
          fetch("/api/site-config", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/products?active=false", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const configData = await configRes.json();
        const productsData = await productsRes.json();
        setConfig(configData.config);
        setProducts(productsData.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !config) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedProduct = (productId: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const ids = prev.featuredProductIds || [];
      if (ids.includes(productId)) {
        return { ...prev, featuredProductIds: ids.filter((id) => id !== productId) };
      }
      if (ids.length >= 4) {
        alert("Máximo 4 productos destacados");
        return prev;
      }
      return { ...prev, featuredProductIds: [...ids, productId] };
    });
  };

  const updateValue = (index: number, field: string, value: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const values = [...(prev.values || [])];
      values[index] = { ...values[index], [field]: value };
      return { ...prev, values };
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  if (!config) {
    return <div className="text-sm text-muted-foreground">Error al cargar la configuración.</div>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight">Configuración del sitio</h1>

      {/* Hero Section */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Hero (página principal)</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Etiqueta superior</label>
            <input
              value={config.heroLabel || ""}
              onChange={(e) => setConfig({ ...config, heroLabel: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="Cosméticos Millanel"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Título principal</label>
            <input
              value={config.heroTitle || ""}
              onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="Belleza que se siente"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Subtítulo</label>
            <textarea
              value={config.heroSubtitle || ""}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="Fórmulas simples, resultados reales..."
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Productos destacados</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Seleccioná hasta 4 productos que aparecerán destacados en la home. Si no seleccionás ninguno, se mostrarán los más recientes.
        </p>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => {
            const isSelected = (config.featuredProductIds || []).includes(product.id);
            return (
              <button
                key={product.id}
                onClick={() => toggleFeaturedProduct(product.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border">
                  {isSelected && <CheckCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">${product.price.toLocaleString("es-AR")} · {product.category}</p>
                </div>
              </button>
            );
          })}
        </div>

        {(config.featuredProductIds || []).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium">{config.featuredProductIds!.length} seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {config.featuredProductIds!.map((id) => {
                const p = products.find((prod) => prod.id === id);
                if (!p) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs"
                  >
                    {p.name}
                    <button onClick={() => toggleFeaturedProduct(id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Sección "Sobre nosotros"</h2>
        <div>
          <label className="mb-1 block text-xs font-medium">Texto</label>
          <textarea
            value={config.aboutText || ""}
            onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            placeholder="En Millanel creemos que..."
          />
        </div>
      </section>

      {/* Values */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Valores / Beneficios</h2>
        <div className="space-y-4">
          {(config.values || []).map((value, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <div className="mt-0.5 text-primary">{iconMap[value.icon] || <Sparkles className="h-5 w-5" />}</div>
              <div className="flex-1 space-y-2">
                <input
                  value={value.title}
                  onChange={(e) => updateValue(index, "title", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  placeholder="Título"
                />
                <input
                  value={value.desc}
                  onChange={(e) => updateValue(index, "desc", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  placeholder="Descripción"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Sección CTA (llamada a la acción)</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Título</label>
            <input
              value={config.ctaTitle || ""}
              onChange={(e) => setConfig({ ...config, ctaTitle: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="Encontrá tu ritual"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Subtítulo</label>
            <textarea
              value={config.ctaSubtitle || ""}
              onChange={(e) => setConfig({ ...config, ctaSubtitle: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="Descubrí toda la línea..."
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-medium">Contacto y redes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Email de contacto</label>
            <input
              value={config.contactEmail || ""}
              onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="contacto@francosmeticos.com.ar"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Teléfono</label>
            <input
              value={config.contactPhone || ""}
              onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="+54 9 11 1234 5678"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium">URL de Instagram</label>
            <input
              value={config.instagramUrl || ""}
              onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
              placeholder="https://instagram.com/tu_cuenta"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="sticky bottom-6 flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-lg">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97] disabled:opacity-60"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {saved && (
          <span className="text-xs text-green-600" style={{ animation: "fadeIn 150ms var(--ease-out)" }}>
            <CheckCircle className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
            Guardado correctamente.
          </span>
        )}
      </div>
    </div>
  );
}
