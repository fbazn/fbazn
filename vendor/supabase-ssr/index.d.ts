import type { SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

export declare const createBrowserClient: (
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions
) => SupabaseClient;

export declare const createServerClient: (
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions
) => SupabaseClient;
