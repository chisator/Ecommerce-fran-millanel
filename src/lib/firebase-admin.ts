import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp() {
  if (!app) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("Missing Firebase Admin credentials");
    }
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  return app;
}

export function getAdminAuth() {
  return getApp().auth();
}

export function getAdminDb() {
  return getApp().firestore();
}
