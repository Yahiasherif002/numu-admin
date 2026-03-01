/**
 * CSRF protection for the admin panel.
 *
 * Uses the double-submit cookie pattern:
 * 1. GET /api/csrf-token → generates token, sets non-httpOnly cookie, returns in body
 * 2. Client stores token in memory and sends as X-CSRF-Token header
 * 3. Server validates: cookie value === header value on mutations
 */

import { randomBytes, timingSafeEqual } from "crypto";
import { parse as parseCookies } from "cookie";
import type { Request, Response } from "express";

const CSRF_COOKIE = "admin_csrf_token";
const CSRF_HEADER = "x-csrf-token";

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some(p => p.trim().toLowerCase() === "https");
}

/** Express handler: GET /api/csrf-token */
export function csrfTokenHandler(req: Request, res: Response): void {
  const token = randomBytes(32).toString("hex");
  const isSecure = isSecureRequest(req);

  // Always use "lax" — the admin panel is same-origin, so "none" is never needed.
  // "lax" provides better CSRF protection and avoids issues with misconfigured proxies.
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: isSecure,
    maxAge: 86400 * 1000, // 24 hours
  });

  res.json({ data: { csrf_token: token } });
}

/** Validate CSRF token: compare cookie value with header value. */
export function validateCsrfToken(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const cookieToken = cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken) return false;
  if (typeof headerToken !== "string") return false;
  if (cookieToken.length !== headerToken.length) return false;

  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}
