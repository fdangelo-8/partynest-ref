import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PartyPopper, LayoutDashboard, UserCircle, Package, CalendarDays, ClipboardList, MessageSquare, Eye, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { useEffect } from "react";

const navItems = [
  { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/profile", label: "Profilo Location", icon: UserCircle },
  { href: "/crm/packages", label: "Pacchetti", icon: Package },
  { href: "/crm/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/crm/bookings", label: "Prenotazioni", icon: ClipboardList },
  { href: "/crm/quotes", label: "Preventivi", icon: MessageSquare },
  { href: "/crm/messages", label: "Messaggi", icon: MessageSquare },
  { href: "/crm/visibility", label: "Visibilità", icon: Eye },
];

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isBusiness, isLoading, refreshAuth } = useAuth();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/auth/login");
    if (!isLoading && user && !isBusiness) setLocation("/");
  }, [isLoading, user, isBusiness]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  if (!user || !isBusiness) return null;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        refreshAuth();
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-border hidden md:flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6">
          <Link href="/crm/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <PartyPopper className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              PartyNest <span className="text-sm font-medium text-primary">CRM</span>
            </span>
          </Link>
        </div>

        <div className="px-4 py-2">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Loggato come</p>
            <p className="font-bold text-foreground truncate">{user.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-primary text-white font-medium shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-5 h-5 mr-3" />
            Esci dall'account
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
