"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield } from "lucide-react";
import { SiteConfig, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const iconComponents: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="mb-5 h-5 w-5 text-primary" strokeWidth={1.5} />,
  truck: <Truck className="mb-5 h-5 w-5 text-primary" strokeWidth={1.5} />,
  shield: <Shield className="mb-5 h-5 w-5 text-primary" strokeWidth={1.5} />,
};

const defaultConfig: SiteConfig = {
  id: "default",
  heroTitle: "Belleza que se siente",
  heroSubtitle: "Fórmulas simples, resultados reales. Diseñado para quienes aprecian lo esencial.",
  heroLabel: "Cosméticos Millanel",
  ctaTitle: "Encontrá tu ritual",
  ctaSubtitle: "Descubrí toda la línea de productos Millanel y elegí el que va con vos.",
  aboutText: "En Millanel creemos que la verdadera belleza reside en la simplicidad. Cada producto está formulado con ingredientes efectivos, sin excesos, para que tu rutina sea pura y eficiente.",
  featuredProductIds: [],
  values: [
    { icon: "sparkles", title: "Calidad simple", desc: "Ingredientes efectivos sin excesos. Menos es más." },
    { icon: "truck", title: "Envío flexible", desc: "Retiro en sucursal o punto en la línea Sarmiento." },
    { icon: "shield", title: "Pago seguro", desc: "Procesado por Mercado Pago con protección total." },
  ],
  categories: [
    { name: "Cuidado facial" },
    { name: "Maquillaje" },
    { name: "Accesorios" },
  ],
};

export default function HomePage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch site config (single read, no listener)
        const configSnap = await getDocs(collection(db, "siteConfig"));
        let siteConfig = defaultConfig;
        if (!configSnap.empty) {
          const doc = configSnap.docs[0];
          siteConfig = { id: doc.id, ...doc.data() } as SiteConfig;
          setConfig(siteConfig);
        }

        // Fetch featured products
        const ids = siteConfig.featuredProductIds || [];
        if (ids.length > 0) {
          const products: Product[] = [];
          for (const id of ids) {
            try {
              const snap = await getDocs(query(collection(db, "products"), where("__name__", "==", id), where("isActive", "==", true)));
              snap.forEach((doc) => {
                if (doc.exists()) products.push({ id: doc.id, ...doc.data() } as Product);
              });
            } catch {
              // Skip if product not found
            }
          }
          setFeaturedProducts(products);
        } else {
          // Fallback: latest 4 active products (no orderBy to avoid index)
          const snap = await getDocs(query(collection(db, "products"), where("isActive", "==", true), limit(8)));
          const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
          // Sort client-side
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setFeaturedProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Home data fetch error:", error);
        // Use defaults on error
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Editorial Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center md:py-40 grain-overlay">
        <p
          className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          style={{ animation: "fadeInUp 700ms var(--ease-out) 100ms both" }}
        >
          {config.heroLabel || "Cosméticos Millanel"}
        </p>
        <h1
          className="mb-6 max-w-4xl font-[family-name:var(--font-heading)] text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
          style={{ animation: "fadeInUp 800ms var(--ease-out) 250ms both" }}
        >
          {config.heroTitle || "Belleza que se siente"}
        </h1>
        <p
          className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ animation: "fadeInUp 800ms var(--ease-out) 400ms both" }}
        >
          {config.heroSubtitle || "Fórmulas simples, resultados reales."}
        </p>
        <Link
          href="/shop"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
          style={{
            transitionTimingFunction: "var(--ease-out)",
            animation: "fadeInUp 700ms var(--ease-out) 550ms both",
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
              animation: "shimmer 2.5s cubic-bezier(0.23, 1, 0.32, 1) infinite",
            }}
          />
          <span className="relative z-10 tracking-wide">Ver tienda</span>
          <ArrowRight
            className="relative z-10 h-4 w-4"
            style={{ animation: "arrowNudge 2s cubic-bezier(0.23, 1, 0.32, 1) infinite" }}
          />
        </Link>
      </section>

      {/* Featured Products */}
      {(featuredProducts.length > 0 || loading) && (
        <section className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="mb-12">
            <span
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.25em] text-primary"
              style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}
            >
              Destacados
            </span>
            <h2
              className="font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight md:text-4xl"
              style={{ animation: "fadeInUp 600ms var(--ease-out) 100ms both" }}
            >
              Productos elegidos
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square rounded-2xl bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Asymmetric Editorial Split */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div
            className="space-y-6"
            style={{ animation: "fadeInLeft 700ms var(--ease-out) both" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Nuestra filosofía
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.15] tracking-tight md:text-5xl">
              Menos es más
            </h2>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              {config.aboutText || defaultConfig.aboutText}
            </p>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-primary"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Explorar productos
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" style={{ transitionTimingFunction: "var(--ease-out)" }} />
            </Link>
          </div>
          <div
            className="relative aspect-square overflow-hidden rounded-2xl bg-muted max-h-[500px]"
            style={{ animation: "cardIn 800ms var(--ease-out) 150ms both" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-7xl font-medium text-muted-foreground/20 md:text-9xl">
                F
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.25em] text-primary"
              style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}
            >
              Colecciones
            </span>
            <h2
              className="font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight md:text-4xl"
              style={{ animation: "fadeInUp 600ms var(--ease-out) 100ms both" }}
            >
              Explorá por categoría
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(config.categories || defaultConfig.categories || []).map((cat, index) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg active:scale-[0.98] md:aspect-[3/4]"
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: `cardIn 500ms var(--ease-out) ${index * 100}ms both`,
              }}
            >
              {cat.image ? (
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              )}
              <div className="relative z-10 p-8">
                <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/60">
                  0{index + 1}
                </span>
                <h3 className="mb-4 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-tight text-white">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors duration-200 group-hover:text-white">
                  <span>Descubrir</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" style={{ transitionTimingFunction: "var(--ease-out)" }} />
                </div>
              </div>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" style={{ transitionTimingFunction: "var(--ease-out)" }} />
            </Link>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          {(config.values || defaultConfig.values || []).map((item, index) => (
            <div
              key={item.title}
              className="bg-background p-8 transition-colors duration-300 hover:bg-secondary/50"
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: `fadeInUp 500ms var(--ease-out) ${200 + index * 100}ms both`,
              }}
            >
              {iconComponents[item.icon] || iconComponents.sparkles}
              <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center md:px-16 md:py-28 grain-overlay">
          <div className="relative z-10">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
              style={{ animation: "fadeInUp 600ms var(--ease-out) both" }}
            >
              Nuestra tienda
            </p>
            <h2
              className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight text-background md:text-5xl"
              style={{ animation: "fadeInUp 700ms var(--ease-out) 100ms both" }}
            >
              {config.ctaTitle || "Encontrá tu ritual"}
            </h2>
            <p
              className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-background/60 md:text-base"
              style={{ animation: "fadeInUp 700ms var(--ease-out) 200ms both" }}
            >
              {config.ctaSubtitle || "Descubrí toda la línea de productos Millanel."}
            </p>
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-background px-8 py-4 text-sm font-semibold text-foreground transition-transform duration-[160ms] active:scale-[0.97]"
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: "fadeInUp 600ms var(--ease-out) 350ms both",
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
                  animation: "shimmer 2.5s cubic-bezier(0.23, 1, 0.32, 1) infinite",
                }}
              />
              <span className="relative z-10 tracking-wide">Ver tienda</span>
              <ArrowRight
                className="relative z-10 h-4 w-4"
                style={{ animation: "arrowNudge 2s cubic-bezier(0.23, 1, 0.32, 1) infinite" }}
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
