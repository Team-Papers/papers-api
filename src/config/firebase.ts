import admin from 'firebase-admin';
import { env } from './env';

// Firebase is optional - only initialize if credentials are provided
const isFirebaseConfigured =
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY;

if (isFirebaseConfigured && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID!,
      clientEmail: env.FIREBASE_CLIENT_EMAIL!,
      privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });
}

// Export null if Firebase is not configured
export const firebaseAuth = isFirebaseConfigured ? admin.auth() : null;
export const firebaseStorage = isFirebaseConfigured ? admin.storage().bucket() : null;
export { isFirebaseConfigured };
export default admin;
