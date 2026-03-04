/**
 * Auth API service — login, logout, get current user.
 * Authentication is handled via httpOnly cookies set by the NUMU-api.
 * CSRF token is fetched after login so subsequent requests pass validation.
 */

import { apiClient, API_BASE } from "@/lib/apiClient";
import { initCSRF, clearCSRFToken } from "@/lib/csrf";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    role: string;
    status: string;
    avatar_url?: string | null;
    is_verified?: boolean;
    created_at: string;
    updated_at: string;
  };
}

function mapUser(raw: AuthResponse["user"]): AdminUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.full_name || `${raw.first_name} ${raw.last_name}`.trim(),
    first_name: raw.first_name,
    last_name: raw.last_name,
    role: raw.role,
    status: raw.status,
    avatar_url: raw.avatar_url ?? null,
    is_verified: raw.is_verified ?? false,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AdminUser> {
  // Use raw fetch (not apiClient) because this runs before CSRF token exists
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Login failed (${res.status})`);
  }

  const json = await res.json();
  const user = mapUser(json.data.user);

  // Verify admin role
  if (user.role !== "super_admin" && user.role !== "admin") {
    // Logout since we set cookies for a non-admin user
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    throw new Error("You do not have admin access to this panel.");
  }

  // Fetch CSRF token now that we have auth cookies
  await initCSRF();

  return user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  clearCSRFToken();
}

export async function getMe(): Promise<AdminUser> {
  // Use raw fetch — NOT apiClient — to avoid the 401 → redirect loop.
  // This is called on mount to check session validity; a 401 here simply
  // means "not logged in", not "redirect now".
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  const json = await res.json();
  return mapUser(json.data);
}
