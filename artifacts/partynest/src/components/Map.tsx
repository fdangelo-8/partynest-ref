import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Business } from "@workspace/api-client-react";
import { Link } from "wouter";
import L from "leaflet";

// Fix for default Leaflet icon issues in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  venues: Business[];
  center?: [number, number];
  zoom?: number;
}

export function Map({ venues, center = [41.9028, 12.4964], zoom = 6 }: MapProps) {
  // Ensure we only run on client
  if (typeof window === 'undefined') return null;

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((venue) => {
          if (!venue.lat || !venue.lng) return null;
          
          return (
            <Marker key={venue.id} position={[venue.lat, venue.lng]} icon={customIcon}>
              <Popup className="rounded-xl overflow-hidden p-0">
                <div className="w-48 flex flex-col">
                  {/* kids party place placeholder */}
                  <img 
                    src={venue.photos?.[0] || "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=400&q=80"} 
                    alt={venue.name} 
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">{venue.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{venue.city}</p>
                    <p className="font-bold text-primary mb-2">€{venue.basePrice}</p>
                    <Link href={`/venue/${venue.id}`}>
                      <span className="block text-center w-full bg-primary text-white text-xs py-1.5 rounded-lg font-medium cursor-pointer">
                        Vedi Dettagli
                      </span>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
