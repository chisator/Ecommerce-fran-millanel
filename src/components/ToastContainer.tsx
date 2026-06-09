"use client";

import { useToastStore } from "@/store/toast";
import Link from "next/link";
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

const icons = {
  info: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const colors = {
  info: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2">
      {toasts.map((toast, index) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md ${colors[toast.type]}`}
            style={{
              transformOrigin: "bottom right",
              animation: `toastIn 180ms cubic-bezier(0.23, 1, 0.32, 1) ${index * 40}ms both`,
            }}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.action && (
                <div className="mt-2">
                  {toast.action.href ? (
                    <Link
                      href={toast.action.href}
                      onClick={() => removeToast(toast.id)}
                      className="inline-flex items-center text-xs font-semibold underline underline-offset-2 transition-opacity duration-150 hover:opacity-70"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      {toast.action.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        toast.action?.onClick?.();
                        removeToast(toast.id);
                      }}
                      className="text-xs font-semibold underline underline-offset-2 transition-opacity duration-150 hover:opacity-70"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 transition-colors duration-150 hover:bg-black/5 active:scale-[0.93]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
