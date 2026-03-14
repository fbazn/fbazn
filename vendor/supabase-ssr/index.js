"use strict";

const { createClient } = require("@supabase/supabase-js");

const createBrowserClient = (supabaseUrl, supabaseKey, options) => {
  const { cookies: _cookies, ...restOptions } = options || {};

  // Browser cookie storage adapter — session stored in cookies so the
  // server-side middleware can read it (localStorage is not readable server-side).
  const cookieAdapter = {
    getItem(key) {
      if (typeof document === "undefined") return null;
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(key + "="));
      return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
    },
    setItem(key, value) {
      if (typeof document === "undefined") return;
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    },
    removeItem(key) {
      if (typeof document === "undefined") return;
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
    },
  };

  return createClient(supabaseUrl, supabaseKey, {
    ...restOptions,
    auth: {
      ...(restOptions.auth ?? {}),
      storage: cookieAdapter,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

const createServerClient = (supabaseUrl, supabaseKey, options) => {
  const { cookies, ...restOptions } = options || {};

  // Build a custom storage adapter that reads/writes via the provided cookie API
  const cookieAdapter = {
    getItem(key) {
      try {
        const all = cookies?.getAll?.() ?? [];
        const found = all.find((c) => c.name === key);
        return found?.value ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        cookies?.setAll?.([{ name: key, value }]);
      } catch {
        // ignore in read-only server components
      }
    },
    removeItem(key) {
      try {
        cookies?.setAll?.([
          {
            name: key,
            value: "",
            options: { maxAge: 0 },
          },
        ]);
      } catch {
        // ignore
      }
    },
  };

  return createClient(supabaseUrl, supabaseKey, {
    ...restOptions,
    auth: {
      ...(restOptions.auth ?? {}),
      storage: cookieAdapter,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

module.exports = {
  createBrowserClient,
  createServerClient,
};
