import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUboKNc2v24MtCO0e8r_JCJrjNoh5zbno",
  authDomain: "amrita-event.firebaseapp.com",
  projectId: "amrita-event",
  storageBucket: "amrita-event.firebasestorage.app",
  messagingSenderId: "718126812694",
  appId: "1:718126812694:web:612200c8ee700d5575af37",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testUnauthRead() {
  console.log("Testing unauthenticated read from profiles where email == test...");
  try {
    const qs = await getDocs(query(collection(db, "profiles"), where("email", "==", "bl.en.u4ece25101@bl.students.amrita.edu")));
    console.log("Unauthenticated read SUCCESS! Found docs:", qs.docs.length);
    if (!qs.empty) {
      console.log("Doc data:", qs.docs[0].data());
    }
  } catch (err) {
    console.error("Unauthenticated read FAILED:", err.message);
  }
}

testUnauthRead().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
