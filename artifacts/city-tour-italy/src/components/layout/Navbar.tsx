import { Link } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold text-primary tracking-tight">
          City Tour Italy
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Button variant="outline" onClick={() => logout()}>
                Esci
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Accedi
              </Link>
              <Button asChild className="font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/register">Registrati</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
