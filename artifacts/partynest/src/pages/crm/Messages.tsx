import { useState } from "react";
import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import {
  useListBookings,
  useListMessages,
  useSendMessage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CrmMessages() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: bookings = [], isLoading: loadingBookings } = useListBookings(
    { businessId: businessId! },
    { query: { enabled: !!businessId } }
  );

  const { data: messages = [], isLoading: loadingMessages } = useListMessages(
    { bookingId: selectedBookingId! },
    { query: { enabled: !!selectedBookingId } }
  );

  const { mutate: sendMsg, isPending: sending } = useSendMessage();

  const handleSend = () => {
    if (!replyText.trim() || !selectedBookingId) return;
    sendMsg(
      { data: { bookingId: selectedBookingId, content: replyText.trim() } },
      {
        onSuccess: () => {
          toast({ title: "Messaggio inviato!" });
          setReplyText("");
          queryClient.invalidateQueries({ queryKey: [`/api/messages`, { bookingId: selectedBookingId }] });
        },
        onError: () => toast({ title: "Errore nell'invio", variant: "destructive" }),
      }
    );
  };

  if (loadingBusiness || loadingBookings) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento messaggi...</p></CrmLayout>;
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
          Messaggi
        </h1>
        <p className="text-muted-foreground mt-1">Comunicazioni con i genitori</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nessuna prenotazione ancora</p>
          <p className="text-sm mt-1">Quando ricevi prenotazioni, potrai chattare con i genitori qui</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md shadow-black/5 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Prenotazioni</h3>
            </div>
            <div className="divide-y divide-border">
              {bookings.map(booking => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBookingId(booking.id)}
                  className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors ${
                    selectedBookingId === booking.id ? "bg-primary/5 border-l-2 border-primary" : ""
                  }`}
                >
                  <p className="font-medium text-sm">{booking.parentName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(booking.date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
                    {" · "}
                    {booking.guestCount} ospiti
                  </p>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full font-medium ${
                    booking.status === "accepted" ? "bg-green-100 text-green-700" :
                    booking.status === "rejected" ? "bg-red-100 text-red-700" :
                    booking.status === "cancelled" ? "bg-slate-100 text-slate-500" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {booking.status === "accepted" ? "Confermata" :
                     booking.status === "rejected" ? "Rifiutata" :
                     booking.status === "cancelled" ? "Annullata" : "In attesa"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md shadow-black/5 flex flex-col">
            {selectedBookingId ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-bold">
                    {(() => {
                      const b = bookings.find(b => b.id === selectedBookingId);
                      return b ? `Conversazione con ${b.parentName}` : "Conversazione";
                    })()}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <p className="text-sm text-muted-foreground text-center pt-8">Caricamento messaggi...</p>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground pt-16">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">Nessun messaggio. Scrivi il primo!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe ? "bg-primary text-white" : "bg-slate-100 text-foreground"
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 border-t flex gap-3">
                  <Textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    rows={2}
                    className="resize-none rounded-xl"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sending || !replyText.trim()}
                    className="self-end rounded-xl gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Seleziona una prenotazione per vedere i messaggi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
