import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { useGetWishlist, useRemoveFromWishlist } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, Users, Star, Trash2 } from "lucide-react";

export default function Wishlist() {
  const { user, isLoading: loadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useGetWishlist({
    query: { enabled: !!user }
  });

  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const items = data?.wishlist || [];

  const handleRemove = (businessId: number) => {
    removeFromWishlist(
      { businessId },
      {
        onSuccess: () => {
          toast({ title: "Rimosso dai preferiti" });
          queryClient.invalidateQueries({ queryKey: ["getWishlist"] });
        },
        onError: () => toast({ title: "Errore durante la rimozione", variant: "destructive" }),
      }
    );
  };

  if (loadingAuth || isLoading) {
    return <MainLayout><div className="text-center py-24 text-muted-foreground">Caricamento...</div></MainLayout>;
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-24">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h2 className="text-2xl font-display font-bold mb-3">Accedi per vedere i tuoi preferiti</h2>
          <p className="text-muted-foreground mb-6">Salva le strutture che ti piacciono per trovarle più facilmente</p>
          <Button asChild className="rounded-full px-8">
            <Link href="/auth/login">Accedi</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            I miei Preferiti
          </h1>
          <p className="text-muted-foreground mt-1">
            {items.length > 0 ? `${items.length} struttura${items.length !== 1 ? "e" : ""} salvata${items.length !== 1 ? "e" : ""}` : "Nessuna struttura salvata"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">Nessun preferito ancora</h3>
            <p className="text-muted-foreground mb-6">Sfoglia le strutture e salva quelle che ti piacciono</p>
            <Button asChild className="rounded-full px-8">
              <Link href="/search">Cerca strutture</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => {
              const b = item.business;
              if (!b) return null;
              return (
                <Card key={item.id} className="rounded-2xl overflow-hidden border-none shadow-md shadow-black/5 group hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
                  <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">🎉</span>
                    </div>
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Rimuovi dai preferiti"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{b.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {b.city}
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      {b.rating && (
                        <span className="flex items-center gap-1 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {Number(b.rating).toFixed(1)}
                        </span>
                      )}
                      {b.maxGuests && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          max {b.maxGuests}
                        </span>
                      )}
                      {b.priceFrom && (
                        <span className="font-bold text-primary">da €{Number(b.priceFrom).toLocaleString("it-IT")}</span>
                      )}
                    </div>
                    <Button asChild size="sm" className="w-full rounded-xl">
                      <Link href={`/venue/${b.id}`}>Vedi struttura</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
