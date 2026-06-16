import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { SiteConfig } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snap = await getAdminDb().collection("siteConfig").limit(1).get();
    if (snap.empty) {
      // Return default config
      const defaultConfig: SiteConfig = {
        id: "default",
        heroTitle: "Belleza que se siente",
        heroSubtitle: "Fórmulas simples, resultados reales. Diseñado para quienes aprecian lo esencial.",
        heroLabel: "Cosméticos Millanel",
        ctaTitle: "Encontrá tu ritual",
        ctaSubtitle: "Descubrí toda la línea de productos Millanel y elegí el que va con vos.",
        aboutText: "En Millanel creemos que la verdadera belleza reside en la simplicidad. Cada producto está formulado con ingredientes efectivos, sin excesos, para que tu rutina sea pura y eficiente.",
        featuredProductIds: [],
        values: [
          { icon: "sparkles", title: "Calidad simple", desc: "Ingredientes efectivos sin excesos. Menos es más." },
          { icon: "truck", title: "Envío flexible", desc: "Retiro en sucursal o punto en la línea Sarmiento." },
          { icon: "shield", title: "Pago seguro", desc: "Procesado por Mercado Pago con protección total." },
        ],
      };
      return NextResponse.json({ config: defaultConfig });
    }
    const doc = snap.docs[0];
    return NextResponse.json({ config: { id: doc.id, ...doc.data() } as SiteConfig });
  } catch (error) {
    console.error("Error fetching site config:", error);
    return NextResponse.json({ error: "Failed to fetch site config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    const collection = getAdminDb().collection("siteConfig");
    let ref;
    if (id && id !== "default") {
      ref = collection.doc(id);
    } else {
      // Get existing or create new
      const snap = await collection.limit(1).get();
      if (snap.empty) {
        ref = collection.doc();
      } else {
        ref = snap.docs[0].ref;
      }
    }

    await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const updated = await ref.get();
    return NextResponse.json({ config: { id: updated.id, ...updated.data() } as SiteConfig });
  } catch (error) {
    console.error("Error updating site config:", error);
    return NextResponse.json({ error: "Failed to update site config" }, { status: 500 });
  }
}
