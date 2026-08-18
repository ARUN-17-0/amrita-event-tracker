import { AcademicEvent } from '../types';
import { mockEvents } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getEvents: async (): Promise<AcademicEvent[]> => {
    await delay(100);
    return [...mockEvents];
  },
  getEventsForDate: async (date: Date): Promise<AcademicEvent[]> => {
    await delay(50);
    return mockEvents.filter(e => e.eventDate.toDateString() === date.toDateString());
  },
  getEventsForMonth: async (year: number, month: number): Promise<AcademicEvent[]> => {
    await delay(50);
    return mockEvents.filter(e => e.eventDate.getFullYear() === year && e.eventDate.getMonth() === month);
  }
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
  }
};
export const calendarService = isMock ? mockService : firebaseService;
