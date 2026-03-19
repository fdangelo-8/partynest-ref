import { useState } from "react";
import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Check, X, Calendar, Clock, Users } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  accepted: "Accettata",
  rejected: "Rifiutata",
  cancelled: "Cancellata",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const FILTER_TABS = [
  { value: "all", label: "Tutte" },
  { value: "pending", label: "In attesa" },
  { value: "accepted", label: "Accettate" },
  { value: "rejected", label: "Rifiutate" },
];

export default function CrmBookings() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useListBookings(
    { businessId: businessId! },
    { query: { enabled: !!businessId } }
  );

  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  const bookings = (data?.bookings || []).filter(b =>
    filter === "all" ? true : b.status === filter
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["listBookings"] });

  const handleStatus = (bookingId: number, status: "accepted" | "rejected") => {
    updateStatus(
      { bookingId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: status === "accepted" ? "Prenotazione accettata!" : "Prenotazione rifiutata" });
          invalidate();
        },
        onError: () => toast({ title: "Errore nell'aggiornamento", variant: "destructive" }),
      }
    );
  };

  if (loadingBusiness || isLoading) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento prenotazioni...</p></CrmLayout>;
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
          <ClipboardList className="w-8 h-8 text-primary" />
          Prenotazioni
        </h1>
        <p className="text-muted-foreground mt-1">Gestisci le richieste di prenotazione ricevute</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.value
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-muted-foreground hover:bg-slate-100 border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nessuna prenotazione</p>
          <p className="text-sm mt-1">Le prenotazioni ricevute appariranno qui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Card key={booking.id} className="rounded-2xl border-none shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/8 transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-base">{(booking as any).parentName || `Prenotazione #${booking.id}`}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(booking.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {booking.timeSlot && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.timeSlot}
                        </span>
                      )}
                      {booking.guestCount && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {booking.guestCount} ospiti
                        </span>
                      )}
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground bg-slate-50 rounded-xl px-3 py-2">{booking.notes}</p>
                    )}
                    {booking.totalPrice && (
                      <p className="text-sm font-bold text-primary">Totale: €{Number(booking.totalPrice).toLocaleString("it-IT")}</p>
                    )}
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleStatus(booking.id, "accepted")}
                        disabled={isPending}
                        size="sm"
                        className="gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-none"
                      >
                        <Check className="w-4 h-4" /> Accetta
                      </Button>
                      <Button
                        onClick={() => handleStatus(booking.id, "rejected")}
                        disabled={isPending}
                        size="sm"
                        variant="outline"
                        className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" /> Rifiuta
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CrmLayout>
  );
}
