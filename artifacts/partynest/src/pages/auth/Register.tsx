import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister, RegisterRequestRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartyPopper, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState<RegisterRequestRole>("parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [, setLocation] = useLocation();
  const { refreshAuth } = useAuth();
  
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    register(
      { data: { name, email, password, role } },
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
          setError(err.message || "Errore durante la registrazione");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6 cursor-pointer">
            <PartyPopper className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-center">Crea un Account</h1>
          <p className="text-muted-foreground text-center mt-2">Unisciti a PartyNest per organizzare o ospitare feste.</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              onClick={() => setRole("parent")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${role === "parent" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Genitore</h3>
                {role === "parent" && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">Voglio prenotare feste per i miei figli.</p>
            </div>
            
            <div 
              onClick={() => setRole("business")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${role === "business" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Partner</h3>
                {role === "business" && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">Gestisco una location per feste.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nome {role === "business" ? "Attività" : "Completo"}</label>
              <Input 
                placeholder={role === "business" ? "Es. Il Bosco Incantato" : "Es. Mario Rossi"} 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
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
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white font-bold mt-4">
            {isPending ? "Creazione in corso..." : "Registrati"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-8">
          Hai già un account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
