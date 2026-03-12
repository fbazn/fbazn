"use strict";

const { createClient } = require("@supabase/supabase-js");

const createBrowserClient = (supabaseUrl, supabaseKey, options) => {
  const { cookies: _cookies, ...restOptions } = options || {};
  return createClient(supabaseUrl, supabaseKey, restOptions);
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
