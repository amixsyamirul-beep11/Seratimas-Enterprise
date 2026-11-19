import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

'use strict';

/* ================= translations ================= */
const I18N = {
  en: {
    login_sub: 'Quotation, Invoice & Receipt', username: 'Email address', password: 'Password',
    keep: 'Keep me signed in on this device', signin: 'Sign in', logout: 'Log out',
    forgot_password: 'Forgot password?', create_user: 'Create account',
    reset_sent: 'Password reset email sent. Check your inbox.',
    account_created: 'Account created. Loading your workspace…',
    e_email_required: 'Enter your email address first.',
    e_password_required: 'Enter a password of at least 6 characters.',
    e_email_in_use: 'An account already exists for this email.',
    e_invalid_email: 'Enter a valid email address.',
    e_weak_password: 'Choose a stronger password with at least 6 characters.',
    e_signup_disabled: 'Account creation is not enabled in Firebase Authentication.',
    sync: 'Sync', syncing: 'Syncing…', t_synced: 'Firebase data synced',
    e_sync: 'Could not sync Firebase data. Please check your connection and try again.',
    login_bad: 'Wrong username or password.', login_locked: 'Too many attempts. Try again in {n} seconds.',
    login_https: 'Login needs a secure page (https or localhost).',
    nav_saved: 'Saved', nav_editor: 'New / Edit', nav_company: 'Company',
    online: 'Online', offline: 'Offline',
    new_quotation: '+ Quotation', new_invoice: '+ Invoice', new_receipt: '+ Receipt',
    all_types: 'All types', quotations: 'Quotations', invoices: 'Invoices', receipts: 'Receipts',
    search_ph: 'Search number or client',
    th_number: 'Number', th_type: 'Type', th_client: 'Client', th_date: 'Date', th_total: 'Total', th_actions: 'Actions',
    backup: 'Backup (download)', restore: 'Restore backup',
    hint_storage: 'Your documents are synchronised to your secure cloud database. Use Backup regularly.',
    type_quotation: 'Quotation', type_invoice: 'Invoice', type_receipt: 'Receipt',
    f_type: 'Type', f_number: 'Number', f_date: 'Date', f_due: 'Due date', f_valid: 'Valid until',
    f_ref: 'Reference (optional)', f_ref_ph: 'e.g. PO number or previous document', f_doclang: 'Document language',
    h_client: 'Client', f_name: 'Name', f_address: 'Address', f_phone: 'Phone', f_email: 'Email',
    h_items: 'Items', f_desc: 'Description', f_qty: 'Qty', f_price: 'Unit price', add_item: '+ Add item',
    f_discount: 'Discount (amount)', f_tax: 'Tax / SST (%)', f_paid: 'Payment date', f_method: 'Payment method',
    f_method_ph: 'Cash / Bank transfer / Cheque', f_notes: 'Notes', f_terms: 'Terms & conditions',
    save: 'Save', print: 'Print / Save PDF', make_invoice: 'Make Invoice', make_receipt: 'Make Receipt', back: 'Back',
    h_company: 'Company details', s_name: 'Company name', s_reg: 'Registration no.', s_currency: 'Currency symbol',
    s_tax: 'Default tax / SST (%)', s_bank: 'Bank details (shown on quotation and invoice)',
    s_terms: 'Default terms & conditions', s_logo: 'Logo', s_save: 'Save company details', s_rmlogo: 'Remove logo',
    a_edit: 'Edit', a_dup: 'Duplicate', a_toinv: '→ Invoice', a_torc: '→ Receipt', a_del: 'Delete',
    empty: 'No documents yet. Click + Quotation, + Invoice or + Receipt.',
    t_saved: 'Saved', t_company: 'Company details saved', t_logo: 'Logo added', t_restored: 'Backup restored',
    c_noclient: 'Client name is empty. Save anyway?', c_delete: 'Delete {n}? This cannot be undone.',
    e_backup: 'This file is not a valid backup.', e_storage: 'Could not save: browser storage is full or blocked.',
    p_valid: 'Valid until', p_due: 'Due date', p_ref: 'Ref', p_tel: 'Tel', p_reg: 'Reg. No',
    p_billto: 'Bill to', p_from: 'Received from', p_date: 'Date', p_no: 'No.',
    p_amount: 'Amount', p_sub: 'Subtotal', p_disc: 'Discount', p_tax: 'Tax', p_total: 'Total',
    p_received: 'Amount received', p_payment: 'Payment received', p_method: 'Method',
    p_notes: 'Notes', p_bank: 'Bank details', p_terms: 'Terms & conditions',
    p_accept: 'Customer acceptance', p_recby: 'Received by', p_sign: 'Authorised signature',
    p_company_ph: 'Your Company Name'
  },
  ms: {
    login_sub: 'Sebut Harga, Invois & Resit', username: 'Alamat e-mel', password: 'Kata laluan',
    keep: 'Kekalkan log masuk pada peranti ini', signin: 'Log masuk', logout: 'Log keluar',
    forgot_password: 'Lupa kata laluan?', create_user: 'Cipta akaun',
    reset_sent: 'E-mel tetapan semula kata laluan telah dihantar. Semak peti masuk anda.',
    account_created: 'Akaun dicipta. Memuatkan ruang kerja…',
    e_email_required: 'Masukkan alamat e-mel anda dahulu.',
    e_password_required: 'Masukkan kata laluan sekurang-kurangnya 6 aksara.',
    e_email_in_use: 'Akaun untuk e-mel ini sudah wujud.',
    e_invalid_email: 'Masukkan alamat e-mel yang sah.',
    e_weak_password: 'Pilih kata laluan lebih kukuh sekurang-kurangnya 6 aksara.',
    e_signup_disabled: 'Penciptaan akaun tidak diaktifkan dalam Firebase Authentication.',
    sync: 'Segerakkan', syncing: 'Menyegerakkan…', t_synced: 'Data Firebase disegerakkan',
    e_sync: 'Data Firebase tidak dapat disegerakkan. Sila periksa sambungan dan cuba lagi.',
    login_bad: 'Nama pengguna atau kata laluan salah.', login_locked: 'Terlalu banyak percubaan. Cuba lagi dalam {n} saat.',
    login_https: 'Log masuk memerlukan halaman selamat (https atau localhost).',
    nav_saved: 'Tersimpan', nav_editor: 'Baharu / Sunting', nav_company: 'Syarikat',
    online: 'Dalam talian', offline: 'Luar talian',
    new_quotation: '+ Sebut Harga', new_invoice: '+ Invois', new_receipt: '+ Resit',
    all_types: 'Semua jenis', quotations: 'Sebut Harga', invoices: 'Invois', receipts: 'Resit',
    search_ph: 'Cari nombor atau pelanggan',
    th_number: 'Nombor', th_type: 'Jenis', th_client: 'Pelanggan', th_date: 'Tarikh', th_total: 'Jumlah', th_actions: 'Tindakan',
    backup: 'Sandaran (muat turun)', restore: 'Pulihkan sandaran',
    hint_storage: 'Dokumen anda disegerakkan ke pangkalan data awan. Sila buat sandaran dengan kerap.',
    type_quotation: 'Sebut Harga', type_invoice: 'Invois', type_receipt: 'Resit',
    f_type: 'Jenis', f_number: 'Nombor', f_date: 'Tarikh', f_due: 'Tarikh akhir bayaran', f_valid: 'Sah sehingga',
    f_ref: 'Rujukan (pilihan)', f_ref_ph: 'cth. No. PO atau dokumen terdahulu', f_doclang: 'Bahasa dokumen',
    h_client: 'Pelanggan', f_name: 'Nama', f_address: 'Alamat', f_phone: 'Telefon', f_email: 'E-mel',
    h_items: 'Item', f_desc: 'Perihal', f_qty: 'Kts', f_price: 'Harga seunit', add_item: '+ Tambah item',
    f_discount: 'Diskaun (jumlah)', f_tax: 'Cukai / SST (%)', f_paid: 'Tarikh bayaran', f_method: 'Kaedah bayaran',
    f_method_ph: 'Tunai / Pindahan bank / Cek', f_notes: 'Catatan', f_terms: 'Terma & syarat',
    save: 'Simpan', print: 'Cetak / Simpan PDF', make_invoice: 'Buat Invois', make_receipt: 'Buat Resit', back: 'Kembali',
    h_company: 'Maklumat syarikat', s_name: 'Nama syarikat', s_reg: 'No. pendaftaran', s_currency: 'Simbol mata wang',
    s_tax: 'Cukai / SST lalai (%)', s_bank: 'Butiran bank (dipaparkan pada sebut harga dan invois)',
    s_terms: 'Terma & syarat lalai', s_logo: 'Logo', s_save: 'Simpan maklumat syarikat', s_rmlogo: 'Buang logo',
    a_edit: 'Sunting', a_dup: 'Salin', a_toinv: '→ Invois', a_torc: '→ Resit', a_del: 'Padam',
    empty: 'Belum ada dokumen. Klik + Sebut Harga, + Invois atau + Resit.',
    t_saved: 'Disimpan', t_company: 'Maklumat syarikat disimpan', t_logo: 'Logo ditambah', t_restored: 'Sandaran dipulihkan',
    c_noclient: 'Nama pelanggan kosong. Simpan juga?', c_delete: 'Padam {n}? Tindakan ini tidak boleh dibatalkan.',
    e_backup: 'Fail ini bukan fail sandaran yang sah.', e_storage: 'Gagal menyimpan: storan pelayar penuh atau disekat.',
    p_valid: 'Sah sehingga', p_due: 'Tarikh akhir bayaran', p_ref: 'Rujukan', p_tel: 'Tel', p_reg: 'No. Pendaftaran',
    p_billto: 'Kepada', p_from: 'Diterima daripada', p_date: 'Tarikh', p_no: 'No.',
    p_amount: 'Amaun', p_sub: 'Jumlah kecil', p_disc: 'Diskaun', p_tax: 'Cukai', p_total: 'Jumlah',
    p_received: 'Jumlah diterima', p_payment: 'Bayaran diterima', p_method: 'Kaedah',
    p_notes: 'Catatan', p_bank: 'Butiran bank', p_terms: 'Terma & syarat',
    p_accept: 'Pengesahan pelanggan', p_recby: 'Diterima oleh', p_sign: 'Tandatangan yang sah',
    p_company_ph: 'Nama Syarikat Anda'
  }
};

let lang = (localStorage.getItem('docmaker.lang') === 'ms') ? 'ms' : 'en';
const tr = (k, l) => (I18N[l || lang] && I18N[l || lang][k]) || I18N.en[k] || k;
const t = k => tr(k, lang);

/* ================= Firebase authentication ================= */
let firebaseUser = null;
let cloudReady = false;
let cloudWriteQueue = Promise.resolve();
let knownCloudDocIds = new Set();
let cloudSyncing = false;

// All signed-in accounts use this one shared Firestore workspace.
const SHARED_DOCS = collection(db, 'workspaces', 'seratimas', 'documents');
const SHARED_SETTINGS = doc(db, 'workspaces', 'seratimas', 'private', 'settings');
const SHARED_COUNTERS = doc(db, 'workspaces', 'seratimas', 'private', 'counters');

function enterApp(name) {
  document.body.classList.remove('locked');
  $('#userName').textContent = name || '';
  $('#loginErr').classList.add('hidden');
  show('list');
}

function showLoginError(msg) {
  const e = $('#loginErr');
  e.textContent = msg;
  e.classList.remove('notice');
  e.classList.remove('hidden');
}

function showLoginNotice(msg) {
  const e = $('#loginErr');
  e.textContent = msg;
  e.classList.add('notice');
  e.classList.remove('hidden');
}

async function loadCloudWorkspace(user) {
  // Read this account's old private data and the shared workspace.
  // Old records are copied, never moved or deleted.
  const legacyDocsRef = collection(db, 'users', user.uid, 'documents');
  const [legacyDocsSnap, legacySettingsSnap, legacyCountersSnap,
         sharedDocsSnap, sharedSettingsSnap, sharedCountersSnap] = await Promise.all([
    getDocs(legacyDocsRef),
    getDoc(doc(db, 'users', user.uid, 'private', 'settings')),
    getDoc(doc(db, 'users', user.uid, 'private', 'counters')),
    getDocs(SHARED_DOCS),
    getDoc(SHARED_SETTINGS),
    getDoc(SHARED_COUNTERS)
  ]);

  // Copy any legacy documents that are not already in the shared workspace.
  // This also safely handles a second account that has no old records.
  const sharedIds = new Set(sharedDocsSnap.docs.map(x => x.id));
  let batch = writeBatch(db);
  let batchCount = 0;
  for (const oldDoc of legacyDocsSnap.docs) {
    if (!sharedIds.has(oldDoc.id)) {
      batch.set(doc(SHARED_DOCS, oldDoc.id), oldDoc.data());
      batchCount++;
      if (batchCount === 450) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  }
  if (batchCount) await batch.commit();

  // Use the first available company settings. Do not replace settings already
  // established in the shared workspace.
  if (!sharedSettingsSnap.exists() && legacySettingsSnap.exists()) {
    await setDoc(SHARED_SETTINGS, legacySettingsSnap.data());
  }

  // Keep the highest document-number counters to avoid reusing numbers.
  const oldCounters = legacyCountersSnap.exists() ? (legacyCountersSnap.data().value || {}) : {};
  const sharedCounters = sharedCountersSnap.exists() ? (sharedCountersSnap.data().value || {}) : {};
  const mergedCounters = { ...sharedCounters };
  for (const [key, value] of Object.entries(oldCounters)) {
    mergedCounters[key] = Math.max(Number(mergedCounters[key] || 0), Number(value || 0));
  }
  if (Object.keys(mergedCounters).length &&
      (!sharedCountersSnap.exists() || JSON.stringify(mergedCounters) !== JSON.stringify(sharedCounters))) {
    await setDoc(SHARED_COUNTERS, { value: mergedCounters });
  }

  // Load the latest shared data after migration has completed.
  const [finalDocsSnap, finalSettingsSnap, finalCountersSnap] = await Promise.all([
    getDocs(SHARED_DOCS), getDoc(SHARED_SETTINGS), getDoc(SHARED_COUNTERS)
  ]);
  docs = finalDocsSnap.docs.map(x => ({ ...x.data(), id: x.id }));
  knownCloudDocIds = new Set(finalDocsSnap.docs.map(x => x.id));

  const defaultSettings = {
    name: 'Seratimas Enterprise', regNo: '', address: '', phone: '', email: '',
    currency: 'RM', taxRate: 0, bank: '', terms: '', logo: ''
  };
  settings = Object.assign(defaultSettings,
    finalSettingsSnap.exists() ? finalSettingsSnap.data() : {});
  counters = finalCountersSnap.exists() ? (finalCountersSnap.data().value || {}) : {};

  store.setLocal('docs', docs);
  store.setLocal('settings', settings);
  store.setLocal('counters', counters);
  cloudReady = true;
  updateLoginLogo();
  fillSettings();
  renderList();
  if (current) renderPreview();
}

async function syncDocuments(items) {
  const existing = await getDocs(SHARED_DOCS);
  const keep = new Set(items.filter(x => x.id).map(x => String(x.id)));
  let batch = writeBatch(db);
  let count = 0;

  // Save current documents to the shared workspace.
  for (const item of items) {
    if (!item.id) continue;
    batch.set(doc(SHARED_DOCS, String(item.id)), item);
    count++;
    if (count === 450) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }

  // Delete only records this browser previously loaded and the user removed.
  // This avoids deleting documents newly created by the other account.
  for (const old of existing.docs) {
    if (knownCloudDocIds.has(old.id) && !keep.has(old.id)) {
      batch.delete(old.ref);
      count++;
      if (count === 450) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
  }
  if (count) await batch.commit();

  // Remember every record currently present so later intentional deletions work.
  const refreshed = await getDocs(SHARED_DOCS);
  knownCloudDocIds = new Set(refreshed.docs.map(x => x.id));
}

function queueCloudSave(key, value) {
  if (!firebaseUser || !cloudReady) return;
  cloudWriteQueue = cloudWriteQueue.then(async () => {
    if (key === 'docs') {
      await syncDocuments(value);
    } else if (key === 'settings') {
      await setDoc(SHARED_SETTINGS, value);
    } else if (key === 'counters') {
      const snap = await getDoc(SHARED_COUNTERS);
      const currentCounters = snap.exists() ? (snap.data().value || {}) : {};
      const merged = { ...currentCounters };
      for (const [k, v] of Object.entries(value || {})) {
        merged[k] = Math.max(Number(merged[k] || 0), Number(v || 0));
      }
      await setDoc(SHARED_COUNTERS, { value: merged });
    }
  }).catch(err => {
    console.error('Firebase save failed:', err);
    toast('Cloud save failed. Please check your connection and try again.');
  });
}

function logout() { signOut(auth).catch(err => console.error('Sign-out failed:', err)); }

async function syncNow() {
  if (!firebaseUser || !cloudReady || cloudSyncing) return;
  const user = firebaseUser;
  cloudSyncing = true;
  $('#btnSync').disabled = true;
  $('#btnSync').textContent = t('syncing');
  try {
    await cloudWriteQueue;
    if (firebaseUser !== user) return;
    await loadCloudWorkspace(user);
    if (firebaseUser === user) toast(t('t_synced'));
  } catch (err) {
    console.error('Firebase sync failed:', err);
    toast(t('e_sync'));
  } finally {
    cloudSyncing = false;
    $('#btnSync').disabled = !firebaseUser || !cloudReady;
    $('#btnSync').textContent = t('sync');
  }
}

/* ================= helpers ================= */
function $(s, r = document) { return r.querySelector(s); }
function $$(s, r = document) { return [...r.querySelectorAll(s)]; }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const money = n => Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clone = o => JSON.parse(JSON.stringify(o));
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.split('-').reverse().join('/') : (s || '');

const store = {
  get(k, d) { try { const v = localStorage.getItem('docmaker.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  setLocal(k, v) {
    try { localStorage.setItem('docmaker.' + k, JSON.stringify(v)); return true; }
    catch (e) { alert(t('e_storage')); return false; }
  },
  set(k, v) {
    const ok = this.setLocal(k, v);
    if (ok) queueCloudSave(k, v);
    return ok;
  }
};

const PREFIX = { quotation: 'QT', invoice: 'INV', receipt: 'RC' };
const typeLabel = (type, l) => tr('type_' + type, l);

/* ================= state ================= */
let docs = store.get('docs', []);
let counters = store.get('counters', {});
let settings = Object.assign(
  { name: '', regNo: '', address: '', phone: '', email: '', currency: 'RM', taxRate: 0, bank: '', terms: '', logo: '' },
  store.get('settings', {})
);
function updateLoginLogo() {
  $('#loginLogo').src = settings.logo || 'icon.svg';
}
updateLoginLogo();
if (!settings.name) { settings.name = 'Seratimas Enterprise'; store.set('settings', settings); }
let current = null;

function totals(d) {
  const sub = d.items.reduce((s, i) => s + (+i.qty || 0) * (+i.price || 0), 0);
  const disc = Math.min(+d.discount || 0, sub);
  const taxable = sub - disc;
  const tax = taxable * (+d.taxRate || 0) / 100;
  return { sub, disc, tax, total: taxable + tax };
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.add('hidden'), 2200);
}

function show(view) {
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + view));
  $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'list') renderList();
  if (view === 'settings') fillSettings();
}

/* ================= language ================= */
function applyLang() {
  document.documentElement.lang = lang === 'ms' ? 'ms' : 'en';
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $('#btnLang').textContent = lang === 'ms' ? 'EN' : 'BM';
  $('#btnLangLogin').textContent = lang === 'ms' ? 'English' : 'Bahasa Melayu';
  $('#btnSync').textContent = cloudSyncing ? t('syncing') : t('sync');
  updateNet();
  if (current) { toggleTypeFields(); renderPreview(); }
  renderList();
}
function toggleLang() {
  lang = lang === 'ms' ? 'en' : 'ms';
  localStorage.setItem('docmaker.lang', lang);
  applyLang();
}

/* ================= documents ================= */
function makeNumber(type) {
  const y = new Date().getFullYear();
  const n = (counters[type + y] || 0) + 1;
  return `${PREFIX[type]}-${y}-${String(n).padStart(4, '0')}`;
}

function newDoc(type) {
  return {
    id: uid(), type, number: makeNumber(type), date: todayStr(), due: '', ref: '', lang,
    client: { name: '', address: '', phone: '', email: '' },
    items: [{ desc: '', qty: 1, price: 0 }],
    discount: 0, taxRate: settings.taxRate || 0,
    notes: '', terms: settings.terms || '',
    paid: type === 'receipt' ? todayStr() : '', method: '',
    isNew: true, updated: Date.now()
  };
}

function convertDoc(src, to) {
  const d = newDoc(to);
  Object.assign(d, {
    client: clone(src.client), items: clone(src.items), lang: src.lang || lang,
    discount: src.discount, taxRate: src.taxRate, notes: src.notes, ref: src.number
  });
  openEditor(d);
}

function openEditor(d) {
  current = d;
  fillForm();
  show('editor');
  renderPreview();
}

function fillForm() {
  const d = current;
  $('#f-type').value = d.type;
  $('#f-number').value = d.number;
  $('#f-date').value = d.date;
  $('#f-due').value = d.due;
  $('#f-ref').value = d.ref;
  $('#f-lang').value = d.lang || 'en';
  $('#f-cname').value = d.client.name;
  $('#f-caddr').value = d.client.address;
  $('#f-cphone').value = d.client.phone;
  $('#f-cemail').value = d.client.email;
  $('#f-discount').value = d.discount;
  $('#f-tax').value = d.taxRate;
  $('#f-notes').value = d.notes;
  $('#f-terms').value = d.terms;
  $('#f-paid').value = d.paid;
  $('#f-method').value = d.method;
  renderItems();
  toggleTypeFields();
}

function toggleTypeFields() {
  const ty = current.type;
  $('#lbl-due-text').textContent = ty === 'quotation' ? t('f_valid') : t('f_due');
  $('#lbl-due').classList.toggle('hidden', ty === 'receipt');
  $('#receiptFields').classList.toggle('hidden', ty !== 'receipt');
  $('#lbl-terms').classList.toggle('hidden', ty !== 'quotation');
  $('#btnToInvoice').classList.toggle('hidden', ty !== 'quotation');
  $('#btnToReceipt').classList.toggle('hidden', ty === 'receipt');
}

function renderItems() {
  $('#items').innerHTML = current.items.map((it, i) => `
    <div class="item" data-i="${i}">
      <input class="it-desc" placeholder="${esc(t('f_desc'))}" value="${esc(it.desc)}">
      <input class="it-qty" type="number" min="0" step="any" value="${esc(it.qty)}">
      <input class="it-price" type="number" min="0" step="any" value="${esc(it.price)}">
      <button type="button" class="del" data-del="${i}" title="&times;">&#10005;</button>
    </div>`).join('');
}

function readForm() {
  const d = current;
  d.type = $('#f-type').value;
  d.number = $('#f-number').value.trim();
  d.date = $('#f-date').value;
  d.due = $('#f-due').value;
  d.ref = $('#f-ref').value;
  d.lang = $('#f-lang').value;
  d.client = {
    name: $('#f-cname').value, address: $('#f-caddr').value,
    phone: $('#f-cphone').value, email: $('#f-cemail').value
  };
  d.items = $$('#items .item').map(r => ({
    desc: $('.it-desc', r).value, qty: $('.it-qty', r).value, price: $('.it-price', r).value
  }));
  d.discount = $('#f-discount').value;
  d.taxRate = $('#f-tax').value;
  d.notes = $('#f-notes').value;
  d.terms = $('#f-terms').value;
  d.paid = $('#f-paid').value;
  d.method = $('#f-method').value;
}

function saveDoc() {
  readForm();
  if (!current.client.name.trim() && !confirm(t('c_noclient'))) return false;
  const d = clone(current);
  if (d.isNew) {
    const k = d.type + new Date().getFullYear();
    counters[k] = (counters[k] || 0) + 1;
    store.set('counters', counters);
    delete d.isNew;
    delete current.isNew;
  }
  d.updated = Date.now();
  const i = docs.findIndex(x => x.id === d.id);
  if (i >= 0) docs[i] = d; else docs.push(d);
  if (store.set('docs', docs)) toast(t('t_saved'));
  return true;
}

/* ================= preview (uses the document's own language) ================= */
function renderPreview() {
  const d = current, s = settings, tt = totals(d), cur = esc(s.currency || '');
  const L = k => tr(k, d.lang || 'en');
  const label = typeLabel(d.type, d.lang || 'en').toUpperCase();
  let dueLine = '';
  if (d.type === 'quotation' && d.due) dueLine = `<div>${L('p_valid')}: ${esc(fmtDate(d.due))}</div>`;
  if (d.type === 'invoice' && d.due) dueLine = `<div>${L('p_due')}: ${esc(fmtDate(d.due))}</div>`;

  const rows = d.items.map((it, i) => {
    const amt = (+it.qty || 0) * (+it.price || 0);
    return `<tr><td>${i + 1}</td><td class="pre">${esc(it.desc)}</td><td class="r">${esc(it.qty)}</td>
      <td class="r">${money(it.price)}</td><td class="r">${money(amt)}</td></tr>`;
  }).join('');

  const receiptBlock = d.type === 'receipt' ? `
    <div class="p-foot"><h4>${L('p_payment')}</h4>
      <div>${L('p_date')}: ${esc(fmtDate(d.paid))}</div>
      ${d.method ? `<div>${L('p_method')}: ${esc(d.method)}</div>` : ''}
    </div>` : '';

  $('#paper').innerHTML = `
    <div class="p-head">
      <div class="p-co">
        ${s.logo ? `<img class="logo" src="${s.logo}" alt="">` : ''}
        <div>
          <b class="co-name">${esc(s.name || L('p_company_ph'))}</b>
          ${s.regNo ? `<div>${L('p_reg')}: ${esc(s.regNo)}</div>` : ''}
          <div class="pre">${esc(s.address)}</div>
          ${s.phone ? `<div>${L('p_tel')}: ${esc(s.phone)}</div>` : ''}
          ${s.email ? `<div>${esc(s.email)}</div>` : ''}
        </div>
      </div>
      <div class="p-title">
        <h2>${esc(label)}</h2>
        <div>${L('p_no')} ${esc(d.number)}</div>
        <div>${L('p_date')}: ${esc(fmtDate(d.date))}</div>
        ${dueLine}
        ${d.ref ? `<div>${L('p_ref')}: ${esc(d.ref)}</div>` : ''}
      </div>
    </div>
    <div class="p-to">
      <div class="lbl">${d.type === 'receipt' ? L('p_from') : L('p_billto')}</div>
      <b>${esc(d.client.name)}</b>
      <div class="pre">${esc(d.client.address)}</div>
      ${d.client.phone ? `<div>${L('p_tel')}: ${esc(d.client.phone)}</div>` : ''}
      ${d.client.email ? `<div>${esc(d.client.email)}</div>` : ''}
    </div>
    <table>
      <thead><tr><th style="width:30px">#</th><th>${L('f_desc')}</th><th class="r" style="width:60px">${L('f_qty')}</th>
        <th class="r" style="width:100px">${L('f_price')}</th><th class="r" style="width:110px">${L('p_amount')}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="p-tot">
      <div><span>${L('p_sub')}</span><span>${cur} ${money(tt.sub)}</span></div>
      ${tt.disc ? `<div><span>${L('p_disc')}</span><span>- ${cur} ${money(tt.disc)}</span></div>` : ''}
      ${+d.taxRate ? `<div><span>${L('p_tax')} (${esc(d.taxRate)}%)</span><span>${cur} ${money(tt.tax)}</span></div>` : ''}
      <div class="grand"><span>${d.type === 'receipt' ? L('p_received') : L('p_total')}</span><span>${cur} ${money(tt.total)}</span></div>
    </div>
    ${receiptBlock}
    <div class="p-foot">
      ${d.notes ? `<h4>${L('p_notes')}</h4><div class="pre">${esc(d.notes)}</div>` : ''}
      ${d.type !== 'receipt' && s.bank ? `<h4>${L('p_bank')}</h4><div class="pre">${esc(s.bank)}</div>` : ''}
      ${d.type === 'quotation' && d.terms ? `<h4>${L('p_terms')}</h4><div class="pre">${esc(d.terms)}</div>` : ''}
    </div>
    <div class="sign"><div>${d.type === 'quotation' ? L('p_accept') : L('p_recby')}</div><div>${L('p_sign')}</div></div>`;
}

/* ================= list ================= */
function renderList() {
  const type = $('#flt-type').value, q = $('#flt-q').value.toLowerCase();
  const rows = docs
    .filter(d => (!type || d.type === type) && (!q || (d.number + ' ' + d.client.name).toLowerCase().includes(q)))
    .sort((a, b) => b.updated - a.updated);
  $('#listBody').innerHTML = rows.map(d => `
    <tr>
      <td><b>${esc(d.number)}</b></td>
      <td>${esc(typeLabel(d.type))}</td>
      <td>${esc(d.client.name)}</td>
      <td>${esc(fmtDate(d.date))}</td>
      <td class="r">${esc(settings.currency)} ${money(totals(d).total)}</td>
      <td class="r actions-cell">
        <button data-a="edit" data-id="${d.id}">${t('a_edit')}</button>
        <button data-a="dup" data-id="${d.id}">${t('a_dup')}</button>
        ${d.type === 'quotation' ? `<button data-a="toinv" data-id="${d.id}">${t('a_toinv')}</button>` : ''}
        ${d.type !== 'receipt' ? `<button data-a="torc" data-id="${d.id}">${t('a_torc')}</button>` : ''}
        <button data-a="del" data-id="${d.id}">${t('a_del')}</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="6" class="empty">${esc(t('empty'))}</td></tr>`;
}

/* ================= settings ================= */
function fillSettings() {
  $('#s-name').value = settings.name;
  $('#s-reg').value = settings.regNo;
  $('#s-address').value = settings.address;
  $('#s-phone').value = settings.phone;
  $('#s-email').value = settings.email;
  $('#s-currency').value = settings.currency;
  $('#s-tax').value = settings.taxRate;
  $('#s-bank').value = settings.bank;
  $('#s-terms').value = settings.terms;
  $('#logoPreview').innerHTML = settings.logo ? `<img src="${settings.logo}" class="logo" alt="logo">` : '';
}

function saveSettings() {
  Object.assign(settings, {
    name: $('#s-name').value, regNo: $('#s-reg').value, address: $('#s-address').value,
    phone: $('#s-phone').value, email: $('#s-email').value,
    currency: $('#s-currency').value, taxRate: $('#s-tax').value,
    bank: $('#s-bank').value, terms: $('#s-terms').value
  });
  if (store.set('settings', settings)) toast(t('t_company'));
}

function handleLogo(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 300, scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      settings.logo = c.toDataURL('image/png');
      store.set('settings', settings);
      updateLoginLogo();
      fillSettings();
      toast(t('t_logo'));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ================= backup ================= */
function exportBackup() {
  const blob = new Blob([JSON.stringify({ docs, settings, counters }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `seratimas-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.docs)) throw new Error('bad file');
      data.docs.forEach(nd => {
        const i = docs.findIndex(x => x.id === nd.id);
        if (i >= 0) { if ((nd.updated || 0) > (docs[i].updated || 0)) docs[i] = nd; } else docs.push(nd);
      });
      Object.entries(data.counters || {}).forEach(([k, v]) => { counters[k] = Math.max(counters[k] || 0, v); });
      if (data.settings) settings = Object.assign(settings, data.settings);
      store.set('docs', docs); store.set('counters', counters); store.set('settings', settings);
      renderList();
      toast(t('t_restored'));
    } catch (e) { alert(t('e_backup')); }
  };
  reader.readAsText(file);
}

/* ================= events ================= */
// Firebase email/password sign-in and public account creation.
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#l-user').value.trim();
  const password = $('#l-pass').value;
  const button = $('#loginForm button[type="submit"]');
  button.disabled = true;
  showLoginError('Signing in…');
  try {
    await signInWithEmailAndPassword(auth, email, password);
    $('#l-pass').value = '';
  } catch (err) {
    console.error('Firebase sign-in failed:', err);
    const messages = {
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/user-not-found': 'No account was found for this email address.',
      'auth/wrong-password': 'Email or password is incorrect.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your internet connection.'
    };
    showLoginError(messages[err.code] || 'Unable to sign in. Please check your Firebase Authentication setup.');
  } finally { button.disabled = false; }
});
$('#btnForgot').addEventListener('click', async () => {
  const emailInput = $('#l-user');
  if (!emailInput.value.trim()) {
    showLoginError(t('e_email_required'));
    emailInput.focus();
    return;
  }
  if (!emailInput.reportValidity()) return;
  const button = $('#btnForgot');
  button.disabled = true;
  $('#loginErr').classList.add('hidden');
  try {
    await sendPasswordResetEmail(auth, emailInput.value.trim());
    showLoginNotice(t('reset_sent'));
  } catch (err) {
    console.error('Password reset request failed:', err);
    const messages = {
      'auth/invalid-email': t('e_invalid_email'),
      'auth/user-not-found': 'No account was found for this email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your internet connection.'
    };
    showLoginError(messages[err.code] || 'Unable to send a password reset email. Please try again.');
  } finally { button.disabled = false; }
});
$('#btnCreateUser').addEventListener('click', async () => {
  const emailInput = $('#l-user');
  const passwordInput = $('#l-pass');
  if (!emailInput.value.trim()) {
    showLoginError(t('e_email_required'));
    emailInput.focus();
    return;
  }
  if (!emailInput.reportValidity()) return;
  if (!passwordInput.value || passwordInput.value.length < 6) {
    showLoginError(t('e_password_required'));
    passwordInput.focus();
    return;
  }
  const button = $('#btnCreateUser');
  button.disabled = true;
  $('#loginErr').classList.add('hidden');
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    passwordInput.value = '';
    showLoginNotice(t('account_created'));
  } catch (err) {
    console.error('Account creation failed:', err);
    const messages = {
      'auth/email-already-in-use': t('e_email_in_use'),
      'auth/invalid-email': t('e_invalid_email'),
      'auth/weak-password': t('e_weak_password'),
      'auth/operation-not-allowed': t('e_signup_disabled'),
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your internet connection.'
    };
    showLoginError(messages[err.code] || 'Unable to create account. Please check your Firebase Authentication setup.');
  } finally { button.disabled = false; }
});
$('#btnLogout').addEventListener('click', logout);
$('#btnSync').addEventListener('click', syncNow);
$('#btnLang').addEventListener('click', toggleLang);
$('#btnLangLogin').addEventListener('click', toggleLang);

$$('nav button').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.view === 'editor' && !current) openEditor(newDoc('invoice'));
  else show(b.dataset.view);
}));

$$('[data-new]').forEach(b => b.addEventListener('click', () => openEditor(newDoc(b.dataset.new))));
$('#flt-type').addEventListener('change', renderList);
$('#flt-q').addEventListener('input', renderList);

$('#listBody').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const d = docs.find(x => x.id === b.dataset.id);
  if (!d) return;
  const a = b.dataset.a;
  if (a === 'edit') openEditor(clone(d));
  if (a === 'dup') {
    const n = newDoc(d.type);
    Object.assign(n, { client: clone(d.client), items: clone(d.items), lang: d.lang || lang, discount: d.discount, taxRate: d.taxRate, notes: d.notes, terms: d.terms, method: d.method });
    openEditor(n);
  }
  if (a === 'toinv') convertDoc(d, 'invoice');
  if (a === 'torc') convertDoc(d, 'receipt');
  if (a === 'del' && confirm(t('c_delete').replace('{n}', d.number))) {
    docs = docs.filter(x => x.id !== d.id);
    store.set('docs', docs);
    renderList();
  }
});

$('#form').addEventListener('input', () => { readForm(); renderPreview(); });

$('#f-type').addEventListener('change', e => {
  const ty = e.target.value;
  if (current.isNew) {
    current.number = makeNumber(ty);
    $('#f-number').value = current.number;
  }
  current.type = ty;
  if (ty === 'receipt' && !$('#f-paid').value) $('#f-paid').value = todayStr();
  toggleTypeFields();
  readForm();
  renderPreview();
});

$('#addItem').addEventListener('click', () => {
  readForm();
  current.items.push({ desc: '', qty: 1, price: 0 });
  renderItems();
  renderPreview();
  const last = $$('#items .it-desc').pop();
  if (last) last.focus();
});

$('#items').addEventListener('click', e => {
  const b = e.target.closest('[data-del]');
  if (!b) return;
  readForm();
  current.items.splice(+b.dataset.del, 1);
  if (!current.items.length) current.items.push({ desc: '', qty: 1, price: 0 });
  renderItems();
  renderPreview();
});

$('#btnSave').addEventListener('click', saveDoc);
$('#btnBack').addEventListener('click', () => show('list'));
$('#btnPrint').addEventListener('click', () => {
  readForm();
  renderPreview();
  const old = document.title;
  document.title = current.number || 'document';
  window.print();
  setTimeout(() => { document.title = old; }, 800);
});
$('#btnToInvoice').addEventListener('click', () => { if (saveDoc()) convertDoc(current, 'invoice'); });
$('#btnToReceipt').addEventListener('click', () => { if (saveDoc()) convertDoc(current, 'receipt'); });

$('#btnSaveSettings').addEventListener('click', saveSettings);
$('#s-logo').addEventListener('change', e => handleLogo(e.target.files[0]));
$('#btnClearLogo').addEventListener('click', () => { settings.logo = ''; store.set('settings', settings); updateLoginLogo(); fillSettings(); });
$('#btnExport').addEventListener('click', exportBackup);
$('#importFile').addEventListener('change', e => { importBackup(e.target.files[0]); e.target.value = ''; });

/* online / offline badge */
function updateNet() {
  const b = $('#netStatus');
  b.textContent = navigator.onLine ? t('online') : t('offline');
  b.classList.toggle('off', !navigator.onLine);
}
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);

/* offline support */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

/* start */
applyLang();
onAuthStateChanged(auth, async user => {
  firebaseUser = user;
  cloudReady = false;
  $('#btnSync').disabled = true;
  if (!user) {
    document.body.classList.add('locked');
    $('#userName').textContent = '';
    show('list');
    return;
  }
  try {
    await loadCloudWorkspace(user);
    $('#btnSync').disabled = false;
    enterApp(user.email || 'User');
  } catch (err) {
    console.error('Unable to load Firebase workspace:', err);
    await signOut(auth);
    showLoginError('Could not load your cloud data. Check Firestore setup and Security Rules.');
  }
});
