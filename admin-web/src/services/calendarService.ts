import { AcademicEvent } from '../types';
import { mockEvents } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp, query, where } from 'firebase/firestore';

export interface EventFilter {
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  sectionId?: string;
}

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mutable in-memory store so createEvent/deleteEvent reflect immediately
let runtimeEvents: AcademicEvent[] = [...mockEvents];

const mockService = {
  getEvents: async (filter?: EventFilter): Promise<AcademicEvent[]> => {
    await delay(100);
    let list = [...runtimeEvents];
    if (filter?.startDate) list = list.filter(e => e.eventDate >= filter.startDate!);
    if (filter?.endDate) list = list.filter(e => e.eventDate <= filter.endDate!);
    if (filter?.departmentId) list = list.filter(e => e.departmentId === filter.departmentId);
    if (filter?.sectionId) list = list.filter(e => e.sectionId === filter.sectionId);
    return list;
  },
  getEventsForDate: async (date: Date): Promise<AcademicEvent[]> => {
    await delay(50);
    return runtimeEvents.filter(e => e.eventDate.toDateString() === date.toDateString());
  },
  getEventsForMonth: async (year: number, month: number): Promise<AcademicEvent[]> => {
    await delay(50);
    return runtimeEvents.filter(e => e.eventDate.getFullYear() === year && e.eventDate.getMonth() === month);
  },
  createEvent: async (event: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicEvent> => {
    await delay(200);
    const now = new Date();
    const newEvent: AcademicEvent = { ...event, id: `evt-${Date.now()}`, createdAt: now, updatedAt: now };
    runtimeEvents = [...runtimeEvents, newEvent];
    return newEvent;
  },
  updateEvent: async (id: string, data: Partial<Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    runtimeEvents = runtimeEvents.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date() } : e);
  },
  deleteEvent: async (id: string): Promise<void> => {
    await delay(100);
    runtimeEvents = runtimeEvents.filter(e => e.id !== id);
  },
};

const firebaseService = {
  getEvents: async (filter?: EventFilter): Promise<AcademicEvent[]> => {
    if (!db) throw new Error('No FB');
    const constraints: any[] = [];
    if (filter?.startDate) {
      constraints.push(where('eventDate', '>=', Timestamp.fromDate(filter.startDate)));
    }
    if (filter?.endDate) {
      constraints.push(where('eventDate', '<=', Timestamp.fromDate(filter.endDate)));
    }
    if (filter?.departmentId) {
      constraints.push(where('departmentId', '==', filter.departmentId));
    }
    if (filter?.sectionId) {
      constraints.push(where('sectionId', '==', filter.sectionId));
    }

    const colRef = collection(db, 'events');
    const firestoreQuery = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
    const qs = await getDocs(firestoreQuery);
    return qs.docs.map(d => ({
      ...d.data(),
      id: d.id,
      eventDate: d.data().eventDate?.toDate ? d.data().eventDate.toDate() : new Date(d.data().eventDate),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
      updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate() : new Date()
    } as AcademicEvent));
  },
  getEventsForDate: async (date: Date): Promise<AcademicEvent[]> => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return firebaseService.getEvents({ startDate: start, endDate: end });
  },
  getEventsForMonth: async (year: number, month: number): Promise<AcademicEvent[]> => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month + 2, 0, 23, 59, 59, 999);
    return firebaseService.getEvents({ startDate: start, endDate: end });
  },
  createEvent: async (event: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicEvent> => {
    if (!db) throw new Error('No FB');
    const ref = await addDoc(collection(db, 'events'), { ...event, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { ...event, id: ref.id, createdAt: new Date(), updatedAt: new Date() };
  },
  updateEvent: async (id: string, data: Partial<Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    const payload: any = { ...data, updatedAt: serverTimestamp() };
    if (data.eventDate) payload.eventDate = Timestamp.fromDate(data.eventDate);
    await updateDoc(doc(db, 'events', id), payload);
  },
  deleteEvent: async (id: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await deleteDoc(doc(db, 'events', id));
  },
};

export const calendarService = isMock ? mockService : firebaseService;
