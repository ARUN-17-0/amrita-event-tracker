import { AuditLog } from '../types';
import { mockAuditLogs } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memoryLogs = [...mockAuditLogs];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<AuditLog[]> => {
    await delay(100);
    return [...memoryLogs].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  log: async (action: string, targetType: string, targetId: string, details: string): Promise<void> => {
    memoryLogs.push({
      id: `log-${Date.now()}`,
      actorUserId: 'admin-001',
      actorName: 'Dr. Rajesh Kumar',
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
  log: async (action: string, targetType: string, targetId: string, details: string): Promise<void> => {
    if (!db) return;
    await addDoc(collection(db, 'auditLogs'), {
      actorUserId: 'admin-001', actorName: 'Admin',
      action, targetType, targetId, details,
      createdAt: Timestamp.now()
    });
  }
};
export const auditLogService = isMock ? mockService : firebaseService;
