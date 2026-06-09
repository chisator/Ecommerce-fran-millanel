"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastContainer } from "@/components/ToastContainer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}
