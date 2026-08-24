import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUboKNc2v24MtCO0e8r_JCJrjNoh5zbno",
  authDomain: "amrita-event.firebaseapp.com",
  projectId: "amrita-event",
  storageBucket: "amrita-event.firebasestorage.app",
  messagingSenderId: "718126812694",
  appId: "1:718126812694:web:612200c8ee700d5575af37",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@cb.amrita.edu";
const ADMIN_PASSWORD = "admin123";

async function seed() {
  console.log("Seeding Firebase...\n");

  let adminUid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    adminUid = cred.user.uid;
    console.log("Admin Auth user created:", adminUid);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = cred.user.uid;
      console.log("Admin already exists, uid:", adminUid);
    } else throw e;
  }

  await setDoc(doc(db, "profiles", adminUid), {
    uid: adminUid, fullName: "Dr. Rajesh Kumar", email: ADMIN_EMAIL,
    role: "admin", isActive: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  console.log("Admin profile written");

  const depts = [
    { id: "dept-001", name: "Computer Science and Engineering", code: "CSE", isActive: true },
    { id: "dept-002", name: "Electronics and Communication Engineering", code: "ECE", isActive: true },
    { id: "dept-003", name: "Electrical and Electronics Engineering", code: "EEE", isActive: true },
    { id: "dept-004", name: "Mechanical Engineering", code: "ME", isActive: true },
    { id: "dept-005", name: "Civil Engineering", code: "CE", isActive: true },
  ];
  let batch = writeBatch(db);
  depts.forEach(d => batch.set(doc(db, "departments", d.id), { ...d, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await batch.commit();
  console.log("Departments written");

  const sems = [
    { id: "sem-001", name: "2022 Batch", year: "2022", isCurrent: false, isActive: false, startDate: Timestamp.fromDate(new Date("2022-07-01")), endDate: Timestamp.fromDate(new Date("2023-05-31")) },
    { id: "sem-002", name: "2023 Batch", year: "2023", isCurrent: false, isActive: false, startDate: Timestamp.fromDate(new Date("2023-07-01")), endDate: Timestamp.fromDate(new Date("2024-05-31")) },
    { id: "sem-003", name: "2024 Batch", year: "2024", isCurrent: true,  isActive: true,  startDate: Timestamp.fromDate(new Date("2024-07-01")), endDate: Timestamp.fromDate(new Date("2025-05-31")) },
    { id: "sem-004", name: "2025 Batch", year: "2025", isCurrent: false, isActive: true,  startDate: Timestamp.fromDate(new Date("2025-07-01")), endDate: Timestamp.fromDate(new Date("2026-05-31")) },
  ];
  batch = writeBatch(db);
  sems.forEach(s => batch.set(doc(db, "semesters", s.id), { ...s, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await batch.commit();
  console.log("Semesters/Batches written");

  const sections = [
    { id: "sec-001", name: "CSE-A", departmentId: "dept-001", semesterId: "sem-003" },
    { id: "sec-002", name: "CSE-B", departmentId: "dept-001", semesterId: "sem-003" },
    { id: "sec-003", name: "CSE-C", departmentId: "dept-001", semesterId: "sem-003" },
    { id: "sec-004", name: "ECE-A", departmentId: "dept-002", semesterId: "sem-003" },
    { id: "sec-005", name: "ECE-B", departmentId: "dept-002", semesterId: "sem-003" },
    { id: "sec-006", name: "EEE-A", departmentId: "dept-003", semesterId: "sem-003" },
    { id: "sec-007", name: "ME-A",  departmentId: "dept-004", semesterId: "sem-003" },
    { id: "sec-008", name: "CE-A",  departmentId: "dept-005", semesterId: "sem-003" },
  ];
  batch = writeBatch(db);
  sections.forEach(s => batch.set(doc(db, "sections", s.id), { ...s, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await batch.commit();
  console.log("Sections written");

  const subjects = [
    { id: "sub-001", name: "Data Structures and Algorithms", code: "21CS301", departmentId: "dept-001", semesterId: "sem-003", semesterType: "odd", credits: 4 },
    { id: "sub-002", name: "Database Management Systems",   code: "21CS302", departmentId: "dept-001", semesterId: "sem-003", semesterType: "odd", credits: 4 },
    { id: "sub-003", name: "Operating Systems",             code: "21CS303", departmentId: "dept-001", semesterId: "sem-003", semesterType: "even", credits: 3 },
    { id: "sub-004", name: "Digital Signal Processing",     code: "21EC301", departmentId: "dept-002", semesterId: "sem-003", semesterType: "odd", credits: 4 },
    { id: "sub-005", name: "VLSI Design",                   code: "21EC302", departmentId: "dept-002", semesterId: "sem-003", semesterType: "even", credits: 3 },
    { id: "sub-006", name: "Power Systems",                 code: "21EE301", departmentId: "dept-003", semesterId: "sem-003", semesterType: "odd", credits: 4 },
    { id: "sub-007", name: "Thermodynamics",                code: "21ME301", departmentId: "dept-004", semesterId: "sem-003", semesterType: "odd", credits: 4 },
    { id: "sub-008", name: "Structural Analysis",           code: "21CE301", departmentId: "dept-005", semesterId: "sem-003", semesterType: "odd", credits: 4 },
  ];
  batch = writeBatch(db);
  subjects.forEach(s => batch.set(doc(db, "subjects", s.id), { ...s, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await batch.commit();
  console.log("Subjects written");

  console.log("\nSeed complete! Login: admin@cb.amrita.edu / admin123");
  process.exit(0);
}

seed().catch(e => { console.error("Seed failed:", e.message); process.exit(1); });
