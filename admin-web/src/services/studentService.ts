import { UserProfile, BulkImportRow, BulkImportResult } from '../types';
import { mockStudents } from '../mock/data';
import { db, secondaryAuth } from '../config/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memoryStudents = [...mockStudents];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<UserProfile[]> => { await delay(100); return [...memoryStudents]; },
  getById: async (uid: string): Promise<UserProfile | null> => { await delay(50); return memoryStudents.find(s => s.uid === uid) || null; },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
    await delay(100);
    const newStu: UserProfile = { ...data, uid: `stu-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    memoryStudents.push(newStu);
    return newStu;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memoryStudents.findIndex(s => s.uid === uid);
    if (index === -1) throw new Error('Not found');
    memoryStudents[index] = { ...memoryStudents[index], ...data, updatedAt: new Date() };
  },
  delete: async (uid: string): Promise<void> => {
    await delay(100);
    memoryStudents = memoryStudents.filter(s => s.uid !== uid);
  },
  bulkImport: async (rows: BulkImportRow[]): Promise<BulkImportResult> => {
    await delay(500);
    const res: BulkImportResult = { imported: 0, skipped: 0, failed: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.email || !row.rollNo || !row.fullName) { res.failed++; res.errors.push({ row: i+1, field: 'all', message: 'Missing required fields' }); continue; }
      const existingIdx = memoryStudents.findIndex(s => s.email === row.email || s.rollNo === row.rollNo);
      if (existingIdx !== -1) {
        memoryStudents[existingIdx] = {
          ...memoryStudents[existingIdx],
          departmentId: row.departmentId || memoryStudents[existingIdx].departmentId,
          sectionId: row.sectionId || memoryStudents[existingIdx].sectionId,
          semesterId: row.semesterId || memoryStudents[existingIdx].semesterId,
          fullName: row.fullName || memoryStudents[existingIdx].fullName,
          updatedAt: new Date()
        };
        res.imported++;
        continue;
      }
      memoryStudents.push({
        uid: `stu-${Date.now()}-${i}`,
        fullName: row.fullName,
        email: row.email,
        role: 'student',
        rollNo: row.rollNo,
        departmentId: row.departmentId,
        sectionId: row.sectionId,
        semesterId: row.semesterId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserProfile);
      res.imported++;
    }
    return res;
  }
};

const firebaseService = {
  getAll: async (): Promise<UserProfile[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(query(collection(db, 'profiles'), where('role', 'in', ['student', 'cr'])));
    return qs.docs.map(d => ({ ...d.data(), uid: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as UserProfile));
  },
  getById: async (uid: string): Promise<UserProfile | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? { ...snap.data(), uid: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as UserProfile : null;
  },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'> & { password?: string }): Promise<UserProfile> => {
    if (!db || !secondaryAuth) throw new Error('No FB');
    const password = (data as any).password || 'Amrita@123';
    const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
    await signOut(secondaryAuth);
    const uid = cred.user.uid;
    const { password: _pw, confirmPassword: _cp, ...profileData } = data as any;
    const profile: UserProfile = { ...profileData, uid, role: profileData.role || 'student', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    await setDoc(doc(db, 'profiles', uid), { ...profile, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return profile;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'profiles', uid), { ...data, updatedAt: Timestamp.now() });
  },
  delete: async (uid: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    // Delete Firestore profile (Auth user remains but can't log in without a profile)
    await deleteDoc(doc(db, 'profiles', uid));
  },
  bulkImport: async (rows: BulkImportRow[]): Promise<BulkImportResult> => {
    if (!db || !secondaryAuth) throw new Error('No FB');
    const res: BulkImportResult = { imported: 0, skipped: 0, failed: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.email || !row.rollNo || !row.fullName) {
        res.failed++;
        res.errors.push({ row: i + 1, field: 'all', message: 'Missing required fields' });
        continue;
      }
      try {
        const password = row.password || 'Amrita@123';
        const cred = await createUserWithEmailAndPassword(secondaryAuth, row.email, password);
        await signOut(secondaryAuth);
        
        const profileData: any = {
          uid: cred.user.uid,
          fullName: row.fullName,
          email: row.email,
          role: 'student',
          rollNo: row.rollNo,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        if (row.departmentId) profileData.departmentId = row.departmentId;
        if (row.sectionId) profileData.sectionId = row.sectionId;
        if (row.semesterId) profileData.semesterId = row.semesterId;

        await setDoc(doc(db, 'profiles', cred.user.uid), profileData);
        res.imported++;
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          // If already in Auth, update Firestore profile with department, section, and semester
          try {
            const qs = await getDocs(query(collection(db, 'profiles'), where('email', '==', row.email)));
            if (!qs.empty) {
              const existingDoc = qs.docs[0];
              const updateData: any = {
                fullName: row.fullName,
                rollNo: row.rollNo,
                updatedAt: Timestamp.now()
              };
              if (row.departmentId) updateData.departmentId = row.departmentId;
              if (row.sectionId) updateData.sectionId = row.sectionId;
              if (row.semesterId) updateData.semesterId = row.semesterId;
              await updateDoc(existingDoc.ref, updateData);
              res.imported++;
            } else {
              res.skipped++;
            }
          } catch (updateErr: any) {
            res.skipped++;
          }
        } else {
          res.failed++;
          res.errors.push({ row: i + 1, field: 'email', message: e.message || 'Import failed' });
        }
      }
    }
    return res;
  }
};

export const studentService = isMock ? mockService : firebaseService;
