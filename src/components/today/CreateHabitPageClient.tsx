"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateHabitForm } from "@/components/today/CreateHabitForm";
import { createHabit } from "@/lib/storage/habitsRepo";

export function CreateHabitPageClient() {
  const router = useRouter();

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Back to Today
        </Link>
      </p>
      <CreateHabitForm
        onCreate={async (input) => {
          await createHabit(input);
          router.push("/");
          router.refresh();
        }}
        onCancel={() => router.push("/")}
      />
    </main>
  );
}
