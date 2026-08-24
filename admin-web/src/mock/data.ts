import { UserProfile, Department, Semester, Section, Subject, AcademicEvent, EventRequest, AppNotification, AuditLog } from '../types';

const now = new Date();
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const subDays = (date: Date, days: number) => new Date(date.getTime() - days * 86400000);

export const mockAdmin: UserProfile = {
  uid: 'admin-001',
  fullName: 'Dr. Rajesh Kumar',
  email: 'admin@cb.amrita.edu',
  role: 'admin',
  isActive: true,
  createdAt: subDays(now, 100),
  updatedAt: subDays(now, 10)
};

// Demo account (Admin only)
export const mockDemoAccounts: Record<string, { user: UserProfile; password: string }> = {
  'admin@cb.amrita.edu': { user: mockAdmin, password: 'admin123' },
};

export const mockDepartments: Department[] = [
  { id: 'dept-001', name: 'Computer Science and Engineering', code: 'CSE', isActive: true, createdAt: subDays(now, 365), updatedAt: subDays(now, 365) },
  { id: 'dept-002', name: 'Electronics and Communication Engineering', code: 'ECE', isActive: true, createdAt: subDays(now, 365), updatedAt: subDays(now, 365) },
  { id: 'dept-003', name: 'Electrical and Electronics Engineering', code: 'EEE', isActive: true, createdAt: subDays(now, 365), updatedAt: subDays(now, 365) },
  { id: 'dept-004', name: 'Mechanical Engineering', code: 'ME', isActive: true, createdAt: subDays(now, 365), updatedAt: subDays(now, 365) },
  { id: 'dept-005', name: 'Civil Engineering', code: 'CE', isActive: true, createdAt: subDays(now, 365), updatedAt: subDays(now, 365) }
];

export const mockSemesters: Semester[] = [
  { id: 'sem-001', name: '2022 Batch', year: '2022', isCurrent: false, isActive: false, startDate: new Date('2022-07-01'), endDate: new Date('2023-05-31'), createdAt: subDays(now, 300), updatedAt: subDays(now, 300) },
  { id: 'sem-002', name: '2023 Batch', year: '2023', isCurrent: false, isActive: false, startDate: new Date('2023-07-01'), endDate: new Date('2024-05-31'), createdAt: subDays(now, 200), updatedAt: subDays(now, 200) },
  { id: 'sem-003', name: '2024 Batch', year: '2024', isCurrent: true, isActive: true, startDate: new Date('2024-07-01'), endDate: new Date('2025-05-31'), createdAt: subDays(now, 30), updatedAt: subDays(now, 10) },
  { id: 'sem-004', name: '2025 Batch', year: '2025', isCurrent: false, isActive: true, startDate: new Date('2025-07-01'), endDate: new Date('2026-05-31'), createdAt: subDays(now, 10), updatedAt: subDays(now, 10) }
];

export const mockSections: Section[] = [
  { id: 'sec-001', name: 'CSE-A', departmentId: 'dept-001', semesterId: 'sem-003', crUserId: 'stu-001', createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-002', name: 'CSE-B', departmentId: 'dept-001', semesterId: 'sem-003', crUserId: 'stu-002', createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-003', name: 'CSE-C', departmentId: 'dept-001', semesterId: 'sem-003', crUserId: undefined, createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-004', name: 'ECE-A', departmentId: 'dept-002', semesterId: 'sem-003', crUserId: 'stu-003', createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-005', name: 'ECE-B', departmentId: 'dept-002', semesterId: 'sem-003', crUserId: undefined, createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-006', name: 'EEE-A', departmentId: 'dept-003', semesterId: 'sem-003', crUserId: undefined, createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-007', name: 'ME-A', departmentId: 'dept-004', semesterId: 'sem-003', crUserId: undefined, createdAt: subDays(now, 100), updatedAt: subDays(now, 50) },
  { id: 'sec-008', name: 'CE-A', departmentId: 'dept-005', semesterId: 'sem-003', crUserId: undefined, createdAt: subDays(now, 100), updatedAt: subDays(now, 50) }
];

export const mockSubjects: Subject[] = [
  { id: 'sub-001', name: 'Data Structures and Algorithms', code: '21CS301', departmentId: 'dept-001', semesterId: 'sem-003', semesterNumber: 3, semesterType: 'odd', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-002', name: 'Database Management Systems', code: '21CS302', departmentId: 'dept-001', semesterId: 'sem-003', semesterNumber: 3, semesterType: 'odd', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-003', name: 'Computer Networks', code: '21CS303', departmentId: 'dept-001', semesterId: 'sem-003', semesterNumber: 4, semesterType: 'even', credits: 3, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-004', name: 'Operating Systems', code: '21CS304', departmentId: 'dept-001', semesterId: 'sem-003', semesterNumber: 4, semesterType: 'even', credits: 3, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-005', name: 'Digital Signal Processing', code: '21EC301', departmentId: 'dept-002', semesterId: 'sem-003', semesterNumber: 5, semesterType: 'odd', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-006', name: 'Microprocessors and Microcontrollers', code: '21EC302', departmentId: 'dept-002', semesterId: 'sem-003', semesterNumber: 6, semesterType: 'even', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-007', name: 'Control Systems', code: '21EE301', departmentId: 'dept-003', semesterId: 'sem-003', semesterNumber: 5, semesterType: 'odd', credits: 3, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-008', name: 'Power Electronics', code: '21EE302', departmentId: 'dept-003', semesterId: 'sem-003', semesterNumber: 6, semesterType: 'even', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-009', name: 'Thermodynamics', code: '21ME301', departmentId: 'dept-004', semesterId: 'sem-003', semesterNumber: 3, semesterType: 'odd', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) },
  { id: 'sub-010', name: 'Fluid Mechanics', code: '21CE301', departmentId: 'dept-005', semesterId: 'sem-003', semesterNumber: 5, semesterType: 'odd', credits: 4, createdAt: subDays(now, 200), updatedAt: subDays(now, 100) }
];

export const mockFaculty: UserProfile[] = [
  { uid: 'fac-001', fullName: 'Dr. Anand Kumar', email: 'anand@cb.amrita.edu', role: 'faculty', employeeId: 'EMP001', departmentId: 'dept-001', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'fac-002', fullName: 'Dr. Priya S', email: 'priya@cb.amrita.edu', role: 'faculty', employeeId: 'EMP002', departmentId: 'dept-001', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'fac-003', fullName: 'Prof. Ramesh M', email: 'ramesh@cb.amrita.edu', role: 'faculty', employeeId: 'EMP003', departmentId: 'dept-002', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'fac-004', fullName: 'Dr. Vidya K', email: 'vidya@cb.amrita.edu', role: 'faculty', employeeId: 'EMP004', departmentId: 'dept-003', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'fac-005', fullName: 'Dr. Suresh B', email: 'suresh@cb.amrita.edu', role: 'faculty', employeeId: 'EMP005', departmentId: 'dept-004', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'fac-006', fullName: 'Prof. Lakshmi N', email: 'lakshmi@cb.amrita.edu', role: 'faculty', employeeId: 'EMP006', departmentId: 'dept-005', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) }
];

export const mockStudents: UserProfile[] = [
  { uid: 'stu-001', fullName: 'Arun Karthik', email: 'arun@students.amrita.edu', role: 'cr', rollNo: 'CB.EN.U4CSE21001', departmentId: 'dept-001', sectionId: 'sec-001', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-002', fullName: 'Bala Murugan', email: 'bala@students.amrita.edu', role: 'cr', rollNo: 'CB.EN.U4CSE21002', departmentId: 'dept-001', sectionId: 'sec-002', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-003', fullName: 'Chitra L', email: 'chitra@students.amrita.edu', role: 'cr', rollNo: 'CB.EN.U4ECE21001', departmentId: 'dept-002', sectionId: 'sec-004', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-004', fullName: 'Dinesh K', email: 'dinesh@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CSE21004', departmentId: 'dept-001', sectionId: 'sec-001', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-005', fullName: 'Ezhil V', email: 'ezhil@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CSE21005', departmentId: 'dept-001', sectionId: 'sec-001', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-006', fullName: 'Farook S', email: 'farook@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CSE21006', departmentId: 'dept-001', sectionId: 'sec-002', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-007', fullName: 'Gokul R', email: 'gokul@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CSE21007', departmentId: 'dept-001', sectionId: 'sec-002', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-008', fullName: 'Hari T', email: 'hari@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4ECE21008', departmentId: 'dept-002', sectionId: 'sec-004', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-009', fullName: 'Indra M', email: 'indra@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4ECE21009', departmentId: 'dept-002', sectionId: 'sec-005', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-010', fullName: 'Jeeva P', email: 'jeeva@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4EEE21010', departmentId: 'dept-003', sectionId: 'sec-006', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-011', fullName: 'Kavya N', email: 'kavya@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4EEE21011', departmentId: 'dept-003', sectionId: 'sec-006', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-012', fullName: 'Loganathan R', email: 'loganathan@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4ME21012', departmentId: 'dept-004', sectionId: 'sec-007', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-013', fullName: 'Manoj S', email: 'manoj@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4ME21013', departmentId: 'dept-004', sectionId: 'sec-007', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-014', fullName: 'Naveen K', email: 'naveen@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CE21014', departmentId: 'dept-005', sectionId: 'sec-008', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) },
  { uid: 'stu-015', fullName: 'Oviya P', email: 'oviya@students.amrita.edu', role: 'student', rollNo: 'CB.EN.U4CE21015', departmentId: 'dept-005', sectionId: 'sec-008', isActive: true, createdAt: subDays(now, 200), updatedAt: subDays(now, 50) }
];

export const mockEvents: AcademicEvent[] = [
  { id: 'evt-001', title: 'DSA Periodical 1', type: 'exam', description: 'Periodical 1 for Data Structures', subjectId: 'sub-001', sectionId: 'sec-001', departmentId: 'dept-001', semesterId: 'sem-003', eventDate: addDays(now, 2), eventTime: '09:00', createdBy: 'fac-001', createdAt: subDays(now, 5), updatedAt: subDays(now, 5), isActive: true },
  { id: 'evt-002', title: 'DBMS Assignment 1', type: 'assignment', description: 'SQL Queries Assignment', subjectId: 'sub-002', sectionId: 'sec-001', departmentId: 'dept-001', semesterId: 'sem-003', eventDate: addDays(now, 5), eventTime: '23:59', createdBy: 'fac-002', createdAt: subDays(now, 2), updatedAt: subDays(now, 2), isActive: true },
  { id: 'evt-003', title: 'CN Quiz', type: 'quiz', description: 'Networking Basics Quiz', subjectId: 'sub-003', sectionId: 'sec-002', departmentId: 'dept-001', semesterId: 'sem-003', eventDate: now, eventTime: '14:00', createdBy: 'fac-001', createdAt: subDays(now, 3), updatedAt: subDays(now, 3), isActive: true },
  { id: 'evt-004', title: 'OS Lab Evaluation', type: 'lab', description: 'Process Scheduling Lab Eval', subjectId: 'sub-004', sectionId: 'sec-001', departmentId: 'dept-001', semesterId: 'sem-003', eventDate: subDays(now, 1), eventTime: '10:00', createdBy: 'fac-002', createdAt: subDays(now, 7), updatedAt: subDays(now, 7), isActive: true },
  { id: 'evt-005', title: 'DSP Project Review', type: 'project', description: 'First review for DSP project', subjectId: 'sub-005', sectionId: 'sec-004', departmentId: 'dept-002', semesterId: 'sem-003', eventDate: addDays(now, 10), eventTime: '15:00', createdBy: 'fac-003', createdAt: subDays(now, 1), updatedAt: subDays(now, 1), isActive: true },
  { id: 'evt-006', title: 'Microprocessors Exam', type: 'exam', description: 'Mid-term exam', subjectId: 'sub-006', sectionId: 'sec-004', departmentId: 'dept-002', semesterId: 'sem-003', eventDate: addDays(now, 15), eventTime: '09:30', createdBy: 'fac-003', createdAt: subDays(now, 1), updatedAt: subDays(now, 1), isActive: true },
  { id: 'evt-007', title: 'Control Systems Assignment', type: 'assignment', description: 'Root Locus Assignment', subjectId: 'sub-007', sectionId: 'sec-006', departmentId: 'dept-003', semesterId: 'sem-003', eventDate: addDays(now, 7), eventTime: '23:59', createdBy: 'fac-004', createdAt: subDays(now, 2), updatedAt: subDays(now, 2), isActive: true },
  { id: 'evt-008', title: 'Power Electronics Lab', type: 'lab', description: 'Inverter Lab', subjectId: 'sub-008', sectionId: 'sec-006', departmentId: 'dept-003', semesterId: 'sem-003', eventDate: addDays(now, 4), eventTime: '11:00', createdBy: 'fac-004', createdAt: subDays(now, 2), updatedAt: subDays(now, 2), isActive: true },
  { id: 'evt-009', title: 'Thermodynamics Quiz', type: 'quiz', description: 'First Law Quiz', subjectId: 'sub-009', sectionId: 'sec-007', departmentId: 'dept-004', semesterId: 'sem-003', eventDate: addDays(now, 1), eventTime: '10:00', createdBy: 'fac-005', createdAt: subDays(now, 3), updatedAt: subDays(now, 3), isActive: true },
  { id: 'evt-010', title: 'Fluid Mechanics Exam', type: 'exam', description: 'Periodical 1', subjectId: 'sub-010', sectionId: 'sec-008', departmentId: 'dept-005', semesterId: 'sem-003', eventDate: addDays(now, 6), eventTime: '09:00', createdBy: 'fac-006', createdAt: subDays(now, 4), updatedAt: subDays(now, 4), isActive: true }
];

export const mockRequests: EventRequest[] = [
  { id: 'req-001', crUserId: 'stu-001', sectionId: 'sec-001', title: 'Postpone DSA Exam', type: 'exam', description: 'Students have back-to-back exams.', requestedDate: addDays(now, 4), status: 'pending', createdAt: subDays(now, 1), updatedAt: subDays(now, 1) },
  { id: 'req-002', crUserId: 'stu-002', sectionId: 'sec-002', title: 'Extra Class for DBMS', type: 'other', description: 'Need more clarification on Normalization.', requestedDate: addDays(now, 3), status: 'approved', reviewedBy: 'fac-002', reviewNote: 'Approved. Will take class at 4PM.', createdAt: subDays(now, 3), updatedAt: subDays(now, 2) },
  { id: 'req-003', crUserId: 'stu-003', sectionId: 'sec-004', title: 'Change Lab Schedule', type: 'lab', description: 'Clashing with another event.', requestedDate: addDays(now, 5), status: 'rejected', reviewedBy: 'fac-003', reviewNote: 'Lab schedule is fixed. Cannot be changed.', createdAt: subDays(now, 4), updatedAt: subDays(now, 3) },
  { id: 'req-004', crUserId: 'stu-001', sectionId: 'sec-001', title: 'Extend OS Assignment', type: 'assignment', description: 'Need 2 more days.', requestedDate: addDays(now, 6), status: 'pending', createdAt: now, updatedAt: now },
  { id: 'req-005', crUserId: 'stu-002', sectionId: 'sec-002', title: 'Guest Lecture', type: 'other', description: 'Requesting guest lecture on Cloud Computing.', requestedDate: addDays(now, 10), status: 'pending', createdAt: now, updatedAt: now }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'log-001', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'CREATE', targetType: 'DEPARTMENT', targetId: 'dept-005', details: 'Created department Civil Engineering', createdAt: subDays(now, 365) },
  { id: 'log-002', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'UPDATE', targetType: 'SEMESTER', targetId: 'sem-003', details: 'Set semester Odd Semester 2024 as current', createdAt: subDays(now, 30) },
  { id: 'log-003', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'CREATE', targetType: 'SECTION', targetId: 'sec-001', details: 'Created section CSE-A', createdAt: subDays(now, 100) },
  { id: 'log-004', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'CREATE', targetType: 'SUBJECT', targetId: 'sub-001', details: 'Created subject Data Structures and Algorithms', createdAt: subDays(now, 200) },
  { id: 'log-005', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'IMPORT', targetType: 'STUDENT', targetId: 'multiple', details: 'Imported 15 students', createdAt: subDays(now, 200) },
  { id: 'log-006', actorUserId: 'admin-001', actorName: 'Dr. Rajesh Kumar', action: 'ASSIGN_CR', targetType: 'SECTION', targetId: 'sec-001', details: 'Assigned Arun Karthik as CR for CSE-A', createdAt: subDays(now, 50) },
  { id: 'log-007', actorUserId: 'fac-001', actorName: 'Dr. Anand Kumar', action: 'CREATE', targetType: 'EVENT', targetId: 'evt-001', details: 'Created exam DSA Periodical 1', createdAt: subDays(now, 5) },
  { id: 'log-008', actorUserId: 'fac-002', actorName: 'Dr. Priya S', action: 'CREATE', targetType: 'EVENT', targetId: 'evt-002', details: 'Created assignment DBMS Assignment 1', createdAt: subDays(now, 2) },
  { id: 'log-009', actorUserId: 'fac-002', actorName: 'Dr. Priya S', action: 'APPROVE', targetType: 'REQUEST', targetId: 'req-002', details: 'Approved request Extra Class for DBMS', createdAt: subDays(now, 2) },
  { id: 'log-010', actorUserId: 'fac-003', actorName: 'Prof. Ramesh M', action: 'REJECT', targetType: 'REQUEST', targetId: 'req-003', details: 'Rejected request Change Lab Schedule', createdAt: subDays(now, 3) }
];

export const mockNotifications: AppNotification[] = [
  { id: 'notif-001', userId: 'admin-001', title: 'New CR Assigned', body: 'Arun Karthik has been assigned as CR for CSE-A.', isRead: false, createdAt: subDays(now, 50) },
  { id: 'notif-002', userId: 'admin-001', title: 'Semester Started', body: 'Odd Semester 2024 has officially started.', isRead: true, createdAt: subDays(now, 30) },
  { id: 'notif-003', userId: 'admin-001', title: 'System Update', body: 'Scheduled maintenance this weekend.', isRead: true, createdAt: subDays(now, 10) },
  { id: 'notif-004', userId: 'admin-001', title: 'High Event Volume', body: '5 new events created today.', isRead: false, createdAt: subDays(now, 2) },
  { id: 'notif-005', userId: 'admin-001', title: 'Pending Request', body: 'CR of CSE-A requested exam postponement.', isRead: false, createdAt: subDays(now, 1) }
];
