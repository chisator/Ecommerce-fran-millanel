"use client";

import { useState } from "react";

export default function AdminSitePage() {
  const [title, setTitle] = useState("Cosméticos que se sienten bien");
  const [subtitle, setSubtitle] = useState("Descubrí la línea Millanel. Fórmulas simples, resultados reales.");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Configuración del sitio</h1>
      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Título del hero</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Subtítulo del hero</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          Guardar cambios
        </button>
        {saved && (
          <span
            className="ml-2 text-xs text-green-600"
            style={{ animation: "fadeIn 150ms var(--ease-out)" }}
          >
            Guardado.
          </span>
        )}
      </form>
    </div>
  );
}
