"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";

export function Header() {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        // Simple JWT decode for role claim
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload["role"] || 
                         payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setRole(userRole);
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setRole(null);
    router.push("/login"); // Assuming login route
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link href="/" className="font-bold text-lg tracking-tight">
          ExamPlatform
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {isAuthenticated && role === "SuperAdmin" && (
            <Link 
              href="/super-admin"
              className={`transition-colors hover:text-foreground/80 ${pathname === '/super-admin' ? 'text-foreground' : 'text-foreground/60'}`}
            >
              System Dashboard
            </Link>
          )}

          {isAuthenticated && (role === "SuperAdmin" || role === "QuestionCreator") && (
            <>
              <Link 
                href="/creator"
                className={`transition-colors hover:text-foreground/80 ${pathname === '/creator' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Creator Stats
              </Link>
              <Link 
                href="/exams"
                className={`transition-colors hover:text-foreground/80 ${pathname?.startsWith('/exams') ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Exams
              </Link>
            </>
          )}

          {isAuthenticated && (role === "SuperAdmin" || role === "ExamFacer") && (
            <Link 
              href="/history"
              className={`transition-colors hover:text-foreground/80 ${pathname === '/history' ? 'text-foreground' : 'text-foreground/60'}`}
            >
              My History
            </Link>
          )}

          {isAuthenticated ? (
            <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "default" })}>
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
