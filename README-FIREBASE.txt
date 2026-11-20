SERATIMAS ENTERPRISE - FIREBASE SETUP

This version keeps the existing page design and uses Firebase Email/Password Authentication
plus Cloud Firestore for documents, company settings and numbering counters.

BEFORE DEPLOYING
1. In Firebase Console > Authentication > Get started > Sign-in method, enable Email/Password.
2. Enable Email/Password and ensure your deployed site domain is listed under Authentication >
   Settings > Authorized domains. Users can create accounts from the login screen; new accounts
   must verify their email before signing in and accessing the workspace. Password reset is also
   available from the login screen.
3. In Firestore Database, create the database.
4. Open Firestore > Rules, replace the rules with the contents of firestore.rules, and Publish.
   Every email-verified account can read and modify the shared Seratimas workspace. Signed-in
   users can change their profile name and password from Profile.
   Manage signers in Company settings, then use Add signature in the editor or on a saved
   document to apply one. In the editor, save the document to keep the signature change.
   Enter an optional document title in the editor to display it between the client details
   and the items table.
5. Deploy the complete doc-maker folder to Netlify. Do not deploy only index.html.
6. Open the Netlify HTTPS URL and sign in with the Firebase user's email and password.
Use the Sync button in the header to refresh this device from the shared Firebase workspace;
pending cloud saves are completed before the refresh.

DATA MIGRATION
On the first successful sign-in for a Firebase account, this browser's existing LocalStorage
records, counters and company settings are uploaded to that account if its cloud workspace is
empty. Existing local data on another computer/browser is not automatically included; sign in
there only after exporting a backup, then use Restore backup in the app to import it.

IMPORTANT
- Firebase web config is visible in browser code by design. Security comes from Authentication
  and Firestore Security Rules, not from hiding the web config.
- Public registration is enabled: anyone who verifies an email can access and modify shared
  company documents. Only enable this if all registrants are trusted.
- Keep regular JSON backups. Test with a small sample before relying on the app for live records.
- The app requires an internet connection for sign-in and cloud synchronisation. Printing and
  some cached page functions may still work offline, but cloud saves require connectivity.
