import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";

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

const delay = ms => new Promise(r => setTimeout(r, ms));

async function syncAllAuth() {
  console.log("Signing in as admin...");
  await signInWithEmailAndPassword(auth, "admin@cb.amrita.edu", "admin123");
  console.log("Admin authenticated. Fetching student profiles from Firestore...");

  const snap = await getDocs(collection(db, "profiles"));
  console.log(`Total profiles in DB: ${snap.docs.length}`);

  let studentCount = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.role === 'student' || data.role === 'cr') {
      studentCount++;
      const email = data.email;
      const password = data.initialPassword || "Amrita@123";
      console.log(`[${studentCount}] Processing ${data.fullName} (${email})...`);

      // Try creating in auth
      try {
        const app2 = initializeApp(firebaseConfig, "sync-" + studentCount);
        const auth2 = getAuth(app2);
        const cred = await createUserWithEmailAndPassword(auth2, email, password);
        console.log(`  -> Created Auth account, UID: ${cred.user.uid}`);

        // Update profile doc with matching UID
        await setDoc(doc(db, "profiles", cred.user.uid), {
          ...data,
          uid: cred.user.uid,
          updatedAt: Timestamp.now()
        });
        if (docSnap.id !== cred.user.uid) {
          await deleteDoc(docSnap.ref);
        }
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          console.log(`  -> Already exists in Auth`);
        } else {
          console.log(`  -> Note: ${e.code || e.message}`);
        }
      }
      await delay(200);
    }
  }

  console.log(`\nSync finished for ${studentCount} students.`);
}

syncAllAuth().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
