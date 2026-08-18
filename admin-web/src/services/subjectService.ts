import { Subject } from '../types';
import { mockSubjects } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memorySubjects = [...mockSubjects];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<Subject[]> => { await delay(100); return [...memorySubjects]; },
  getById: async (id: string): Promise<Subject | null> => { await delay(50); return memorySubjects.find(s => s.id === id) || null; },
  create: async (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    await delay(100);
    const newSub: Subject = { ...data, id: `sub-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    memorySubjects.push(newSub);
    return newSub;
  },
  update: async (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memorySubjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Not found');
    memorySubjects[index] = { ...memorySubjects[index], ...data, updatedAt: new Date() };
  }
};

const firebaseService = {
  getAll: async (): Promise<Subject[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'subjects'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as Subject));
  },
  getById: async (id: string): Promise<Subject | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'subjects', id));
    return snap.exists() ? { ...snap.data(), id: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as Subject : null;
  },
  create: async (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    if (!db) throw new Error('No FB');
    const ref = await addDoc(collection(db, 'subjects'), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() } as Subject;
  },
  update: async (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'subjects', id), { ...data, updatedAt: Timestamp.now() });
  }
};
export const subjectService = isMock ? mockService : firebaseService;
