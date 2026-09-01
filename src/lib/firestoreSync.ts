import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

// Custom event / listener for sync status
type StatusListener = (status: SyncStatus, details?: string) => void;
const statusListeners: Set<StatusListener> = new Set();
let currentStatus: SyncStatus = 'connecting' as SyncStatus;

export function onSyncStatusChange(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function updateStatus(status: SyncStatus, details?: string) {
  currentStatus = status;
  statusListeners.forEach((fn) => fn(status, details));
}

/**
 * Helper to ensure payload stays comfortably under Firestore's 1MB (1,048,576 bytes) limit
 */
function prepareSafeFirestoreDoc(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clone = JSON.parse(JSON.stringify(data));

  // Check individual large string values (e.g., base64 images)
  const sanitizeObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        // If an image data URI is excessively large (> 200KB base64 string)
        if (val.startsWith('data:image/') && val.length > 200000) {
          // If it's a background or logo, check if we need to trim/fallback
          console.warn(`[Firestore] Trimming oversized base64 field: ${key} (${val.length} chars)`);
          // If too large for single doc, replace with default Unsplash or truncated thumbnail
          if (key.toLowerCase().includes('bg') || key.toLowerCase().includes('wallpaper')) {
            obj[key] = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&auto=format&fit=crop&q=80';
          } else {
            obj[key] = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80';
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        sanitizeObject(val);
      }
    }
  };

  sanitizeObject(clone);
  return clone;
}

/**
 * Save / Update a single document in Firestore
 */
export async function saveDocToFirestore<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(docId));
    // Clean and sanitize for Firestore size limits
    const safeData = prepareSafeFirestoreDoc(data);
    await setDoc(docRef, safeData, { merge: true });
    updateStatus('connected');
  } catch (err) {
    console.error(`Error saving doc to ${collectionName}/${docId}:`, err);
    updateStatus('error', String(err));
  }
}

/**
 * Fetch a single document from Firestore
 */
export async function getDocFromFirestore<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, String(docId));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching doc from ${collectionName}/${docId}:`, err);
    return null;
  }
}

/**
 * Delete a single document in Firestore
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    updateStatus('connected');
  } catch (err) {
    console.error(`Error deleting doc from ${collectionName}/${docId}:`, err);
    updateStatus('error', String(err));
  }
}

/**
 * Batch upload / save an entire list of items to Firestore
 */
export async function batchSaveToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    updateStatus('syncing');
    // Chunk into batches of 450 (Firestore limit is 500 operations per batch)
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (item && item.id) {
          const docRef = doc(db, collectionName, String(item.id));
          const cleanItem = prepareSafeFirestoreDoc(item);
          batch.set(docRef, cleanItem, { merge: true });
        }
      }
      await batch.commit();
    }
    updateStatus('connected');
  } catch (err) {
    console.error(`Error batch saving ${collectionName}:`, err);
    updateStatus('error', String(err));
  }
}

/**
 * Real-time subscription to a Firestore Collection with auto-seeding
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  fallbackData: T[]
): Unsubscribe {
  const colRef = collection(db, collectionName);
  let isFirstLoad = true;

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        if (isFirstLoad && fallbackData && fallbackData.length > 0) {
          isFirstLoad = false;
          onData(fallbackData);
          // Seed fallback data to Firestore in background
          batchSaveToFirestore(collectionName, fallbackData).catch((e) =>
            console.warn(`Initial seed skipped for ${collectionName}:`, e)
          );
          return;
        }
        onData([]);
      } else {
        isFirstLoad = false;
        const docs = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as T),
          id: docSnap.id,
        }));
        onData(docs);
      }
      updateStatus('connected');
    },
    (err) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, err);
      updateStatus('error', err.message);
      // Use fallback data if offline or error
      if (fallbackData && fallbackData.length > 0) {
        onData(fallbackData);
      }
    }
  );
}

/**
 * Real-time subscription to a Single Document (e.g. school_settings)
 */
export function subscribeDoc<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  fallbackData: T
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as T);
      } else {
        onData(fallbackData);
        // Seed default config
        if (fallbackData) {
          saveDocToFirestore(collectionName, docId, fallbackData).catch((e) =>
            console.warn(`Initial seed skipped for doc ${docId}:`, e)
          );
        }
      }
      updateStatus('connected');
    },
    (err) => {
      console.warn(`Firestore single doc error on ${collectionName}/${docId}:`, err);
      updateStatus('error', err.message);
      if (fallbackData) {
        onData(fallbackData);
      }
    }
  );
}

/**
 * Manually force full sync of all local data to cloud Firestore
 */
export async function forceFullCloudSync(allData: {
  users: any[];
  classes: any[];
  jurusan: any[];
  grades: any[];
  attendance: any[];
  staffAttendance: any[];
  books: any[];
  peminjaman: any[];
  materi: any[];
  tugas: any[];
  pengumpulan: any[];
  forum: any[];
  notifications: any[];
  backups: any[];
  schoolSettings: any;
  subjects?: any[];
}): Promise<void> {
  updateStatus('syncing');
  try {
    const promises: Promise<any>[] = [
      batchSaveToFirestore('users', allData.users),
      batchSaveToFirestore('classes', allData.classes),
      batchSaveToFirestore('jurusan', allData.jurusan),
      batchSaveToFirestore('grades', allData.grades),
      batchSaveToFirestore('attendance', allData.attendance),
      batchSaveToFirestore('staff_attendance', allData.staffAttendance),
      batchSaveToFirestore('books', allData.books),
      batchSaveToFirestore('peminjaman', allData.peminjaman),
      batchSaveToFirestore('materi', allData.materi),
      batchSaveToFirestore('tugas', allData.tugas),
      batchSaveToFirestore('pengumpulan', allData.pengumpulan),
      batchSaveToFirestore('forum', allData.forum),
      batchSaveToFirestore('notifications', allData.notifications),
      batchSaveToFirestore('backups', allData.backups),
      saveDocToFirestore('school_settings', 'main_config', allData.schoolSettings),
    ];
    if (allData.subjects && allData.subjects.length > 0) {
      promises.push(batchSaveToFirestore('subjects', allData.subjects));
    }
    await Promise.all(promises);
    updateStatus('connected');
  } catch (err) {
    console.error('Error during full cloud sync:', err);
    updateStatus('error', String(err));
    throw err;
  }
}
