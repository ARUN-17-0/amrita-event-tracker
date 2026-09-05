import { UserProfile, BulkImportRow, BulkImportResult } from '../types';
import { mockStudents } from '../mock/data';
import { db, secondaryAuth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, query, where, writeBatch } from 'firebase/firestore';

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
    if (!db) throw new Error('No FB');
    const password = (data as any).password || 'Amrita@123';
    let uid = '';

    if (secondaryAuth) {
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email.toLowerCase().trim(), password);
        await signOut(secondaryAuth);
        uid = cred.user.uid;
      } catch (authErr: any) {
        // If email already in auth, that's fine, we will create/update the profile
      }
    }

    if (!uid) {
      const qs = await getDocs(query(collection(db, 'profiles'), where('email', '==', data.email.toLowerCase().trim())));
      if (!qs.empty) {
        uid = qs.docs[0].id;
      } else {
        uid = doc(collection(db, 'profiles')).id;
      }
    }

    const { password: _pw, confirmPassword: _cp, ...profileData } = data as any;
    const profile: UserProfile = {
      ...profileData,
      uid,
      email: data.email.toLowerCase().trim(),
      role: profileData.role || 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    if (!db) throw new Error('No FB');
    const res: BulkImportResult = { imported: 0, skipped: 0, failed: 0, errors: [] };
    if (!rows || rows.length === 0) return res;

    // Upfront validation
    const validRows: { row: BulkImportRow; index: number }[] = [];
    const seenEmails = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      if (!row.email?.trim() || !row.rollNo?.trim() || !row.fullName?.trim()) {
        res.failed++;
        res.errors.push({ row: rowNum, field: 'all', message: 'Missing required fields (email, rollNo, fullName)' });
        continue;
      }
      const email = row.email.trim().toLowerCase();
      if (!email.includes('@')) {
        res.failed++;
        res.errors.push({ row: rowNum, field: 'email', message: 'Invalid email address format' });
        continue;
      }
      if (seenEmails.has(email)) {
        res.skipped++;
        res.errors.push({ row: rowNum, field: 'email', message: `Duplicate email '${email}' in import file` });
        continue;
      }
      seenEmails.add(email);
      validRows.push({ row, index: rowNum });
    }

    if (validRows.length === 0) return res;

    // Process in batches of 400 (safe limit under Firestore 500 operations per batch)
    const BATCH_SIZE = 400;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const chunk = validRows.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const { row } of chunk) {
        const emailLower = row.email.trim().toLowerCase();
        const docRef = doc(collection(db, 'profiles'));
        const profileData: any = {
          uid: docRef.id,
          fullName: row.fullName.trim(),
          email: emailLower,
          role: 'student',
          rollNo: row.rollNo.trim(),
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        if (row.departmentId) profileData.departmentId = row.departmentId;
        if (row.sectionId) profileData.sectionId = row.sectionId;
        if (row.semesterId) profileData.semesterId = row.semesterId;

        batch.set(docRef, profileData);
      }

      try {
        await batch.commit();
        res.imported += chunk.length;
      } catch (err: any) {
        res.failed += chunk.length;
        res.errors.push({ row: i + 1, field: 'batch', message: `Batch commit failed: ${err.message || 'Unknown error'}` });
      }
    }

    return res;
  }
};

export const studentService = isMock ? mockService : firebaseService;
