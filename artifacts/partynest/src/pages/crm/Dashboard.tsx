import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { useGetCrmDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Eye, MessageSquare, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CrmDashboard() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();
  const { data: dashboard, isLoading } = useGetCrmDashboard(
    { businessId: businessId! },
    { query: { enabled: !!businessId } }
  );

  if (loadingBusiness || isLoading) {
    return <CrmLayout>Caricamento dashboard...</CrmLayout>;
  }

  if (!businessId) {
    return (
      <CrmLayout>
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold mb-4">Benvenuto nel CRM!</h2>
          <p className="text-muted-foreground">Per iniziare, crea il profilo della tua struttura.</p>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica delle tue prenotazioni e visibilità</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prenotazioni Totali</CardTitle>
            <CalendarCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-amber-500 font-medium">{dashboard?.pendingBookings || 0} in attesa</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visualizzazioni Profilo</CardTitle>
            <Eye className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.totalViews || 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preventivi Ricevuti</CardTitle>
            <MessageSquare className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.totalQuotes || 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-black/5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Punti Visibilità</CardTitle>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{dashboard?.visibilityPoints || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Usali per scalare la classifica</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-md shadow-black/5 p-6">
          <h3 className="font-bold text-lg mb-6">Andamento Mensile</h3>
          <div className="h-72">
            {dashboard?.monthlyStats && dashboard.monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.monthlyStats}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="views" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Visite" />
                  <Bar dataKey="bookings" fill="hsl(347 74% 63%)" radius={[4, 4, 0, 0]} name="Prenotazioni" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Nessun dato sufficiente</div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-none shadow-md shadow-black/5 p-6">
          <h3 className="font-bold text-lg mb-6">Ultime Richieste</h3>
          <div className="space-y-4">
            {dashboard?.recentBookings?.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-medium text-sm">{booking.parentName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(booking.date).toLocaleDateString('it-IT')} • {booking.timeSlot}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </div>
              </div>
            ))}
            {!dashboard?.recentBookings?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">Nessuna richiesta recente.</p>
            )}
          </div>
        </Card>
      </div>
    </CrmLayout>
  );
}
