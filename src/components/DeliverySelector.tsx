"use client";

import { DeliveryMethod } from "@/types";

interface DeliverySelectorProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
}

export function DeliverySelector({ value, onChange }: DeliverySelectorProps) {
  return (
    <div className="space-y-3">
      <label
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <input
          type="radio"
          name="delivery"
          value="pickup"
          checked={value === "pickup"}
          onChange={(e) => onChange(e.target.value as DeliveryMethod)}
          className="mt-1 h-4 w-4"
        />
        <div>
          <p className="text-sm font-medium">Retiro en sucursal</p>
          <p className="text-xs text-muted-foreground">Retirá personalmente en nuestra dirección.</p>
        </div>
      </label>

      <label
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <input
          type="radio"
          name="delivery"
          value="sarmiento"
          checked={value === "sarmiento"}
          onChange={(e) => onChange(e.target.value as DeliveryMethod)}
          className="mt-1 h-4 w-4"
        />
        <div>
          <p className="text-sm font-medium">Punto de encuentro - Línea Sarmiento</p>
          <p className="text-xs text-muted-foreground">Coordinamos una estación de la línea Sarmiento para el encuentro.</p>
        </div>
      </label>
    </div>
  );
}
