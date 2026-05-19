import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-border focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <PublicNav />
      <main id="main-content" className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
