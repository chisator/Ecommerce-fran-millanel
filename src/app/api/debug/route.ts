import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
  const hasFirebaseKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const hasMpToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN;

  return NextResponse.json({
    cloudinary: {
      hasCloudName,
      hasApiKey,
      hasApiSecret,
      cloudNameValue: hasCloudName ? process.env.CLOUDINARY_CLOUD_NAME?.slice(0, 5) + "..." : null,
    },
    firebase: { hasFirebaseKey },
    mercadopago: { hasMpToken },
    nodeEnv: process.env.NODE_ENV,
  });
}
