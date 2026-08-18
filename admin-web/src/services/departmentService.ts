import { Department } from '../types';
import { mockDepartments } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let memoryDepartments = [...mockDepartments];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<Department[]> => {
    await delay(100);
    return [...memoryDepartments];
  },
  getById: async (id: string): Promise<Department | null> => {
    await delay(50);
    return memoryDepartments.find(d => d.id === id) || null;
  },
  create: async (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> => {
    await delay(100);
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDepartments.push(newDept);
    return newDept;
  },
  update: async (id: string, data: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memoryDepartments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Not found');
    memoryDepartments[index] = { ...memoryDepartments[index], ...data, updatedAt: new Date() };
  },
  toggle: async (id: string): Promise<void> => {
    await delay(100);
    const index = memoryDepartments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Not found');
    memoryDepartments[index].isActive = !memoryDepartments[index].isActive;
    memoryDepartments[index].updatedAt = new Date();
  }
};

const firebaseService = {
  getAll: async (): Promise<Department[]> => {
    if (!db) throw new Error('Firebase not initialized');
    const qs = await getDocs(collection(db, 'departments'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as Department));
  },
  getById: async (id: string): Promise<Department | null> => {
    if (!db) throw new Error('Firebase not initialized');
    const docSnap = await getDoc(doc(db, 'departments', id));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id, createdAt: docSnap.data().createdAt?.toDate(), updatedAt: docSnap.data().updatedAt?.toDate() } as Department;
  },
  create: async (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> => {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = await addDoc(collection(db, 'departments'), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return { ...data, id: docRef.id, createdAt: new Date(), updatedAt: new Date() } as Department;
  },
  update: async (id: string, data: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'departments', id), { ...data, updatedAt: Timestamp.now() });
  },
  toggle: async (id: string): Promise<void> => {
    if (!db) throw new Error('Firebase not initialized');
    const ref = doc(db, 'departments', id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      await updateDoc(ref, { isActive: !docSnap.data().isActive, updatedAt: Timestamp.now() });
    }
  }
};

export const departmentService = isMock ? mockService : firebaseService;
