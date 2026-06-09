import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Truck, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center md:py-40 grain-overlay">
        <p
          className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          style={{ animation: "fadeInUp 700ms var(--ease-out) 100ms both" }}
        >
          Cosméticos Millanel
        </p>
        <h1
          className="mb-6 max-w-4xl font-[family-name:var(--font-heading)] text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
          style={{ animation: "fadeInUp 800ms var(--ease-out) 250ms both" }}
        >
          Belleza que se siente
        </h1>
        <p
          className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ animation: "fadeInUp 800ms var(--ease-out) 400ms both" }}
        >
          Fórmulas simples, resultados reales. Diseñado para quienes aprecian lo esencial.
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
              En Millanel creemos que la verdadera belleza reside en la simplicidad. 
              Cada producto está formulado con ingredientes efectivos, sin excesos, 
              para que tu rutina sea pura y eficiente.
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
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted md:aspect-square"
            style={{ animation: "cardIn 800ms var(--ease-out) 150ms both" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-7xl font-medium text-muted-foreground/20 md:text-9xl">
                M
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories — Horizontal editorial */}
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
          {["Cuidado facial", "Maquillaje", "Accesorios"].map((cat, index) => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg active:scale-[0.98] md:aspect-[3/4]"
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: `cardIn 500ms var(--ease-out) ${index * 100}ms both`,
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                0{index + 1}
              </span>
              <div className="space-y-4">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-medium tracking-tight">
                  {cat}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary">
                  <span>Descubrir</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" style={{ transitionTimingFunction: "var(--ease-out)" }} />
                </div>
              </div>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" style={{ transitionTimingFunction: "var(--ease-out)" }} />
            </Link>
          ))}
        </div>
      </section>

      {/* Values — Editorial grid */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Calidad simple", desc: "Ingredientes efectivos sin excesos. Menos es más." },
            { icon: Truck, title: "Envío flexible", desc: "Retiro en sucursal o punto en la línea Sarmiento." },
            { icon: Shield, title: "Pago seguro", desc: "Procesado por Mercado Pago con protección total." },
          ].map((item, index) => (
            <div
              key={item.title}
              className="bg-background p-8 transition-colors duration-300 hover:bg-secondary/50"
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: `fadeInUp 500ms var(--ease-out) ${200 + index * 100}ms both`,
              }}
            >
              <item.icon className="mb-5 h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — Dark luxury section */}
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
              Encontrá tu ritual
            </h2>
            <p
              className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-background/60 md:text-base"
              style={{ animation: "fadeInUp 700ms var(--ease-out) 200ms both" }}
            >
              Descubrí toda la línea de productos Millanel y elegí el que va con vos.
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
