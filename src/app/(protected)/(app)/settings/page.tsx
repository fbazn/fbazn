import { getOrCreateUserSettings } from "@/data/userSettings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await getOrCreateUserSettings();
  return <SettingsClient settings={settings} />;
}
