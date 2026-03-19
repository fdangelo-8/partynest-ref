import { useState } from "react";
import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { useGetAvailability, useSetAvailability } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const MONTHS_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const DAYS_IT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const TIME_SLOTS = ["09:00-13:00", "14:00-18:00", "15:00-19:00", "16:00-20:00", "10:00-14:00", "18:00-22:00"];

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CrmCalendar() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(getDaysInMonth(currentYear, currentMonth)).padStart(2, "0")}`;

  const { data: availData, isLoading } = useGetAvailability(
    businessId!,
    { month: currentMonth + 1, year: currentYear },
    { query: { enabled: !!businessId } }
  );

  const { mutate: setAvail, isPending: saving } = useSetAvailability();

  const availability: any[] = Array.isArray(availData) ? availData : [];

  const availByDate: Record<string, { available: boolean; timeSlots?: string[] }> = {};
  availability.forEach((a: any) => {
    availByDate[a.date] = { available: a.available, timeSlots: a.timeSlots || [] };
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = availByDate[dateStr];
    setSelectedSlots(existing?.timeSlots || []);
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const saveAvail = (available: boolean, slots: string[]) => {
    if (!selectedDate || !businessId) return;
    setAvail(
      {
        businessId,
        data: { date: selectedDate, available, timeSlots: slots } as any,
      },
      {
        onSuccess: () => {
          toast({ title: available ? "Disponibilità aggiornata!" : "Data segnata come non disponibile" });
          queryClient.invalidateQueries({ queryKey: [`/api/availability/${businessId}`] });
          if (!available) setSelectedSlots([]);
        },
        onError: () => toast({ title: "Errore durante il salvataggio", variant: "destructive" }),
      }
    );
  };

  const handleSave = () => saveAvail(selectedSlots.length > 0, selectedSlots);
  const handleMarkUnavailable = () => saveAvail(false, []);

  if (loadingBusiness || isLoading) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento calendario...</p></CrmLayout>;
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

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = toDateString(today);

  return (
    <CrmLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-primary" />
          Calendario Disponibilità
        </h1>
        <p className="text-muted-foreground mt-1">Gestisci le date e gli orari disponibili per le prenotazioni</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="rounded-2xl border-none shadow-md shadow-black/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-lg font-bold">
                  {MONTHS_IT[currentMonth]} {currentYear}
                </CardTitle>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 mb-2">
                {DAYS_IT.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const avail = availByDate[dateStr];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isPast = dateStr < todayStr;

                  let bg = "hover:bg-slate-100";
                  if (isSelected) bg = "bg-primary text-white shadow-md shadow-primary/20";
                  else if (avail?.available && (avail.timeSlots?.length ?? 0) > 0) bg = "bg-green-100 text-green-800 hover:bg-green-200";
                  else if (avail?.available === false) bg = "bg-red-100 text-red-600 hover:bg-red-200";
                  else if (isPast) bg = "opacity-30 cursor-not-allowed";

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isPast && handleSelectDate(dateStr)}
                      disabled={isPast}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-150 ${bg} ${isToday && !isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" /> Disponibile</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" /> Non disponibile</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300" /> Non impostato</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedDate ? (
            <Card className="rounded-2xl border-none shadow-md shadow-black/5 sticky top-8">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Seleziona gli slot orari disponibili:</p>
                <div className="space-y-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedSlots.includes(slot)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-50 text-foreground hover:bg-slate-100"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl">
                    {saving ? "Salvataggio..." : "Salva disponibilità"}
                  </Button>
                  <Button onClick={handleMarkUnavailable} disabled={saving} variant="outline" className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                    Segna come non disponibile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-none shadow-md shadow-black/5">
              <CardContent className="py-12 text-center">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">Seleziona una data per impostare la disponibilità</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CrmLayout>
  );
}
