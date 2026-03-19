import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { VenueCard } from "@/components/VenueCard";
import { Map } from "@/components/Map";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapIcon, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { useListBusinesses } from "@workspace/api-client-react";

function getSearchParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

const MAX_PRICE = 2000;

const SERVICE_OPTIONS = [
  { label: "Animatori", icon: "🎭" },
  { label: "Allestimento", icon: "🎀" },
  { label: "Catering", icon: "🍕" },
  { label: "Gonfiabili", icon: "🎈" },
  { label: "Torta inclusa", icon: "🎂" },
  { label: "Piscina", icon: "🏊" },
  { label: "Laboratori creativi", icon: "🎨" },
  { label: "Truccabimbi", icon: "💄" },
  { label: "Area giochi", icon: "🎠" },
  { label: "Fotografo", icon: "📸" },
  { label: "Parcheggio", icon: "🅿️" },
  { label: "Wi-Fi gratuito", icon: "📶" },
];

export default function Search() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [city, setCity] = useState("");
  const [locationType, setLocationType] = useState("all");
  const [priceRange, setPriceRange] = useState([MAX_PRICE]);
  const [priceFilterActive, setPriceFilterActive] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    const lt = getSearchParam("locationType");
    if (lt && ["indoor", "outdoor", "both"].includes(lt)) {
      setLocationType(lt);
    }
    const c = getSearchParam("city");
    if (c) setCity(c);
  }, []);

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const { data, isLoading } = useListBusinesses({
    city: city || undefined,
    locationType: locationType !== "all" ? locationType as any : undefined,
    maxPrice: priceFilterActive ? priceRange[0] : undefined,
    services: selectedServices.length > 0 ? selectedServices.join(",") : undefined,
    limit: 50,
  });

  const businesses = data?.businesses || [];

  const hasFilters = city || locationType !== "all" || priceFilterActive || selectedServices.length > 0;

  const resetFilters = () => {
    setCity("");
    setLocationType("all");
    setPriceRange([MAX_PRICE]);
    setPriceFilterActive(false);
    setSelectedServices([]);
  };

  return (
    <MainLayout>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filtra risultati
              </h3>
              {hasFilters && (
                <button onClick={resetFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Azzera
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Città</label>
                <Input
                  placeholder="Es. Roma"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Tipo di Location</label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="indoor">Al coperto</SelectItem>
                    <SelectItem value="outdoor">All'aperto</SelectItem>
                    <SelectItem value="both">Interno + esterno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Prezzo massimo
                    {!priceFilterActive && <span className="text-muted-foreground ml-1">(qualsiasi)</span>}
                  </label>
                  {priceFilterActive && (
                    <span className="text-sm font-bold text-primary">€{priceRange[0]}</span>
                  )}
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(v) => { setPriceRange(v); setPriceFilterActive(true); }}
                  max={MAX_PRICE}
                  min={50}
                  step={50}
                />
                {priceFilterActive && (
                  <button
                    onClick={() => { setPriceRange([MAX_PRICE]); setPriceFilterActive(false); }}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Rimuovi filtro prezzo
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Servizi inclusi</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(({ label, icon }) => {
                    const active = selectedServices.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleService(label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                        }`}
                      >
                        <span>{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
                {selectedServices.length > 0 && (
                  <button
                    onClick={() => setSelectedServices([])}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Rimuovi filtro servizi
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold font-display">
              {isLoading
                ? "Ricerca in corso..."
                : `${data?.total ?? businesses.length} Location${(data?.total ?? businesses.length) !== 1 ? "" : ""} trovate`}
            </h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg ${viewMode === "grid" ? "shadow-sm" : ""}`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Griglia
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={`rounded-lg ${viewMode === "map" ? "shadow-sm" : ""}`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Mappa
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {businesses.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
              {businesses.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-lg font-medium text-muted-foreground">Nessuna location trovata</p>
                  <p className="text-sm text-muted-foreground mt-1">Prova a modificare i criteri di ricerca</p>
                  {hasFilters && (
                    <button onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline">
                      Azzera tutti i filtri
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-sm border border-border">
              <Map venues={businesses} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
