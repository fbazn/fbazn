import { getOrCreateUserSettings } from "@/data/userSettings";
import AsinClient from "./AsinClient";

export default async function AsinPage() {
  const settings = await getOrCreateUserSettings();
  return <AsinClient settings={settings} />;
}
