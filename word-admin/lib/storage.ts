export const SESSION_KEY = "wordflow-session";
export const USERS_KEY = "wordflow-admin-users";
export const BOOKS_KEY = "wordflow-books";

export type Session = {
  name: string;
  email: string;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

