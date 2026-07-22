import Link from "next/link";
import { SITE_HOME_LABEL, SITE_HOME_URL } from "@/lib/brand";

export function SiteHomeLink({ className }: { className?: string }) {
  return (
    <a
      href={SITE_HOME_URL}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {SITE_HOME_LABEL}
    </a>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
