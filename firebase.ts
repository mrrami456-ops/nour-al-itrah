import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

/**
 * Firebase Cloud Configuration & Placeholders Structure
 * Automatically uses provisioned firebase-applet-config.json credentials
 * while exposing clean configuration structure for cloud database connectivity.
 */
export const FIREBASE_CLOUD_CONFIG = {
  apiKey: firebaseConfig.apiKey || 'YOUR_FIREBASE_API_KEY',
  authDomain: firebaseConfig.authDomain || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: firebaseConfig.projectId || 'YOUR_PROJECT_ID',
  storageBucket: firebaseConfig.storageBucket || 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: firebaseConfig.messagingSenderId || 'YOUR_MESSAGING_SENDER_ID',
  appId: firebaseConfig.appId || 'YOUR_APP_ID',
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '(default)',
};

const app = initializeApp(FIREBASE_CLOUD_CONFIG);
export const db = getFirestore(app, FIREBASE_CLOUD_CONFIG.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
