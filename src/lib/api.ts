const API_BASE = import.meta.env["VITE_API_URL"] || "/api";
const TOKEN_KEY = "souty_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
};

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }
  return payload as T;
}

export async function registerAccount(name: string, email: string, password: string) {
  return request<{ token: string; user: PublicUser }>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function loginAccount(email: string, password: string) {
  return request<{ token: string; user: PublicUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getCurrentUser() {
  return request<{ user: PublicUser }>("/users/me", { auth: true });
}

export async function updateDisplayName(name: string) {
  return request<{ user: PublicUser }>("/users/me", { method: "PATCH", body: { name }, auth: true });
}

export async function getMessageStats() {
  return request<{ count: number }>("/messages/stats", { auth: true });
}

export type Lang = "derja" | "french" | "english";
export type Turn = { role: "user" | "assistant"; content: string };

export async function askSouty(transcript: string, language: Lang, history: Turn[]) {
  return request<{ reply: string }>("/chat", {
    method: "POST",
    body: { transcript, language, history },
    auth: true,
  });
}

export type ConversationMessage = {
  id: number;
  transcript: string;
  reply: string;
  language: Lang;
  created_at: string;
};

export async function getMessages(limit = 20, offset = 0) {
  return request<{ messages: ConversationMessage[] }>(
    `/messages?limit=${limit}&offset=${offset}`,
    { auth: true },
  );
}

export async function clearMessages() {
  return request<{ success: boolean }>("/messages", { method: "DELETE", auth: true });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return request<{ success: boolean }>("/users/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
    auth: true,
  });
}

export async function deleteAccount() {
  return request<{ success: boolean }>("/users/me", { method: "DELETE", auth: true });
}

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  is_active: number;
  created_at: string;
  message_count: number;
};

export type AdminOverview = {
  userCount: number;
  messageCount: number;
  messagesToday: number;
};

export async function getAdminOverview() {
  return request<AdminOverview>("/admin/overview", { auth: true });
}

export async function getAdminUsers() {
  return request<{ users: AdminUser[] }>("/admin/users", { auth: true });
}

export async function setUserRole(id: number, role: "user" | "admin") {
  return request<{ user: PublicUser }>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
    auth: true,
  });
}

export async function adminDeleteUser(id: number) {
  return request<{ success: boolean }>(`/admin/users/${id}`, { method: "DELETE", auth: true });
}
