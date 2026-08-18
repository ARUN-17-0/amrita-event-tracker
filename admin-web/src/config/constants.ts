export const APP_NAME = "Amrita Event Tracker";
export const APP_SHORT_NAME = "AET";
export const APP_VERSION = "1.0.0";

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'home' },
  { label: 'Departments', path: '/departments', icon: 'building' },
  { label: 'Semesters', path: '/semesters', icon: 'calendar-days' },
  { label: 'Subjects', path: '/subjects', icon: 'book-open' },
  { label: 'Sections', path: '/sections', icon: 'users' },
  { label: 'Faculty', path: '/faculty', icon: 'graduation-cap' },
  { label: 'Students', path: '/students', icon: 'user' },
  { label: 'Calendar', path: '/calendar', icon: 'calendar' },
  { label: 'Audit Logs', path: '/audit-logs', icon: 'clipboard-list' }
];

export const EVENT_TYPES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'lab', label: 'Lab' },
  { value: 'project', label: 'Project' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'other', label: 'Other' }
];

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'cr', label: 'Class Representative' },
  { value: 'student', label: 'Student' }
];
