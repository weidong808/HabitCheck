import type { Metadata } from "next";
import { SettingsBoard } from "@/components/settings/SettingsBoard";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Settings · ${APP_NAME}`,
  description: `AI coach toggle and local data export/import for ${APP_NAME}.`,
};

export default function SettingsPage() {
  return <SettingsBoard />;
}
