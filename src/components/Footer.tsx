import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="space-y-4">
            <span className="font-[family-name:var(--font-heading)] text-xl font-medium tracking-wide">
              Millanel
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Cosméticos pensados para quienes valoran la calidad y la simplicidad.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link
              href="/shop"
              className="transition-colors duration-200 hover:text-foreground"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Tienda
            </Link>
            <Link
              href="/cart"
              className="transition-colors duration-200 hover:text-foreground"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Carrito
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Millanel Cosméticos.
        </div>
      </div>
    </footer>
  );
}
