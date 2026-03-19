import { useState } from "react";
import { useParams } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { useGetBusiness } from "@workspace/api-client-react";
import { MapPin, Users, Heart, Star, Share, CheckCircle2, ChevronRight, Phone, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VenueDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: venue, isLoading } = useGetBusiness(id);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <MainLayout><div className="flex items-center justify-center p-24">Caricamento...</div></MainLayout>;
  if (!venue) return <MainLayout><div className="text-center p-24">Location non trovata</div></MainLayout>;

  // Fallbacks for demo
  const photos = venue.photos?.length ? venue.photos : [
    "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd0987ab7e29?w=800&q=80"
  ];

  return (
    <MainLayout>
      <div className="bg-background w-full">
        {/* Gallery Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
            <div className="relative h-full rounded-2xl overflow-hidden group cursor-pointer">
              <img src={photos[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={venue.name} />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-slate-700">
                  <Share className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-slate-700 hover:text-primary">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
              {photos.slice(1, 5).map((photo, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src={photo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={`${venue.name} ${i+1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{venue.locationType}</Badge>
                  {venue.rating && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> {venue.rating.toFixed(1)} ({venue.reviewCount} recensioni)
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-4">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {venue.address}, {venue.city}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Fino a {venue.capacity} ospiti</span>
                  <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> Età: {venue.minAge}-{venue.maxAge} anni</span>
                </div>
              </div>

              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-8">
                  <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-4 px-0">La Location</TabsTrigger>
                  <TabsTrigger value="packages" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-4 px-0">Pacchetti e Prezzi</TabsTrigger>
                  <TabsTrigger value="rules" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-4 px-0">Regolamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h3 className="text-2xl font-bold font-display mb-4">Descrizione</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{venue.description || "Nessuna descrizione fornita."}</p>
                  </div>
                  
                  {venue.services && venue.services.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold font-display mb-4">Servizi Inclusi</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {venue.services.map((service, i) => (
                          <div key={i} className="flex items-center gap-3 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="packages" className="pt-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-6">
                    {venue.packages?.map(pkg => (
                      <div key={pkg.id} className="border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold">{pkg.name}</h4>
                            <p className="text-muted-foreground mt-1">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">€{pkg.price}</p>
                            {pkg.priceWeekend && <p className="text-sm text-muted-foreground">€{pkg.priceWeekend} weekend</p>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-medium mb-6">
                          <span className="bg-slate-100 px-3 py-1 rounded-lg">Durata: {pkg.duration}h</span>
                          <span className="bg-slate-100 px-3 py-1 rounded-lg">Max Bambini: {pkg.maxGuests}</span>
                        </div>
                        {pkg.includes && pkg.includes.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {pkg.includes.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                <ChevronRight className="w-4 h-4 text-primary" /> {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {(!venue.packages || venue.packages.length === 0) && (
                      <p className="text-muted-foreground">Nessun pacchetto specifico. Richiedi un preventivo personalizzato.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="pt-8 animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{venue.rules || "Nessun regolamento specifico inserito."}</p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column: Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white border border-border rounded-3xl p-6 shadow-xl shadow-primary/5">
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-1">A partire da</p>
                  <p className="text-3xl font-display font-bold text-foreground">€{venue.basePrice}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <Button className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 text-white font-bold transition-all hover:-translate-y-0.5">
                    Prenota Ora
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-lg rounded-xl border-2 hover:bg-slate-50 font-bold transition-all">
                    Richiedi Preventivo
                  </Button>
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                  {venue.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="w-4 h-4" /> {venue.phone}
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Globe className="w-4 h-4" /> <a href={venue.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">Sito Web</a>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 bg-amber-50 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Pagherai direttamente la struttura. Nessun costo di commissione aggiuntivo con PartyNest!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
