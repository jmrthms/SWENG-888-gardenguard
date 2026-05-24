import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../models/types';
import { uuid } from '../utils/id';

/**
 * Authentication contract (US-1, US-2). The app talks only to this interface, so
 * the current local implementation can be swapped for AWS Cognito (via Amplify)
 * in Module 5 without touching the screens.
 */
export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

const USERS_KEY = 'gardenguard:auth:users:v1';
const SESSION_KEY = 'gardenguard:auth:session:v1';

interface StoredUser extends User {
  passwordHash: string;
}

/**
 * NON-SECURE local password hashing. This exists only so the development build
 * never stores raw passwords; it is NOT cryptographically safe. AWS Cognito will
 * own real credential handling — see AuthService above.
 */
function weakHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const publicUser = (u: StoredUser): User => ({ id: u.id, name: u.name, email: u.email });

/** Local, on-device AuthService implementation (placeholder for Cognito). */
export const localAuthService: AuthService = {
  async getCurrentUser() {
    const id = await AsyncStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const users = await readUsers();
    const found = users.find((u) => u.id === id);
    return found ? publicUser(found) : null;
  },

  async signUp(name, email, password) {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw new Error('Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) throw new Error('Please enter a valid email address.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const users = await readUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with that email already exists.');
    }

    const user: StoredUser = {
      id: uuid(),
      name: cleanName,
      email: cleanEmail,
      passwordHash: weakHash(password),
    };
    await writeUsers([...users, user]);
    return publicUser(user);
  },

  async signIn(email, password) {
    const cleanEmail = normalizeEmail(email);
    const users = await readUsers();
    const found = users.find((u) => u.email === cleanEmail);
    if (!found || found.passwordHash !== weakHash(password)) {
      throw new Error('Incorrect email or password.');
    }
    await AsyncStorage.setItem(SESSION_KEY, found.id);
    return publicUser(found);
  },

  async signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
