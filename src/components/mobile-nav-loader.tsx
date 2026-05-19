"use client"

import dynamic from "next/dynamic";

const MobileNav = dynamic(
  () => import("@/components/mobile-nav").then((m) => ({ default: m.MobileNav })),
  { ssr: false }
);

interface MobileNavLoaderProps {
  dashboardPath?: string;
}

export function MobileNavLoader({ dashboardPath }: MobileNavLoaderProps) {
  return <MobileNav dashboardPath={dashboardPath} />;
}
