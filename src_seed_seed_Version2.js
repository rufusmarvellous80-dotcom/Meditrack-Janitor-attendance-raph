/**
 * Seed script for Firebase Realtime Database (Node.js)
 * Usage:
 *   1. Create a Firebase service account JSON and save as src/seed/serviceAccountKey.json
 *   2. Update DATABASE_URL below to match your Firebase Realtime DB URL
 *   3. Install firebase-admin: npm install firebase-admin
 *   4. Run: node ./src/seed/seed.js  (or npm run seed if package.json has the script)
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// CHANGE this to your database URL (same as in firebase.js)
const DATABASE_URL = "https://med-attendance-2025-default-rtdb.firebaseio.com";

if (!serviceAccount) {
  console.error("Missing serviceAccountKey.json in src/seed/");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

const db = admin.database();

async function seed() {
  try {
    // Sample staff
    const staff = {
      j1: { name: "Janitor One", role: "Janitor", facility: "General Hospital" },
      j2: { name: "Janitor Two", role: "Janitor", facility: "General Hospital" },
      j3: { name: "Janitor Three", role: "Janitor", facility: "LASUCOM" },
      s1: { name: "Security One", role: "Security", facility: "General Hospital" },
      s2: { name: "Security Two", role: "Security", facility: "LASUCOM" }
    };

    // Example simple shifts for today and next two days
    const today = new Date();
    function fmt(d) { return d.toISOString().slice(0,10); }
    const shifts = {};
    const d0 = fmt(today);
    const d1 = fmt(new Date(today.getTime() + 86400000));
    const d2 = fmt(new Date(today.getTime() + 86400000 * 2));

    shifts[d0] = {
      "general hospital": {
        morning: { staff: ["j1","j2"], supervisor: "j1" },
        night: { staff: ["j2"], supervisor: "j2" },
      },
      "lasucom": {
        morning: { staff: ["j3"], supervisor: "j3" }
      }
    };
    shifts[d1] = {
      "general hospital": {
        morning: { staff: ["j2"], supervisor: "j2" },
        night: { staff: ["j1"], supervisor: "j1" }
      }
    };
    shifts[d2] = {
      "lasucom": {
        security: { staff: ["s2"], supervisor: "s2" }
      }
    };

    // Write staff
    await db.ref("staff").set(staff);
    console.log("seeded /staff");

    // Write shifts
    await db.ref("shifts").set(shifts);
    console.log("seeded /shifts");

    // Optionally seed a sample admin user mapping in /users (this is not the auth user creation)
    await db.ref("users").set({
      sampleAdmin: { email: "admin@example.com", role: "admin", note: "Create a real admin user via AuthAdmin or Firebase console" }
    });
    console.log("seeded /users (sample)");

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();