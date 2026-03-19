import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { useListQuotes } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, Users, Euro } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  sent: "Inviato",
  accepted: "Accettato",
  rejected: "Rifiutato",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function CrmQuotes() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();

  const { data, isLoading } = useListQuotes(
    { businessId: businessId! },
    { query: { enabled: !!businessId } }
  );

  const quotes = data?.quotes || [];

  if (loadingBusiness || isLoading) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento preventivi...</p></CrmLayout>;
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
          <MessageSquare className="w-8 h-8 text-primary" />
          Preventivi
        </h1>
        <p className="text-muted-foreground mt-1">Richieste di preventivo ricevute dai genitori</p>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nessun preventivo ancora</p>
          <p className="text-sm mt-1">Le richieste di preventivo appariranno qui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map(quote => (
            <Card key={quote.id} className="rounded-2xl border-none shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/8 transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-base">Richiesta #{quote.id}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[quote.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[quote.status] || quote.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {quote.eventDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(quote.eventDate + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      )}
                      {quote.guestCount && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {quote.guestCount} ospiti
                        </span>
                      )}
                      {quote.budget && (
                        <span className="flex items-center gap-1.5">
                          <Euro className="w-3.5 h-3.5" />
                          Budget: €{Number(quote.budget).toLocaleString("it-IT")}
                        </span>
                      )}
                    </div>

                    {quote.message && (
                      <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-sm text-muted-foreground italic">"{quote.message}"</p>
                      </div>
                    )}

                    {quote.proposedPrice && (
                      <p className="text-sm font-bold text-primary">
                        Prezzo proposto: €{Number(quote.proposedPrice).toLocaleString("it-IT")}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                    {new Date(quote.createdAt).toLocaleDateString("it-IT")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CrmLayout>
  );
}
