import { UserProfile } from '../types';
import { studentService } from './studentService';
import { sectionService } from './sectionService';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

const service = {
  getAll: async (): Promise<UserProfile[]> => {
    const students = await studentService.getAll();
    return students.filter(s => s.role === 'cr');
  },
  assignCR: async (studentId: string, sectionId: string): Promise<void> => {
    await studentService.update(studentId, { role: 'cr', sectionId });
    await sectionService.assignCR(sectionId, studentId);
  },
  removeCR: async (studentId: string, sectionId: string): Promise<void> => {
    await studentService.update(studentId, { role: 'student' });
    await sectionService.removeCR(sectionId);
  }
};

export const crService = service;
