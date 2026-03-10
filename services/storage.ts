
import { User, UserSubmission, AdminConfig, RemovedProfile, SavedRecord, Invite } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, query, where, getDoc } from 'firebase/firestore';

const USERS_KEY = 'safedate_users';
const CURRENT_USER_KEY = 'safedate_current_user';
const SUBMISSIONS_KEY = 'safedate_submissions';
const ADMIN_CONFIG_KEY = 'safedate_admin_config';
const REMOVED_PROFILES_KEY = 'safedate_removed_profiles';
const RECORDS_KEY = 'safedate_records';
const INVITES_KEY = 'safedate_invites';

const DEFAULT_RESET_SUBJECT = "Reset Your SafeDate Check Password";
const DEFAULT_RESET_BODY = `<p>Hello {user_email},</p><p>We received a request to reset your password for {app_name}.</p><p>Click the link below to set a new password:</p><p><a href="{reset_link}">{reset_link}</a></p><p>If you didn't ask to reset your password, you can ignore this email.</p>`;

const DEFAULT_REF_WELCOME_SUBJECT = "Welcome to the SafeDate Referral Program";
const DEFAULT_REF_WELCOME_BODY = `<p>Hi {user_email},</p><p>You can now earn 10% commissions by referring friends.</p><p>Your Referral Link: <a href="{referral_link}">{referral_link}</a></p>`;

// --- CONFIG ACCESSORS (Moved up to avoid hoisting issues) ---

export const getAdminConfig = (): AdminConfig => {
  let stored = {};
  try {
    const json = localStorage.getItem(ADMIN_CONFIG_KEY);
    stored = json ? JSON.parse(json) : {};
  } catch (e) {
    // Ignore error
  }
  
  return {
    stripePublicKey: '',
    stripeSecretKey: '',
    sendGridApiKey: '',
    sendGridFromEmail: '',
    passwordResetEmailSubject: DEFAULT_RESET_SUBJECT,
    passwordResetEmailBody: DEFAULT_RESET_BODY,
    referralWelcomeSubject: DEFAULT_REF_WELCOME_SUBJECT,
    referralWelcomeBody: DEFAULT_REF_WELCOME_BODY,
    ...stored
  };
};

export const saveAdminConfig = (config: AdminConfig) => {
  localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  // If config changed, try re-init firebase
  if (config.firebaseConfig) {
    initFirebase(config.firebaseConfig);
  }
};

// --- FIREBASE INITIALIZATION ---

let db: any = null;

export const initFirebase = (manualConfig?: any) => {
  try {
    const configToUse = manualConfig || getAdminConfig().firebaseConfig;
    if (configToUse && configToUse.apiKey) {
      const app = initializeApp(configToUse);
      db = getFirestore(app);
      console.log("🔥 Firebase Initialized");
    }
  } catch (e) {
    console.error("Firebase Init Failed", e);
  }
};

// Attempt init on load
initFirebase();

// --- DATA SYNC ---

export const syncDatabase = async () => {
  if (!db) return;
  console.log("Syncing with Firebase...");

  try {
    // Sync Users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const remoteUsers: User[] = usersSnapshot.docs.map(d => d.data() as User);
    const localUsers = getUsers();
    // Simple Merge: Remote overwrites local if ID matches, else add. 
    // Ideally we timestamp check, but for now assuming DB is truth.
    const mergedUsers = [...localUsers];
    remoteUsers.forEach(rUser => {
       const idx = mergedUsers.findIndex(u => u.id === rUser.id);
       if (idx >= 0) mergedUsers[idx] = rUser;
       else mergedUsers.push(rUser);
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));

    // Sync Records
    const recordsSnapshot = await getDocs(collection(db, 'records'));
    const remoteRecords: SavedRecord[] = recordsSnapshot.docs.map(d => d.data() as SavedRecord);
    const localRecords = getSavedRecords();
    const mergedRecords = [...localRecords];
    remoteRecords.forEach(rRec => {
       if (!mergedRecords.find(l => l.id === rRec.id)) mergedRecords.push(rRec);
    });
    // Sort by timestamp desc
    mergedRecords.sort((a, b) => b.report.timestamp - a.report.timestamp);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(mergedRecords));

    // Sync Submissions
    const subsSnapshot = await getDocs(collection(db, 'submissions'));
    const remoteSubs: UserSubmission[] = subsSnapshot.docs.map(d => d.data() as UserSubmission);
    const localSubs = getSubmissions();
    const mergedSubs = [...localSubs];
    remoteSubs.forEach(rSub => {
      if (!mergedSubs.find(l => l.id === rSub.id)) mergedSubs.push(rSub);
    });
    mergedSubs.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(mergedSubs));

    console.log("Sync Complete");
  } catch (e) {
    console.error("Sync Failed", e);
  }
};

// --- STORAGE HELPERS ---

const initStorage = () => {
  let users: User[] = [];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    users = stored ? JSON.parse(stored) : [];
  } catch {
    users = [];
  }
  
  let usersUpdated = false;

  // Default system admin
  if (!users.find(u => u.email === 'admin@safedate.com')) {
    const admin: User = {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@safedate.com',
      passwordHash: 'admin123',
      role: 'ADMIN',
      tier: 'PAID',
      searchesUsedThisMonth: 0,
      maxSearches: 9999,
      billingCycleStart: Date.now(),
      referralCode: 'ADMIN'
    };
    users.push(admin);
    usersUpdated = true;
  }

  // Requested Admin: Cynthia
  if (!users.find(u => u.email === 'cynthiaschomp@gmail.com')) {
    const cynthia: User = {
      id: 'admin-cynthia',
      username: 'cynthia',
      email: 'cynthiaschomp@gmail.com',
      passwordHash: '123456',
      role: 'ADMIN',
      tier: 'PAID',
      searchesUsedThisMonth: 0,
      maxSearches: 9999,
      billingCycleStart: Date.now(),
      referralCode: 'CYNTHIA'
    };
    users.push(cynthia);
    usersUpdated = true;
  }

  if (usersUpdated) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Initialize Invites (Create "TESTERS" code)
  let invites: Invite[] = [];
  try {
    const storedInvites = localStorage.getItem(INVITES_KEY);
    invites = storedInvites ? JSON.parse(storedInvites) : [];
  } catch {
    invites = [];
  }

  if (!invites.find(i => i.code === 'TESTERS')) {
    const testerInvite: Invite = {
      code: 'TESTERS',
      status: 'PENDING',
      createdAt: Date.now()
    };
    invites.push(testerInvite);
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  }
};

// --- ACCESSORS ---

export const getUsers = (): User[] => {
  initStorage(); 
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const saveUser = async (user: User) => {
  // 1. Save Local
  const users = getUsers().filter(u => u.id !== user.id);
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const current = getCurrentUser();
  if (current && current.id === user.id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  // 2. Save Firebase
  if (db) {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (e) { console.error("FB User Save Error", e); }
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const json = localStorage.getItem(CURRENT_USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch { return null; }
};

export const login = (identifier: string, password: string): User | null => {
  initStorage();
  const users = getUsers();
  
  const user = users.find(u => 
    (u.email.toLowerCase() === identifier.toLowerCase() || (u.username && u.username.toLowerCase() === identifier.toLowerCase())) && 
    u.passwordHash === password
  );
  
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const register = async (email: string, password: string, username?: string, inviteCode?: string): Promise<User> => {
  initStorage();
  const users = getUsers();
  
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already exists");
  }
  if (username && users.find(u => u.username?.toLowerCase() === username.toLowerCase())) {
    throw new Error("Username already taken");
  }

  let tier: 'FREE' | 'PAID' = 'FREE';
  let maxSearches = 5;
  let redeemedInviteId: string | null = null;
  let referredBy: string | undefined = undefined;

  // Handle Codes
  if (inviteCode) {
    const code = inviteCode.trim().toUpperCase();

    if (code === 'REPORT_ACCESS') {
       tier = 'PAID';
       maxSearches = 100;
    } 
    else if (users.find(u => u.referralCode === code)) {
       maxSearches = 25; 
       const referrer = users.find(u => u.referralCode === code);
       if (referrer) referredBy = referrer.id;
    }
    else {
      const invites = getInvites();
      const invite = invites.find(i => i.code === code && i.status === 'PENDING');
      
      if (invite) {
        if (invite.createdForEmail && invite.createdForEmail.toLowerCase() !== email.toLowerCase()) {
          throw new Error("This invite code was issued for a different email address.");
        }
        tier = 'PAID';
        maxSearches = 100;
        redeemedInviteId = invite.code;
      } else {
         throw new Error("Invalid referral or invite code.");
      }
    }
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    username,
    passwordHash: password,
    role: 'USER',
    tier: tier,
    searchesUsedThisMonth: 0,
    maxSearches: maxSearches,
    billingCycleStart: Date.now(),
    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    referredByUserId: referredBy,
    commissionBalance: 0
  };
  
  await saveUser(newUser); // Await async save

  // Update invite status if applicable
  if (redeemedInviteId) {
    const invites = getInvites();
    const inviteIndex = invites.findIndex(i => i.code === redeemedInviteId);
    if (inviteIndex >= 0) {
      invites[inviteIndex].status = 'USED';
      invites[inviteIndex].usedByUserId = newUser.id;
      invites[inviteIndex].usedAt = Date.now();
      localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
      // Todo: Sync invite usage to FB if needed
    }
  }

  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const checkSearchLimit = (user: User): boolean => {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  
  if (now - user.billingCycleStart > thirtyDays) {
    user.searchesUsedThisMonth = 0;
    user.billingCycleStart = now;
    
    if (user.tier === 'FREE' && user.maxSearches > 5) {
       user.maxSearches = 5;
    }

    saveUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  return user.searchesUsedThisMonth < user.maxSearches;
};

export const incrementSearchCount = (user: User) => {
  user.searchesUsedThisMonth += 1;
  saveUser(user);
};

export const upgradeSubscription = (userId: string) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.tier = 'PAID';
    user.maxSearches = 100;
    saveUser(user);
    processCommission(user);
  }
};

const processCommission = (upgradedUser: User) => {
  if (upgradedUser.referredByUserId) {
    const users = getUsers();
    const referrer = users.find(u => u.id === upgradedUser.referredByUserId);
    if (referrer) {
      referrer.commissionBalance = (referrer.commissionBalance || 0) + 1.00;
      saveUser(referrer);
    }
  }
};

// Submissions / Evidence
export const saveSubmission = async (submission: UserSubmission) => {
  // Local
  const submissions = getSubmissions();
  submissions.unshift(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

  // Firebase
  if (db) {
    try {
      await setDoc(doc(db, 'submissions', submission.id), submission);
    } catch (e) { console.error("FB Sub Save Error", e); }
  }
};

export const getSubmissions = (): UserSubmission[] => {
  try {
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

// Records / Profiles
export const getSavedRecords = (): SavedRecord[] => {
  try {
    const stored = localStorage.getItem(RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const getRecordById = (id: string): SavedRecord | null => {
  const records = getSavedRecords();
  return records.find(r => r.id === id) || null;
};

export const saveRecord = async (record: SavedRecord) => {
  // 1. Local Save - Prevent duplicates based on ID
  const records = getSavedRecords();
  if (!records.find(r => r.id === record.id)) {
      records.unshift(record);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } else {
      // Update existing if needed
      const idx = records.findIndex(r => r.id === record.id);
      records[idx] = record;
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }

  // 2. Firebase Save
  if (db) {
    try {
      await setDoc(doc(db, 'records', record.id), record);
    } catch (e) { console.error("FB Record Save Error", e); }
  }
};

// --- INVITE SYSTEM ---

export const getInvites = (): Invite[] => {
  try {
    const stored = localStorage.getItem(INVITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const createInvite = (email?: string, customCode?: string): Invite => {
  const invites = getInvites();
  
  let code = '';
  if (customCode && customCode.trim()) {
    code = customCode.trim().toUpperCase();
    if (invites.find(i => i.code === code)) {
      throw new Error("Invite code already exists");
    }
  } else {
    code = 'VIP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  const newInvite: Invite = {
    code,
    status: 'PENDING',
    createdForEmail: email,
    createdAt: Date.now()
  };
  
  invites.unshift(newInvite);
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  
  // Sync to FB (Fire and forget)
  if (db) {
    setDoc(doc(db, 'invites', newInvite.code), newInvite).catch(console.error);
  }

  return newInvite;
};

// --- DATA REMOVAL & BLOCKLIST ---

export const submitRemovalRequest = async (firstName: string, lastName: string, location: string, reason: string, email: string) => {
  let requests: RemovedProfile[] = [];
  try {
    const stored = localStorage.getItem(REMOVED_PROFILES_KEY);
    requests = stored ? JSON.parse(stored) : [];
  } catch {
    requests = [];
  }
  
  const newRequest: RemovedProfile = {
    id: Date.now().toString(),
    firstName,
    lastName,
    location,
    reason,
    requesterEmail: email,
    timestamp: Date.now()
  };

  requests.push(newRequest);
  localStorage.setItem(REMOVED_PROFILES_KEY, JSON.stringify(requests));

  if (db) {
    try {
      await setDoc(doc(db, 'removed_profiles', newRequest.id), newRequest);
    } catch (e) { console.error("FB Removal Save Error", e); }
  }
};

export const isProfileRemoved = (firstName: string, lastName: string, location: string): boolean => {
  try {
    const stored = localStorage.getItem(REMOVED_PROFILES_KEY);
    const requests: RemovedProfile[] = stored ? JSON.parse(stored) : [];
    
    // Simple normalization
    const targetKey = `${firstName.toLowerCase().trim()}|${lastName.toLowerCase().trim()}|${location.toLowerCase().trim()}`;
    
    return requests.some(r => {
      const rKey = `${r.firstName.toLowerCase().trim()}|${r.lastName.toLowerCase().trim()}|${r.location.toLowerCase().trim()}`;
      return targetKey === rKey;
    });
  } catch {
    return false;
  }
};
