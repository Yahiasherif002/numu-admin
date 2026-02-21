/**
 * Login Page — NUMU Admin Backoffice
 *
 * Supports two flows:
 *  1. Email/password auth via the NUMU API (production)
 *  2. One-click dev-admin bypass when VITE_OAUTH_PORTAL_URL is not set (local dev)
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { Eye, EyeOff, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const isDevMode = !import.meta.env.VITE_OAUTH_PORTAL_URL;

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => {
      if (err instanceof TRPCClientError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  const handleDevLogin = () => {
    setError(null);
    loginMutation.mutate({ email: "dev@admin.local", password: "dev" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            NUMU Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access the backoffice
          </p>
        </div>

        {/* Dev-mode banner */}
        {isDevMode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Zap size={16} />
              <span className="text-sm font-medium">Local development mode</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              OAuth is not configured. Use the button below to sign in as a dev admin, or enter NUMU API credentials above.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
              onClick={handleDevLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Zap size={16} className="mr-2" />
              )}
              Continue as Dev Admin
            </Button>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@numu.io"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || !email || !password}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
