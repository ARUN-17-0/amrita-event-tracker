import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

const passwords = ["Amrita@123", "admin123", "password", "password123", "123456", "Amrita@2025", "Amrita@2024", "bl.en.u4ece25134"];

async function check() {
  for (const pw of passwords) {
    try {
      const cred = await signInWithEmailAndPassword(auth, "bl.en.u4ece25134@bl.students.amrita.edu", pw);
      console.log("SUCCESS for Riya Jayram with password:", pw);
      return;
    } catch {}
  }
  console.log("None of the common passwords matched for Riya Jayram");
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
