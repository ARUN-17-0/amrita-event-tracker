import { AuditLog } from '../types';
import { mockAuditLogs } from '../mock/data';
import { db, auth } from '../config/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memoryLogs = [...mockAuditLogs];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<AuditLog[]> => {
    await delay(100);
    return [...memoryLogs].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  log: async (action: string, targetType: string, targetId: string, details: string, actorUserId?: string, actorName?: string): Promise<void> => {
    memoryLogs.push({
      id: `log-${Date.now()}`,
      actorUserId: actorUserId || 'admin-001',
      actorName: actorName || 'Admin User',
      action, targetType, targetId, details,
      createdAt: new Date()
    });
  }
};

const firebaseService = {
  getAll: async (): Promise<AuditLog[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'auditLogs'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate() } as AuditLog)).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  log: async (action: string, targetType: string, targetId: string, details: string, actorUserId?: string, actorName?: string): Promise<void> => {
    if (!db) return;
    const currentFbUser = auth?.currentUser;
    const uid = actorUserId || currentFbUser?.uid || 'system';
    const name = actorName || currentFbUser?.displayName || currentFbUser?.email?.split('@')[0] || 'Authenticated User';

    await addDoc(collection(db, 'auditLogs'), {
      actorUserId: uid,
      actorName: name,
      action, targetType, targetId, details,
      createdAt: Timestamp.now()
    });
  }
};
export const auditLogService = isMock ? mockService : firebaseService;
