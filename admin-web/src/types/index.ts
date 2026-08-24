// ============================================================
// AET Admin Web — Type Definitions
// ============================================================

// --- Enums / Union Types ---

export type UserRole = 'admin' | 'faculty' | 'course_mentor' | 'cr' | 'student';

export type EventType =
  | 'assignment'
  | 'quiz'
  | 'exam'
  | 'lab'
  | 'project'
  | 'announcement'
  | 'other';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

// --- Core Models ---

export interface BatchAssignment {
  batchId: string;
  subjectIds: string[];
  sectionIds: string[];
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  sectionId?: string;
  rollNo?: string;
  employeeId?: string;
  assignedSubjectIds?: string[];
  assignedSectionIds?: string[];
  batchAssignments?: BatchAssignment[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Semester {
  id: string;
  name: string;
  year: string;
  isCurrent: boolean;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
  semesterId: string;
  crUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  semesterId: string;
  semesterType?: 'odd' | 'even';
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultySubjectSection {
  id: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  createdAt: Date;
}

export interface AcademicEvent {
  id: string;
  title: string;
  type: EventType;
  description: string;
  topics?: string[];
  subjectId: string;
  sectionId: string;
  departmentId: string;
  semesterId: string;
  eventDate: Date;
  eventTime: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface EventRequest {
  id: string;
  crUserId: string;
  sectionId: string;
  title: string;
  type: EventType;
  description: string;
  requestedDate: Date;
  status: RequestStatus;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: Date;
}

// --- Service Interfaces ---

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface CrudHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface BulkImportRow {
  fullName: string;
  email: string;
  rollNo: string;
  departmentCode: string;
  semesterName: string;
  sectionName: string;
}

export interface ValidatedImportRow extends BulkImportRow {
  rowIndex: number;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
  departmentId?: string;
  semesterId?: string;
  sectionId?: string;
}

// --- UI Types ---

export interface SidebarItem {
  label: string;
  path: string;
  icon: string;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DashboardStat {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: AcademicEvent[];
}
