/**
 * Simple authentication store (in-memory)
 * In production, this would use proper auth with tokens, sessions, etc.
 */

export type AuthUser = {
  username: string;
  credits: number;
};

const STORAGE_KEY = "livestoq_user";
const DEFAULT_STARTING_CREDITS = 25;

let currentUser: AuthUser | null = null;

function normaliseStoredUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { username?: unknown; credits?: unknown };
  if (typeof obj.username !== "string") return null;
  const credits =
    typeof obj.credits === "number" && Number.isFinite(obj.credits)
      ? obj.credits
      : DEFAULT_STARTING_CREDITS;
  return { username: obj.username, credits };
}

function persistUser(user: AuthUser | null) {
  currentUser = user;
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

export const auth = {
  login(username: string, password: string): boolean {
    // Hardcoded credentials
    if (username === "Testing" && password === "Testing") {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const existing = normaliseStoredUser(parsed);
            if (existing && existing.username === username) {
              persistUser(existing);
              return true;
            }
          } catch {
            // fall through and create fresh user
          }
        }
      }

      const newUser: AuthUser = {
        username,
        credits: DEFAULT_STARTING_CREDITS,
      };
      persistUser(newUser);
      return true;
    }
    return false;
  },

  logout(): void {
    persistUser(null);
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const normalised = normaliseStoredUser(parsed);
          if (normalised) {
            currentUser = normalised;
          }
        } catch {
          // ignore parse errors and treat as logged out
          currentUser = null;
        }
      }
    }
    return currentUser;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  updateCredits(delta: number): AuthUser | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const nextCredits = Math.max(0, Math.floor((user.credits ?? 0) + delta));
    const updated: AuthUser = { ...user, credits: nextCredits };
    persistUser(updated);
    return updated;
  },
};
