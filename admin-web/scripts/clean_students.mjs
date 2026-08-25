import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

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

async function cleanStudents() {
  console.log("Authenticating as admin...");
  await signInWithEmailAndPassword(auth, "admin@cb.amrita.edu", "admin123");
  console.log("Authenticated.");

  console.log("Cleaning up ONLY student profiles from Firestore...");

  const q = query(collection(db, "profiles"), where("role", "in", ["student", "cr"]));
  const snapshot = await getDocs(q);

  console.log(`Found ${snapshot.docs.length} student/CR records to delete.`);

  let deletedCount = 0;
  for (const docSnap of snapshot.docs) {
    console.log(`Deleting student: ${docSnap.data().fullName} (${docSnap.data().email})`);
    await deleteDoc(docSnap.ref);
    deletedCount++;
  }

  console.log(`\nSuccessfully deleted ${deletedCount} student records.`);
  process.exit(0);
}

cleanStudents().catch(e => {
  console.error("Failed:", e.message);
  process.exit(1);
});
