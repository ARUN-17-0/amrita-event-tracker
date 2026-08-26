import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";

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

async function testRules() {
  console.log("Testing unauthenticated write to profiles...");
  try {
    await setDoc(doc(db, "profiles", "random-unauth-id"), { test: true });
    console.log("Unauthenticated write: ALLOWED");
  } catch (e) {
    console.log("Unauthenticated write: DENIED ->", e.message);
  }

  console.log("\nSigning in as admin (admin@cb.amrita.edu)...");
  const cred = await signInWithEmailAndPassword(auth, "admin@cb.amrita.edu", "admin123");
  console.log("Admin UID:", cred.user.uid);

  console.log("\nTesting authenticated write to profiles/random-id-123...");
  try {
    await setDoc(doc(db, "profiles", "random-id-123"), { test: true });
    console.log("Authenticated write to random ID: ALLOWED");
  } catch (e) {
    console.log("Authenticated write to random ID: DENIED ->", e.message);
  }

  console.log("\nTesting query on profiles where email == test...");
  try {
    const qs = await getDocs(query(collection(db, "profiles"), where("email", "==", "admin@cb.amrita.edu")));
    console.log("Query count:", qs.docs.length);
  } catch (e) {
    console.log("Query failed ->", e.message);
  }
}

testRules().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
