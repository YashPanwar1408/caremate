import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const USERS_KEY = 'cm_users_v1';
const CURRENT_KEY = 'cm_current_user_v1';
const ONBOARD_KEY = 'cm_onboarding_complete_v1';
const CONSENT_KEY = 'cm_consent_accepted_v1';

async function getUsers() {
  try {
    const raw = await SecureStore.getItemAsync(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

async function saveUsers(users) {
  await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export async function signupUser(name, email, password) {
  if (!name || !email || !password) {
    return { ok: false, message: 'All fields are required.' };
  }
  const users = await getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  const passwordHash = await hashPassword(password);
  users.push({ name, email, passwordHash });
  await saveUsers(users);
  return { ok: true };
}

export async function loginUser(email, password) {
  if (!email || !password) return { ok: false, message: 'Email and password are required.' };

  // Hard-coded default login
  if (email.toLowerCase() === 'demo@caremate.ai' && password === 'demo123') {
    await SecureStore.setItemAsync(CURRENT_KEY, email);
    return { ok: true };
  }

  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return { ok: false, message: 'Invalid email or password.' };

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, message: 'Invalid email or password.' };

  await SecureStore.setItemAsync(CURRENT_KEY, email);
  return { ok: true };
}

export async function isLoggedIn() {
  const cur = await SecureStore.getItemAsync(CURRENT_KEY);
  return !!cur;
}

export async function logout() {
  await SecureStore.deleteItemAsync(CURRENT_KEY);
}

export async function getCurrentUser() {
  const email = await SecureStore.getItemAsync(CURRENT_KEY);
  if (!email) return null;
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  return user ? { email: user.email, name: user.name } : { email };
}

export async function getUserByEmail(email) {
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  return user ? { email: user.email, name: user.name } : null;
}

// Onboarding/Consent persistence
export async function setOnboardingComplete(val) {
  if (val) await SecureStore.setItemAsync(ONBOARD_KEY, '1');
  else await SecureStore.deleteItemAsync(ONBOARD_KEY);
}

export async function setConsentAccepted(val) {
  if (val) await SecureStore.setItemAsync(CONSENT_KEY, '1');
  else await SecureStore.deleteItemAsync(CONSENT_KEY);
}

export async function getOnboardingComplete() {
  const v = await SecureStore.getItemAsync(ONBOARD_KEY);
  return v === '1';
}

export async function getConsentAccepted() {
  const v = await SecureStore.getItemAsync(CONSENT_KEY);
  return v === '1';
}

export async function clearOnboardingConsent() {
  await SecureStore.deleteItemAsync(ONBOARD_KEY);
  await SecureStore.deleteItemAsync(CONSENT_KEY);
}
