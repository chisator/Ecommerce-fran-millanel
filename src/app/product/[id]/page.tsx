"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const unsub = onSnapshot(doc(db, "products", id), (snap) => {
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const images = product?.images || [];
  const hasMultipleImages = images.length > 1;

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, images.length]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Skeleton className="mb-8 h-4 w-32" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">Producto no encontrado.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-primary"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/shop" },
    {
      label: product.category,
      href: `/shop?category=${encodeURIComponent(product.category)}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div style={{ animation: "fadeInUp 600ms var(--ease-out) both" }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Image Gallery */}
          <div
            className="space-y-4"
            style={{ animation: "fadeInUp 700ms var(--ease-out) 100ms both" }}
          >
            <div
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-muted max-h-[500px]"
              onClick={() => images.length > 0 && setLightboxOpen(true)}
            >
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted transition-all duration-200 ${
                      selectedImage === idx
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div
            className="flex flex-col pt-4 md:pt-12"
            style={{ animation: "fadeInUp 700ms var(--ease-out) 200ms both" }}
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {product.category}
            </span>
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl">
              {product.name}
            </h1>
            <p className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-medium text-foreground md:text-4xl">
              ${product.price.toLocaleString("es-AR")}
            </p>

            <div className="mb-8 border-t border-border pt-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Descripción
              </h3>
              <p className="max-w-md leading-[1.8] text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
            </div>

            <div className="mt-auto">
              {product.stock > 0 ? (
                <AddToCartButton product={product} />
              ) : (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-6 py-3.5 text-sm font-medium text-muted-foreground"
                >
                  Sin stock
                </button>
              )}
            </div>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Volver a la tienda
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
          style={{ animation: "fadeIn 200ms var(--ease-out) forwards" }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-6 top-6 rounded-full p-2 text-white/70 transition-colors duration-200 hover:text-white"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>

          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 active:scale-[0.95]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 active:scale-[0.95]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            className="relative mx-16 aspect-square w-full max-w-3xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "modalIn 300ms var(--ease-out) forwards" }}
          >
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {hasMultipleImages && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    selectedImage === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
