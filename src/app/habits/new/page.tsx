import type { Metadata } from "next";
import { CreateHabitPageClient } from "@/components/today/CreateHabitPageClient";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `New habit · ${APP_NAME}`,
};

export default function NewHabitPage() {
  return <CreateHabitPageClient />;
}
