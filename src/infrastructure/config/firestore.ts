import {
  AppOptions,
  ServiceAccount,
  cert,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import { getOptionalEnv } from './env';

let firestoreInstance: Firestore | null = null;

const buildServiceAccountFromEnv = (): ServiceAccount | undefined => {
  const projectId = getOptionalEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getOptionalEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = getOptionalEnv('FIREBASE_PRIVATE_KEY');

  const hasSomeFirebaseVars = Boolean(projectId || clientEmail || privateKey);
  const hasAllFirebaseVars = Boolean(projectId && clientEmail && privateKey);

  if (!hasSomeFirebaseVars) {
    return undefined;
  }

  if (!projectId || !clientEmail || !privateKey || !hasAllFirebaseVars) {
    throw new Error(
      'La configuración de Firebase está incompleta. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY',
    );
  }

  const normalizedPrivateKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId,
    clientEmail,
    privateKey: normalizedPrivateKey,
  };
};

const getFirebaseAppOptions = (): AppOptions | undefined => {
  const serviceAccount = buildServiceAccountFromEnv();

  if (serviceAccount) {
    return {
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    };
  }

  return undefined;
};

export const getFirestoreDatabase = (): Firestore => {
  if (!firestoreInstance) {
    const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseAppOptions());
    firestoreInstance = getFirestore(app);
  }

  return firestoreInstance;
};
