"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const addToast = useToastStore((s) => s.addToast);
  const pathname = usePathname();
  const [pressing, setPressing] = useState(false);

  const cartQty = items.find((i) => i.product.id === product.id)?.quantity || 0;

  const handleClick = () => {
    if (!user) {
      addToast({
        message: "Iniciá sesión para agregar productos al carrito",
        type: "info",
        action: {
          label: "Ingresar",
          href: `/login?redirect=${encodeURIComponent(pathname)}`,
        },
        duration: 5000,
      });
      return;
    }

    if (product.stock <= 0) {
      addToast({
        message: "Este producto no tiene stock disponible",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (cartQty + 1 > product.stock) {
      addToast({
        message: `Solo quedan ${product.stock} unidades disponibles`,
        type: "warning",
        duration: 3000,
      });
      return;
    }

    addItem(product, 1);
    addToast({
      message: `${product.name} se agregó al carrito`,
      type: "success",
      duration: 2000,
    });
  };

  return (
    <button
      onClick={handleClick}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerLeave={() => setPressing(false)}
      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-[160ms]"
      style={{
        transform: pressing ? "scale(0.97)" : "scale(1)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      {/* Shimmer */}
      <span
        className="pointer-events-none absolute inset-0 block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
          animation: "shimmer 2s cubic-bezier(0.23, 1, 0.32, 1) infinite",
        }}
      />
      <ShoppingBag
        className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:scale-110"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      />
      <span className="relative z-10">Agregar</span>
    </button>
  );
}
