"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let q = query(collection(db, "products"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Debounce search input to URL
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("q", searchInput.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/shop?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, category, searchQuery, sort]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchInput("");
    router.replace("/shop", { scroll: false });
  };

  const activeFiltersCount = (category ? 1 : 0) + (searchQuery ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  const breadcrumbItems = category
    ? [
        { label: "Inicio", href: "/" },
        { label: "Tienda", href: "/shop" },
        { label: category },
      ]
    : [
        { label: "Inicio", href: "/" },
        { label: "Tienda" },
      ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div
        className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        style={{ animation: "fadeInUp 500ms var(--ease-out) 50ms both" }}
      >
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-medium tracking-tight">
            {category || "Todos los productos"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-48 rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1 sm:w-64"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
              showFilters || activeFiltersCount > 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted"
            } active:scale-[0.97]`}
            style={{ transitionTimingFunction: "var(--ease-out)", transitionDuration: "160ms" }}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5"
          style={{ animation: "fadeInUp 300ms var(--ease-out) forwards" }}
        >
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Categoría</span>
            <button
              onClick={() => setParam("category", "")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                !category ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setParam("category", cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  category === cat ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden h-6 w-px bg-border md:block" />

          {/* Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Ordenar</span>
            {[
              { value: "newest", label: "Más recientes" },
              { value: "price-asc", label: "Menor precio" },
              { value: "price-desc", label: "Mayor precio" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParam("sort", opt.value)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  sort === opt.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                {sort === opt.value && <ArrowUpDown className="h-3 w-3" strokeWidth={1.5} />}
                {opt.label}
              </button>
            ))}
          </div>

          {activeFiltersCount > 0 && (
            <>
              <div className="hidden h-6 w-px bg-border md:block" />
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          className="mt-16 flex flex-col items-center justify-center py-24 text-center"
          style={{ animation: "fadeInUp 500ms var(--ease-out) both" }}
        >
          <Search className="mb-4 h-12 w-12 text-muted-foreground/20" strokeWidth={1} />
          <p className="mb-2 text-base font-medium">No se encontraron productos</p>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Probá cambiando los filtros o la búsqueda.
          </p>
          <button
            onClick={clearFilters}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-[160ms] active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <span className="relative z-10 tracking-wide">Ver todos</span>
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-12 text-sm text-muted-foreground">
          Cargando tienda...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
