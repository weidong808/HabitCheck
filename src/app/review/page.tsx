import type { Metadata } from "next";
import { ReviewBoard } from "@/components/review/ReviewBoard";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Weekly review · ${APP_NAME}`,
  description:
    "Facts review — consistency, recoveries, difficulty, and deterministic plan adjuster.",
};

export default function ReviewPage() {
  return <ReviewBoard />;
}
