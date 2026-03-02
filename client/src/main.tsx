import { trpc } from "@/lib/trpc";
import { getCSRFToken, initCSRF } from "@/lib/csrf";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  const loginUrl = getLoginUrl();
  if (loginUrl) window.location.href = loginUrl;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const CSRF_FAILURE_MSG = "CSRF validation failed";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch: async (input, init) => {
        // Attach CSRF token header
        const token = getCSRFToken();
        const headers = new Headers(init?.headers);
        if (token) {
          headers.set("X-CSRF-Token", token);
        }

        const res = await globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });

        // Handle CSRF token expiry: refresh and retry once
        if (!res.ok) {
          const cloned = res.clone();
          const body = await cloned.json().catch(() => null);
          const errors = Array.isArray(body) ? body : [body];
          const hasCsrfError = errors.some(
            (e: unknown) =>
              typeof e === "object" && e !== null &&
              (e as Record<string, unknown>).error &&
              typeof (e as Record<string, unknown>).error === "object" &&
              ((e as Record<string, Record<string, unknown>>).error.message === CSRF_FAILURE_MSG)
          );

          if (hasCsrfError) {
            await initCSRF();
            const retryToken = getCSRFToken();
            const retryHeaders = new Headers(init?.headers);
            if (retryToken) {
              retryHeaders.set("X-CSRF-Token", retryToken);
            }
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
              headers: retryHeaders,
            });
          }
        }

        return res;
      },
    }),
  ],
});

// Fetch CSRF token before rendering — non-blocking on failure
initCSRF().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
});
