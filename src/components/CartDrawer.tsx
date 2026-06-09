"use client";

import { useCart } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const totalPrice = useCart((s) => s.totalPrice());
  const addToast = useToastStore((s) => s.addToast);

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 200ms var(--ease-out) forwards" }}
      />
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
        style={{
          transformOrigin: "right center",
          animation: "drawerIn 250ms var(--ease-drawer) forwards",
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-medium tracking-tight">
            Carrito
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors duration-200 hover:bg-muted active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-20" strokeWidth={1} />
              <p className="text-sm">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="mt-2 text-sm font-medium transition-opacity duration-200 hover:opacity-70"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(({ product, quantity }, index) => (
                <div
                  key={product.id}
                  className="flex gap-4 pb-6"
                  style={{
                    animation: `fadeInUp 300ms var(--ease-out) ${index * 60}ms both`,
                  }}
                >
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <span className="font-[family-name:var(--font-heading)] text-base font-medium tracking-tight">
                        {product.name}
                      </span>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        ${product.price.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:bg-muted active:scale-[0.93]"
                          style={{ transitionTimingFunction: "var(--ease-out)" }}
                        >
                          <Minus className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-5 text-center text-sm font-medium tabular-nums">{quantity}</span>
                        <button
                          onClick={() => handleIncrease(product.id, quantity, product.stock)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:bg-muted active:scale-[0.93]"
                          style={{ transitionTimingFunction: "var(--ease-out)" }}
                        >
                          <Plus className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
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
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-[family-name:var(--font-heading)] text-2xl font-medium">
                ${totalPrice.toLocaleString("es-AR")}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground py-4 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
