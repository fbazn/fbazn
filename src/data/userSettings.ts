import { createClient } from "@/lib/supabase/server";

export type UserSettings = {
  id: string;
  user_id: string;
  default_marketplace: string;
  preferred_currency: string;
  vat_rate_uk: number;
  vat_rate_us: number;
  vat_rate_de: number;
  prep_fee_per_unit: number;
  inbound_shipping_per_unit: number;
  min_roi_pct: number;
  min_profit: number;
  target_margin_pct: number;
};

export const DEFAULT_SETTINGS: Omit<UserSettings, "id" | "user_id"> = {
  default_marketplace: "UK",
  preferred_currency: "GBP",
  vat_rate_uk: 20,
  vat_rate_us: 0,
  vat_rate_de: 19,
  prep_fee_per_unit: 0.5,
  inbound_shipping_per_unit: 0.3,
  min_roi_pct: 30,
  min_profit: 3.0,
  target_margin_pct: 30,
};

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to load user settings", error);
  }

  return data ?? null;
}

export async function getOrCreateUserSettings(): Promise<UserSettings> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (existing) return existing as UserSettings;

  const { data: created, error } = await supabase
    .from("user_settings")
    .insert({ user_id: authData.user.id, ...DEFAULT_SETTINGS })
    .select("*")
    .single();

  if (error) throw error;
  return created as UserSettings;
}
