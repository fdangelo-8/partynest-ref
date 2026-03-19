import { Link } from "wouter";
import { Heart, MapPin, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business } from "@workspace/api-client-react";

export function VenueCard({ venue }: { venue: Business }) {
  // Use unsplash placeholder if no photos
  const imageUrl = venue.photos?.[0] || "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&q=80";

  return (
    <Link href={`/venue/${venue.id}`}>
      <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full">
        {/* Image Container */}
        <div className="relative h-56 w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={venue.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 z-10">
            <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-slate-400 hover:text-primary border-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add to wishlist mutation */ }}>
              <Heart className="w-5 h-5" />
            </Button>
          </div>
          {venue.locationType === "outdoor" && (
            <div className="absolute top-4 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              All'aperto
            </div>
          )}
          {venue.locationType === "indoor" && (
            <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Al coperto
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-bold text-lg text-foreground line-clamp-1">{venue.name}</h3>
            {venue.rating ? (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{venue.rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <MapPin className="w-4 h-4 text-primary/60" />
            <span className="line-clamp-1">{venue.city} • {venue.address}</span>
          </div>

          <div className="flex items-center gap-4 mt-auto mb-5 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              <Users className="w-4 h-4" />
              <span>Fino a {venue.capacity}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              <span className="font-medium">Età:</span> {venue.minAge}-{venue.maxAge}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
            <div>
              <p className="text-xs text-muted-foreground">A partire da</p>
              <p className="font-bold text-lg text-foreground">€{venue.basePrice}</p>
            </div>
            <Button className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 transition-all text-white font-semibold">
              Scopri
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
