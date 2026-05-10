/**
 * Header Component - NUMU Admin Dashboard
 *
 * Design: Clean top bar with search and quick actions
 * Features: Global search, notifications, env switcher (super-admin only),
 *           date display.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Calendar, Check, Search } from "lucide-react";
import { useState } from "react";
import {
  ADMIN_ENVS,
  getCurrentEnv,
  getEnvBadgeClasses,
  getEnvLabel,
  setCurrentEnv,
  type AdminEnv,
} from "@/lib/env";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [currentEnv, setCurrentEnvState] = useState<AdminEnv>(getCurrentEnv);

  const handleEnvChange = (env: AdminEnv) => {
    if (env === currentEnv) return;
    const ok = window.confirm(
      `Switch to ${getEnvLabel(env)}? You'll be logged out and redirected ` +
        `to login on the ${getEnvLabel(env).toLowerCase()} API.`,
    );
    if (!ok) return;
    setCurrentEnv(env);
    setCurrentEnvState(env);
    // Hard reload to drop any in-memory state (CSRF token, React Query
    // cache, etc.) and re-bootstrap against the new API.
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search merchants, orders..."
              className="w-72 pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>

          {/* Env switcher — points the dashboard at prod / stage / test API */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-80 ${getEnvBadgeClasses(currentEnv)}`}
                aria-label={`Current environment: ${getEnvLabel(currentEnv)}. Click to switch.`}
              >
                {getEnvLabel(currentEnv)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Switch environment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ADMIN_ENVS.map((env) => (
                <DropdownMenuItem
                  key={env}
                  onSelect={() => handleEnvChange(env)}
                  className="flex items-center justify-between"
                >
                  <span>{getEnvLabel(env)}</span>
                  {env === currentEnv && (
                    <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
