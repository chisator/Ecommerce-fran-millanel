import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary config
    console.log("[Upload] Checking Cloudinary config...");
    console.log("[Upload] CLOUDINARY_CLOUD_NAME exists:", !!process.env.CLOUDINARY_CLOUD_NAME);
    console.log("[Upload] CLOUDINARY_API_KEY exists:", !!process.env.CLOUDINARY_API_KEY);
    console.log("[Upload] CLOUDINARY_API_SECRET exists:", !!process.env.CLOUDINARY_API_SECRET);
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[Upload] Cloudinary env vars missing");
      return NextResponse.json({ error: "Server config error: Cloudinary not configured" }, { status: 500 });
    }

    // Verify admin token
    console.log("[Upload] Verifying token...");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token);
    console.log("[Upload] Token verified for:", decoded.uid);
    
    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[Upload] Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[Upload] File received:", file.name, file.type, file.size);

    // Convert file to base64
    console.log("[Upload] Converting to base64...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    console.log("[Upload] Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "francosmeticos",
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
    });

    console.log("[Upload] Success:", result.secure_url);
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("[Upload] Full error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
