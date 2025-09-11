export function getUserId(): string {
  const key = "mentorai_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      id = (crypto as any).randomUUID();
    } else {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    localStorage.setItem(key, id);
  }
  return id;
}

export type UserRole = "student" | "graduate" | "professional";

export function getUserRole(): UserRole | undefined {
  const v = localStorage.getItem("mentorai_user_role") as UserRole | null;
  return v || undefined;
}

export function setUserRole(role: UserRole) {
  localStorage.setItem("mentorai_user_role", role);
}
