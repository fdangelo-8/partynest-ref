import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { VenueCard } from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, Star, CheckCircle } from "lucide-react";
import { useListBusinesses } from "@workspace/api-client-react";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");

  const { data: featuredVenues, isLoading } = useListBusinesses({ limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Festa per bambini" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground leading-tight mb-6">
              Trova la <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">location perfetta</span> per la sua festa.
            </h1>
            <p className="text-lg md:text-xl text-slate-700 mb-10 max-w-xl">
              Scopri, confronta e prenota le migliori strutture per feste per bambini in Italia. Senza stress, tutto online.
            </p>

            <form onSubmit={handleSearch} className="glass-panel p-2 md:p-3 rounded-2xl flex flex-col md:flex-row gap-2 max-w-4xl shadow-2xl">
              <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 md:py-0 border border-slate-200">
                <MapPin className="w-5 h-5 text-primary/60 mr-3" />
                <Input 
                  placeholder="Dove cerchi? (es. Roma, Milano)" 
                  className="border-0 shadow-none focus-visible:ring-0 px-0"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 md:py-0 border border-slate-200">
                <Users className="w-5 h-5 text-primary/60 mr-3" />
                <Input 
                  type="number"
                  placeholder="Numero invitati" 
                  className="border-0 shadow-none focus-visible:ring-0 px-0"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                <Search className="w-5 h-5 mr-2" />
                Cerca
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">Location in evidenza</h2>
              <p className="text-muted-foreground">Le strutture più amate e prenotate dai genitori.</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/search")} className="hidden md:flex rounded-xl">
              Vedi tutte
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVenues?.businesses.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" onClick={() => setLocation("/search")} className="rounded-xl w-full">
              Vedi tutte le location
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Come funziona PartyNest?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Organizzare la festa perfetta non è mai stato così semplice e veloce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Trova la location</h3>
              <p className="text-muted-foreground">Filtra per città, prezzo, servizi e scopri le migliori strutture nella tua zona.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Star className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Scegli il pacchetto</h3>
              <p className="text-muted-foreground">Confronta foto, servizi e prezzi. Scegli il pacchetto più adatto alle tue esigenze.</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Prenota online</h3>
              <p className="text-muted-foreground">Invia la richiesta direttamente dal portale. Risposta garantita in 24h.</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
