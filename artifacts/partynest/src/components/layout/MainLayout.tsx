import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { PartyPopper, User, LogOut, Heart, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isBusiness, refreshAuth } = useAuth();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        refreshAuth();
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full glass-panel border-b-0 rounded-none shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <PartyPopper className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              PartyNest
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Esplora Location
            </Link>
            <Link href="/search?locationType=outdoor" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Feste all'aperto
            </Link>
            <Link href="/search?locationType=indoor" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Sale interne
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => setLocation("/auth/login")} className="hidden sm:inline-flex hover:text-primary hover:bg-primary/10">
                  Accedi
                </Button>
                <Button onClick={() => setLocation("/auth/register")} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md shadow-primary/20">
                  Registrati
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {isBusiness ? (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/crm/dashboard")} className="cursor-pointer py-3">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Area Business (CRM)</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/wishlist")} className="cursor-pointer py-3">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>La mia Wishlist</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/my-bookings")} className="cursor-pointer py-3">
                        <PartyPopper className="mr-2 h-4 w-4" />
                        <span>Le mie Prenotazioni</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <PartyPopper className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-xl text-foreground">PartyNest</span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                Il primo portale in Italia per trovare, confrontare e prenotare la location perfetta per la festa dei tuoi bambini.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-display">Per i Genitori</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/search" className="hover:text-primary">Cerca Location</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary">Crea Account</Link></li>
                <li><Link href="/wishlist" className="hover:text-primary">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-display">Per i Partner</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/auth/register" className="hover:text-primary">Diventa Partner</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary">Accedi al CRM</Link></li>
                <li><Link href="#" className="hover:text-primary">Scopri di più</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PartyNest. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
