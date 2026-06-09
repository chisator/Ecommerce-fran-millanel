"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <div
      className="group flex flex-col"
      style={{
        animation: `cardIn 500ms var(--ease-out) ${index * 60}ms both`,
      }}
    >
      <Link
        href={`/product/${product.id}`}
        className="relative mb-5 aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        <Link
          href={`/product/${product.id}`}
          className="mb-1 font-[family-name:var(--font-heading)] text-lg font-medium leading-snug tracking-tight transition-colors duration-200 hover:text-primary"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          {product.name}
        </Link>
        <p className="mb-4 text-sm text-muted-foreground">{product.category}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="font-[family-name:var(--font-heading)] text-xl font-medium">
            ${product.price.toLocaleString("es-AR")}
          </span>
          <div className="flex-1">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
