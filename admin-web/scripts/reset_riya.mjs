import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

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

async function resetRiya() {
  const email = "bl.en.u4ece25134@bl.students.amrita.edu";
  console.log("Sending password reset email to:", email);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset link sent successfully to:", email);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

resetRiya().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
