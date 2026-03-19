import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { useListBookings } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Calendar, Clock, Users, MapPin } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa di conferma",
  accepted: "Confermata",
  rejected: "Rifiutata",
  cancelled: "Cancellata",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  accepted: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function MyBookings() {
  const { user, isLoading: loadingAuth } = useAuth();

  const { data, isLoading } = useListBookings(
    {},
    { query: { enabled: !!user } }
  );

  const bookings = data?.bookings || [];

  if (loadingAuth || isLoading) {
    return <MainLayout><div className="text-center py-24 text-muted-foreground">Caricamento...</div></MainLayout>;
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-24">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h2 className="text-2xl font-display font-bold mb-3">Accedi per vedere le tue prenotazioni</h2>
          <Button asChild className="rounded-full px-8">
            <Link href="/auth/login">Accedi</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-primary" />
            Le mie Prenotazioni
          </h1>
          <p className="text-muted-foreground mt-1">
            {bookings.length > 0 ? `${bookings.length} prenotazione${bookings.length !== 1 ? "i" : ""}` : "Nessuna prenotazione"}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">Nessuna prenotazione ancora</h3>
            <p className="text-muted-foreground mb-6">Sfoglia le strutture e prenota la tua festa perfetta</p>
            <Button asChild className="rounded-full px-8">
              <Link href="/search">Cerca strutture</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="rounded-2xl border-none shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/8 transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">Prenotazione #{booking.id}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-600"}`}>
                          {STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(booking.date + "T12:00:00").toLocaleDateString("it-IT", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric",
                          })}
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
                        <p className="font-bold text-primary">Totale: €{Number(booking.totalPrice).toLocaleString("it-IT")}</p>
                      )}
                    </div>

                    {(booking as any).businessId && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl gap-2 flex-shrink-0">
                        <Link href={`/venue/${(booking as any).businessId}`}>
                          <MapPin className="w-4 h-4" />
                          Vedi struttura
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
