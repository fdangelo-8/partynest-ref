import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartyPopper } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { refreshAuth } = useAuth();
  
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          refreshAuth();
          if (data.user.role === "business") {
            setLocation("/crm/dashboard");
          } else {
            setLocation("/");
          }
        },
        onError: (err) => {
          setError(err.message || "Credenziali non valide");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6 cursor-pointer">
            <PartyPopper className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-center">Bentornato!</h1>
          <p className="text-muted-foreground text-center mt-2">Accedi per gestire le tue feste o la tua struttura</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input 
              type="email" 
              placeholder="tu@email.com" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <Link href="#" className="text-sm text-primary hover:underline font-medium">Password dimenticata?</Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white font-bold mt-4">
            {isPending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-sm text-muted-foreground font-medium">Oppure accedi con</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl mt-6 font-medium" onClick={() => window.location.href = '/api/auth/google'}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>

        <p className="text-center text-sm text-slate-600 mt-8">
          Non hai un account? <Link href="/auth/register" className="text-primary font-bold hover:underline">Registrati</Link>
        </p>
      </div>
    </div>
  );
}
