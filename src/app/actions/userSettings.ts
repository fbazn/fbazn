"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS } from "@/data/userSettings";

export type SettingsPatch = Partial<typeof DEFAULT_SETTINGS>;

export async function saveUserSettings(patch: SettingsPatch) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: authData.user.id, ...patch },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("Failed to save user settings", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { error: null };
}
