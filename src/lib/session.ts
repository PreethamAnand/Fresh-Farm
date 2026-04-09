export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface SessionState {
  user: SessionUser;
  token: string;
}

const SESSION_KEY = "freshfarm_session_user";
const GUEST_TOKEN = "guest-token";

function getDefaultGuestUser(): SessionUser {
  return {
    userId: "guest_local",
    name: "Guest User",
    email: "guest@freshfarm.local",
    role: "guest",
  };
}

export function getCurrentUser(): SessionUser {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return getDefaultGuestUser();
    }

    const parsed = JSON.parse(raw) as SessionState | SessionUser;
    if ("user" in parsed) {
      if (parsed.user.role === "guest") {
        return { ...parsed.user, userId: "guest_local" };
      }

      return parsed.user;
    }

    if (parsed.role === "guest") {
      return { ...parsed, userId: "guest_local" };
    }

    return parsed;
  } catch {
    return getDefaultGuestUser();
  }
}

export function getAuthToken(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return GUEST_TOKEN;

    const parsed = JSON.parse(raw) as SessionState | SessionUser;
    if ("token" in parsed) {
      return parsed.token;
    }

    return parsed.role === "guest" ? GUEST_TOKEN : "";
  } catch {
    return GUEST_TOKEN;
  }
}

export function setCurrentUser(user: SessionUser, token: string) {
  const session: SessionState = { user, token };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}
