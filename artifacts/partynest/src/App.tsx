import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/public/Home";
import Search from "@/pages/public/Search";
import VenueDetail from "@/pages/public/VenueDetail";
import Wishlist from "@/pages/public/Wishlist";
import MyBookings from "@/pages/public/MyBookings";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// CRM
import CrmDashboard from "@/pages/crm/Dashboard";
import CrmProfile from "@/pages/crm/Profile";
import CrmPackages from "@/pages/crm/Packages";
import CrmCalendar from "@/pages/crm/Calendar";
import CrmBookings from "@/pages/crm/Bookings";
import CrmQuotes from "@/pages/crm/Quotes";
import CrmMessages from "@/pages/crm/Messages";
import CrmVisibility from "@/pages/crm/Visibility";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/venue/:id" component={VenueDetail} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/my-bookings" component={MyBookings} />

      {/* Auth */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* CRM Routes */}
      <Route path="/crm" component={() => <Redirect to="/crm/dashboard" />} />
      <Route path="/crm/dashboard" component={CrmDashboard} />
      <Route path="/crm/profile" component={CrmProfile} />
      <Route path="/crm/packages" component={CrmPackages} />
      <Route path="/crm/calendar" component={CrmCalendar} />
      <Route path="/crm/bookings" component={CrmBookings} />
      <Route path="/crm/quotes" component={CrmQuotes} />
      <Route path="/crm/messages" component={CrmMessages} />
      <Route path="/crm/visibility" component={CrmVisibility} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
