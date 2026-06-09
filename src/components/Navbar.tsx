"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/store/cart";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Package } from "lucide-react";

export function Navbar() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems());

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-2xl font-medium tracking-wide transition-opacity duration-200 hover:opacity-60"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          Millanel
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/shop"
            className="text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Tienda
          </Link>
          {user ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <Package className="h-4 w-4" strokeWidth={1.5} />
                Mis pedidos
              </Link>
              <Link
                href="/cart"
                className="relative text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span
                    className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground"
                    style={{ animation: "badgePop 200ms var(--ease-out)" }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <User className="inline h-4 w-4" strokeWidth={1.5} /> Ingresar
            </Link>
          )}
        </div>

        <button
          className="md:hidden transition-transform duration-150 active:scale-[0.95]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="border-t border-border px-6 py-6 md:hidden space-y-4 overflow-hidden"
          style={{ animation: "menuDown 200ms var(--ease-out) forwards" }}
        >
          <Link
            href="/shop"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Tienda
          </Link>
          {user ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <Package className="h-4 w-4" strokeWidth={1.5} /> Mis pedidos
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <ShoppingBag className="h-4 w-4" /> Carrito {totalItems > 0 && `(${totalItems})`}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Ingresar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
