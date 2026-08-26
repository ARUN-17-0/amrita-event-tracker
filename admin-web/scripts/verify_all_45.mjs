import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function verifyAll() {
  await signInWithEmailAndPassword(auth, "admin@cb.amrita.edu", "admin123");
  const snap = await getDocs(collection(db, "profiles"));
  const students = snap.docs.map(d => d.data()).filter(d => d.role === 'student' || d.role === 'cr');
  console.log(`Verifying login for ALL ${students.length} students...`);

  let successCount = 0;
  for (let i = 0; i < students.length; i++) {
    const data = students[i];
    try {
      const app2 = initializeApp(firebaseConfig, "verify-" + i);
      const auth2 = getAuth(app2);
      const cred = await signInWithEmailAndPassword(auth2, data.email, "Amrita@123");
      console.log(`[${i+1}/${students.length}] OK: ${data.fullName} (${data.email})`);
      successCount++;
    } catch (e) {
      console.log(`[${i+1}/${students.length}] FAIL: ${data.fullName} (${data.email}) -> ${e.code}`);
    }
  }
  console.log(`\nResult: ${successCount} / ${students.length} students can login with Amrita@123`);
}

verifyAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
