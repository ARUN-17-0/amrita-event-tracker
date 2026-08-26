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

async function testLogin(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log(`SUCCESS login for ${email}, UID: ${cred.user.uid}`);
  } catch (err) {
    console.log(`FAILED login for ${email} with password "${password}": ${err.code} - ${err.message}`);
  }
}

async function run() {
  await testLogin("bl.en.u4ece25101@bl.students.amrita.edu", "Amrita@123");
  await testLogin("bl.en.u4ece25101@bl.students.amrita.edu", "admin123");
  await testLogin("bl.en.u4ece25101@bl.students.amrita.edu", "password");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
