SERATIMAS ENTERPRISE - FIREBASE SETUP

This version keeps the existing page design and uses Firebase Email/Password Authentication
plus Cloud Firestore for documents, company settings and numbering counters.

BEFORE DEPLOYING
1. In Firebase Console > Authentication > Get started > Sign-in method, enable Email/Password.
2. In Authentication > Users, add each authorised user's email and a temporary password.
   The old browser-only usernames/passwords are not migrated; create Firebase accounts for users.
3. In Firestore Database, create the database.
4. Open Firestore > Rules, replace the rules with the contents of firestore.rules, and Publish.
5. Deploy the complete doc-maker folder to Netlify. Do not deploy only index.html.
6. Open the Netlify HTTPS URL and sign in with the Firebase user's email and password.

DATA MIGRATION
On the first successful sign-in for a Firebase account, this browser's existing LocalStorage
records, counters and company settings are uploaded to that account if its cloud workspace is
empty. Existing local data on another computer/browser is not automatically included; sign in
there only after exporting a backup, then use Restore backup in the app to import it.

IMPORTANT
- Firebase web config is visible in browser code by design. Security comes from Authentication
  and Firestore Security Rules, not from hiding the web config.
- Keep the Firestore rules restricted to the signed-in user's UID. Do not publish open rules.
- Keep regular JSON backups. Test with a small sample before relying on the app for live records.
- The app requires an internet connection for sign-in and cloud synchronisation. Printing and
  some cached page functions may still work offline, but cloud saves require connectivity.
