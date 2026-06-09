"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { CartDrawer } from "@/components/CartDrawer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const totalPrice = useCart((s) => s.totalPrice());
  const addToast = useToastStore((s) => s.addToast);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleIncrease = (productId: string, currentQty: number, stock: number) => {
    if (currentQty + 1 > stock) {
      addToast({
        message: `Solo quedan ${stock} unidades disponibles`,
        type: "warning",
        duration: 2500,
      });
      return;
    }
    updateQuantity(productId, currentQty + 1);
  };

  if (items.length === 0) {
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Carrito" }]} />
      <h1
        className="mb-10 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight"
        style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}
      >
        Carrito
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map(({ product, quantity }, index) => (
            <div
              key={product.id}
              className="flex gap-5 border-b border-border pb-6"
              style={{
                animation: `fadeInUp 400ms var(--ease-out) ${index * 80}ms both`,
              }}
            >
              <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                  <Link
                    href={`/product/${product.id}`}
                    className="font-[family-name:var(--font-heading)] text-lg font-medium tracking-tight transition-colors duration-200 hover:text-primary"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${product.price.toLocaleString("es-AR")} c/u
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:bg-muted active:scale-[0.93]"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
                    <button
                      onClick={() => handleIncrease(product.id, quantity, product.stock)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:bg-muted active:scale-[0.93]"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-[family-name:var(--font-heading)] text-lg font-medium">
                      ${(product.price * quantity).toLocaleString("es-AR")}
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-muted-foreground transition-colors duration-200 hover:text-destructive active:scale-[0.93]"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:pl-6">
          <div
            className="sticky top-24 space-y-6 rounded-2xl border border-border bg-card p-8"
            style={{ animation: "fadeInUp 500ms var(--ease-out) 200ms both" }}
          >
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-medium tracking-tight">
              Resumen
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${totalPrice.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span className="font-medium text-foreground">Gratis</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-heading)] text-lg font-medium">Total</span>
                <span className="font-[family-name:var(--font-heading)] text-2xl font-medium">
                  ${totalPrice.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <span
                className="pointer-events-none absolute inset-0 block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                  animation: "shimmer 2.5s cubic-bezier(0.23, 1, 0.32, 1) infinite",
                }}
              />
              <span className="relative z-10 tracking-wide">Continuar</span>
              <ArrowRight
                className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-full border border-border py-3.5 text-sm font-medium transition-colors duration-200 hover:bg-muted active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Editar carrito rápido
            </button>
          </div>
        </div>
      </div>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
