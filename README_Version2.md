# Meditrack Limited — Web (meditrack-limited-raph)

This repository contains a React + Vite web app for Meditrack (attendance management) wired to Firebase Realtime Database and Firebase Authentication. It includes:

- Facility + role login UI (facility passwords)
- Admin auth scaffold (register/sign in via Firebase Auth)
- Shift Calendar (admin can assign shifts)
- Attendance entry (attendance persisted to Realtime DB)
- PDF report generation via jsPDF
- Seed script to populate sample staff & shifts

IMPORTANT: This repo contains a Firebase client config (safe for front-end use). For seeding using `src/seed/seed.js` you need a Firebase service account JSON (server-side), as explained below.

---

## Quick start (local)

1. Clone or create the project locally (you will create the GitHub repo later):

```bash
# create project folder and init with these files, or clone your repo once created
git init
# copy files into folder...
```

2. Install dependencies:

```bash
npm install
# If you plan to run the seed script, install firebase-admin too:
npm install firebase-admin --save-dev
```

3. Run the dev server:

```bash
npm run dev
```

4. Open http://localhost:5173

---

## Seeding sample data (Realtime DB)

To run the seed script:

1. In Firebase Console > Project settings > Service accounts, generate a new private key for a service account and download it. Save it as:
   `src/seed/serviceAccountKey.json`

2. Update DATABASE_URL in `src/seed/seed.js` if needed (should match your Realtime Database URL).

3. Install firebase-admin (if not installed above):

```bash
npm i firebase-admin --save-dev
```

4. Run:

```bash
npm run seed
```

This will populate `/staff`, `/shifts`, and a sample `/users` node in your Realtime DB.

---

## Firebase configuration

The Firebase client config is included in `src/firebase.js`. For production you may prefer to use environment variables in Vercel. If you want to use Vercel environment variables instead:

- Remove the firebaseConfig object from the source and read values from env vars.
- In Vercel dashboard > Project > Settings > Environment Variables add keys (e.g. VITE_FIREBASE_API_KEY etc.)
- Vite uses `import.meta.env.VITE_...` for environment variables.

---

## Database rules

A starter `database.rules.json` is included. It is permissive for reads and allows writes in ways helpful for demo. Before production, tighten rules to restrict writes to authenticated admin accounts only.

Recommended next steps:
- Protect `attendance` writes behind admin role checks
- Require auth for reads if needed
- Use Cloud Functions to generate signed reports server-side if you want tamper-proof PDF generation

---

## GitHub & Vercel deployment (step-by-step)

1. Create the public GitHub repo:
   - Repo name: `meditrack-limited-raph`
   - Visibility: public

2. Push local code to GitHub:

```bash
git add .
git commit -m "Initial Meditrack Limited web app"
git branch -M main
git remote add origin https://github.com/<your-username>/meditrack-limited-raph.git
git push -u origin main
```

3. Deploy with Vercel:
   - Sign in to vercel.com with your GitHub account.
   - Choose "Import Project" and select the `meditrack-limited-raph` repo.
   - Vercel auto-detects Vite + React. Click Deploy.
   - After deploy, Vercel provides a public URL.

4. (Optional) Add environment variables in Vercel if you moved firebase config to env vars.

---

## Admin auth & usage notes

- The app includes an Admin Auth page (`/auth-admin`) where you can register/sign-in using Firebase Auth. Register an admin account then sign in to enable admin-only features (Shift assignment etc).
- For quick testing, the legacy admin password "admin" is used in forms (attendance submit) — but for production use the Firebase Auth admin user flow is recommended.

---

## PDF Generation

- The app uses `jspdf` for client-side PDF generation. It produces a simple table-style PDF. If you need more advanced formatting, use `jspdf-autotable` or generate server-side PDFs via Cloud Functions.

---

## Next improvements (suggested)
- Tighten database rules (restrict writes to admins).
- Use per-user authentication for janitors/security and remove shared passwords.
- Add shift rotation automation (2 on morning / 2 on night / 2 off).
- Add test coverage and CI (GitHub Actions).
- Improve PDF layout and include company header/logo.

---

If you want, I can now:
- Provide the exact `git` commands you should run locally to create the repo and push,
- Provide the step-by-step Vercel import screenshots/steps,
- Or produce a small GitHub Actions workflow to run tests/build on push.
