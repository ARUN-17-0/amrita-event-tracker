import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, Timestamp, collection } from "firebase/firestore";

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

async function testWrite() {
  console.log("Signing in as admin...");
  const cred = await signInWithEmailAndPassword(auth, "admin@cb.amrita.edu", "admin123");
  console.log("Signed in with uid:", cred.user.uid);

  // Test writing a profile doc
  const testUid = "test-student-123";
  try {
    await setDoc(doc(db, "profiles", testUid), {
      uid: testUid,
      fullName: "Test Student",
      email: "test@example.com",
      role: "student",
      rollNo: "TEST1234",
      departmentId: "dept-001",
      sectionId: "sec-001",
      semesterId: "sem-003",
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log("Write SUCCESSFUL as authenticated admin!");
  } catch (err) {
    console.error("Write FAILED:", err.message);
  }
}

testWrite().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
