import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { usePurchaseVisibility } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, Star, TrendingUp, Zap, Award, Rocket } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    points: 50,
    price: 9.99,
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    features: ["50 punti visibilità", "Posizione migliorata per 7 giorni", "Badge in evidenza"],
  },
  {
    id: "pro",
    name: "Pro",
    points: 150,
    price: 24.99,
    icon: TrendingUp,
    color: "from-primary to-secondary",
    popular: true,
    features: ["150 punti visibilità", "Posizione migliorata per 30 giorni", "Badge prioritario", "Statistiche avanzate"],
  },
  {
    id: "premium",
    name: "Premium",
    points: 400,
    price: 59.99,
    icon: Rocket,
    color: "from-purple-500 to-purple-700",
    features: ["400 punti visibilità", "Posizione in cima per 60 giorni", "Badge Premium esclusivo", "Statistiche avanzate", "Supporto prioritario"],
  },
];

export default function CrmVisibility() {
  const { business, businessId, isLoading: loadingBusiness, refetch } = useMyBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: purchase, isPending } = usePurchaseVisibility();

  const handlePurchase = (points: number, planName: string) => {
    if (!businessId) return;
    purchase(
      { businessId, data: { points } },
      {
        onSuccess: () => {
          toast({ title: `Piano ${planName} attivato!`, description: `Hai acquistato ${points} punti visibilità.` });
          queryClient.invalidateQueries({ queryKey: ["listBusinesses"] });
          refetch();
        },
        onError: () => toast({ title: "Errore nell'acquisto", variant: "destructive" }),
      }
    );
  };

  if (loadingBusiness) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento...</p></CrmLayout>;
  }

  if (!businessId) {
    return (
      <CrmLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground">Prima crea il profilo della tua struttura.</p>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          Visibilità
        </h1>
        <p className="text-muted-foreground mt-1">Aumenta la tua visibilità e ottieni più prenotazioni</p>
      </div>

      <Card className="rounded-2xl border-none shadow-md shadow-black/5 bg-gradient-to-br from-slate-900 to-slate-800 text-white mb-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium">I tuoi punti visibilità attuali</p>
            <div className="flex items-center gap-3 mt-1">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              <span className="text-5xl font-bold">{business?.visibilityPoints || 0}</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">Più punti hai, più in alto appari nei risultati di ricerca</p>
          </div>
          <Award className="w-20 h-20 text-amber-400 opacity-20" />
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Come funziona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: "1", title: "Acquista punti", desc: "Scegli un piano e acquista punti visibilità per la tua struttura" },
            { n: "2", title: "Scala la classifica", desc: "I tuoi punti determinano la posizione nei risultati di ricerca dei genitori" },
            { n: "3", title: "Ricevi più prenotazioni", desc: "Maggiore visibilità significa più richieste e prenotazioni" },
          ].map(step => (
            <div key={step.n} className="bg-white rounded-2xl p-5 shadow-md shadow-black/5 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">{step.n}</div>
              <div>
                <h3 className="font-bold text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-5">Scegli un piano</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`relative rounded-2xl overflow-hidden shadow-lg ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-xs font-bold text-center py-1.5">
                  Più popolare
                </div>
              )}
              <div className={`bg-gradient-to-br ${plan.color} p-6 text-white ${plan.popular ? "pt-9" : ""}`}>
                <Icon className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">€{plan.price}</span>
                  <span className="text-white/70 text-sm ml-1">una tantum</span>
                </div>
              </div>
              <div className="bg-white p-6">
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePurchase(plan.points, plan.name)}
                  disabled={isPending}
                  className="w-full rounded-xl"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isPending ? "Elaborazione..." : `Acquista ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </CrmLayout>
  );
}
