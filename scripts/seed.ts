import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getAdminDb } from "../src/lib/firebase-admin";

const products = [
  {
    name: "Crema Hidratante Millanel",
    description: "Crema facial hidratante de rápida absorción. Ideal para uso diario. Deja la piel suave, luminosa y protegida. Formulada con ácido hialurónico y vitamina E.",
    price: 12500,
    stock: 15,
    category: "Cuidado facial",
    images: ["https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600&auto=format&fit=crop&q=60"],
    isActive: true,
  },
  {
    name: "Serum Antioxidante",
    description: "Serum concentrado con vitamina C y extractos naturales. Combate los signos del envejecimiento y devuelve la luminosidad a tu piel.",
    price: 18900,
    stock: 8,
    category: "Cuidado facial",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=60"],
    isActive: true,
  },
  {
    name: "Bálsamo Labial Natural",
    description: "Hidratación intensa para tus labios. Fórmula 100% natural con manteca de karité y aceite de coco.",
    price: 4200,
    stock: 30,
    category: "Cuidado facial",
    images: ["https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&auto=format&fit=crop&q=60"],
    isActive: true,
  },
  {
    name: "Labial Matte Nude",
    description: "Labial de larga duración con acabado matte. Tonos nude que realzan tu look natural sin resecar.",
    price: 9800,
    stock: 12,
    category: "Maquillaje",
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=60"],
    isActive: true,
  },
  {
    name: "Brocha Kabuki",
    description: "Brocha de alta calidad para aplicación uniforme de base y polvos. Cerdas sintéticas ultra suaves.",
    price: 7500,
    stock: 20,
    category: "Accesorios",
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600&auto=format&fit=crop&q=60"],
    isActive: true,
  },
];

async function seed() {
  const db = getAdminDb();
  const batch = db.batch();

  for (const p of products) {
    const ref = db.collection("products").doc();
    batch.set(ref, {
      id: ref.id,
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`Preparando producto: ${p.name} (${ref.id})`);
  }

  await batch.commit();
  console.log(`✅ Se insertaron ${products.length} productos de prueba en Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
