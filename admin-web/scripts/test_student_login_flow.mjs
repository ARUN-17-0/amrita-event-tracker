import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp, collection, query, where } from "firebase/firestore";

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

async function testFlow() {
  const cred = await signInWithEmailAndPassword(auth, "bl.en.u4ece25101@bl.students.amrita.edu", "Amrita@123");
  console.log("Logged in with UID:", cred.user.uid);

  const emailClean = "bl.en.u4ece25101@bl.students.amrita.edu";
  const qs = await getDocs(query(collection(db, 'profiles'), where('email', '==', emailClean)));
  if (!qs.empty) {
    const existingDoc = qs.docs[0];
    const existingData = existingDoc.data();
    console.log("Found profile doc:", existingDoc.id);

    try {
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        ...existingData,
        uid: cred.user.uid,
        updatedAt: serverTimestamp()
      });
      console.log("Successfully wrote profiles/" + cred.user.uid);
    } catch (e) {
      console.error("Failed to write profiles/" + cred.user.uid + " ->", e.message);
    }

    try {
      await deleteDoc(existingDoc.ref);
      console.log("Successfully deleted old profile doc:", existingDoc.id);
    } catch (e) {
      console.error("Failed to delete old profile doc ->", e.message);
    }
  }
}

testFlow().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
