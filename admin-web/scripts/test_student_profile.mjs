import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

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

async function testProfile() {
  const cred = await signInWithEmailAndPassword(auth, "bl.en.u4ece25101@bl.students.amrita.edu", "Amrita@123");
  console.log("Logged in with UID:", cred.user.uid);

  // Check profiles/UID
  const snap = await getDoc(doc(db, "profiles", cred.user.uid));
  console.log("profiles/UID exists?", snap.exists());
  if (snap.exists()) console.log("profiles/UID data:", snap.data());

  // Check query by email
  const qs = await getDocs(query(collection(db, "profiles"), where("email", "==", "bl.en.u4ece25101@bl.students.amrita.edu")));
  console.log("query by email found docs:", qs.docs.length);
  qs.docs.forEach(d => {
    console.log(`Doc ID: ${d.id}, data:`, d.data());
  });
}

testProfile().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
