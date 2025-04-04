import { Header } from "@/components/header";

interface BadgeLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function BadgeLayout({ 
  children,
  showHeader = true
}: BadgeLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {showHeader && <Header />}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
} 