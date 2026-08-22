import { AcademicEvent } from '../types';
import { mockEvents } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mutable in-memory store so createEvent/deleteEvent reflect immediately
let runtimeEvents: AcademicEvent[] = [...mockEvents];

const mockService = {
  getEvents: async (): Promise<AcademicEvent[]> => {
    await delay(100);
    return [...runtimeEvents];
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
    const newEvent: AcademicEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    runtimeEvents = [...runtimeEvents, newEvent];
    return newEvent;
  },
  deleteEvent: async (id: string): Promise<void> => {
    await delay(100);
    runtimeEvents = runtimeEvents.filter(e => e.id !== id);
  },
};

const firebaseService = {
  getEvents: async (): Promise<AcademicEvent[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'events'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, eventDate: d.data().eventDate?.toDate(), createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as AcademicEvent));
  },
  getEventsForDate: async (date: Date): Promise<AcademicEvent[]> => {
    const all = await firebaseService.getEvents();
    return all.filter(e => e.eventDate.toDateString() === date.toDateString());
  },
  getEventsForMonth: async (year: number, month: number): Promise<AcademicEvent[]> => {
    const all = await firebaseService.getEvents();
    return all.filter(e => e.eventDate.getFullYear() === year && e.eventDate.getMonth() === month);
  },
  createEvent: async (event: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicEvent> => {
    if (!db) throw new Error('No FB');
    const ref = await addDoc(collection(db, 'events'), { ...event, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { ...event, id: ref.id, createdAt: new Date(), updatedAt: new Date() };
  },
  deleteEvent: async (id: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await deleteDoc(doc(db, 'events', id));
  },
};

export const calendarService = isMock ? mockService : firebaseService;
