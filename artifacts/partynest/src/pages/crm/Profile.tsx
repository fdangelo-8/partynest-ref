import { useState, useEffect } from "react";
import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import { useCreateBusiness, useUpdateBusiness } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, MapPin, Users, Building2 } from "lucide-react";

const CITIES = ["Milano", "Roma", "Firenze", "Torino", "Napoli", "Bologna", "Venezia", "Genova", "Palermo", "Bari"];
const LOCATION_TYPES = [
  { value: "indoor", label: "Spazio interno" },
  { value: "outdoor", label: "Spazio esterno" },
  { value: "both", label: "Interno + esterno" },
];

interface ProfileForm {
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  locationType: "indoor" | "outdoor" | "both";
  capacity: string;
  basePrice: string;
  minAge: string;
  maxAge: string;
  lat: string;
  lng: string;
  rules: string;
}

const emptyForm: ProfileForm = {
  name: "",
  description: "",
  city: "",
  address: "",
  phone: "",
  website: "",
  locationType: "indoor",
  capacity: "",
  basePrice: "",
  minAge: "",
  maxAge: "",
  lat: "",
  lng: "",
  rules: "",
};

export default function CrmProfile() {
  const { business, businessId, isLoading, refetch } = useMyBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || "",
        description: business.description || "",
        city: business.city || "",
        address: business.address || "",
        phone: business.phone || "",
        website: business.website || "",
        locationType: (business.locationType as any) || "indoor",
        capacity: business.capacity?.toString() || "",
        basePrice: business.basePrice?.toString() || "",
        minAge: business.minAge?.toString() || "",
        maxAge: business.maxAge?.toString() || "",
        lat: business.lat?.toString() || "",
        lng: business.lng?.toString() || "",
        rules: business.rules || "",
      });
    }
  }, [business]);

  const { mutate: createBusiness, isPending: creating } = useCreateBusiness();
  const { mutate: updateBusiness, isPending: updating } = useUpdateBusiness();
  const isSaving = creating || updating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.capacity || !form.basePrice) {
      toast({ title: "Compila tutti i campi obbligatori", variant: "destructive" });
      return;
    }

    let website = form.website.trim() || undefined;
    if (website && !website.startsWith("http://") && !website.startsWith("https://")) {
      website = "https://" + website;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      city: form.city,
      address: form.address,
      phone: form.phone || undefined,
      website,
      locationType: form.locationType,
      capacity: parseInt(form.capacity),
      basePrice: parseFloat(form.basePrice),
      minAge: form.minAge ? parseInt(form.minAge) : undefined,
      maxAge: form.maxAge ? parseInt(form.maxAge) : undefined,
      lat: form.lat ? parseFloat(form.lat) : undefined,
      lng: form.lng ? parseFloat(form.lng) : undefined,
      rules: form.rules || undefined,
    };

    if (businessId) {
      updateBusiness(
        { id: businessId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Profilo aggiornato con successo!" });
            queryClient.invalidateQueries({ queryKey: ["listBusinesses"] });
            refetch();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || "Errore durante il salvataggio";
            toast({ title: msg, variant: "destructive" });
          },
        }
      );
    } else {
      createBusiness(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Profilo creato con successo!" });
            queryClient.invalidateQueries({ queryKey: ["listBusinesses"] });
            refetch();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || "Errore durante la creazione";
            toast({ title: msg, variant: "destructive" });
          },
        }
      );
    }
  };

  if (isLoading) {
    return <CrmLayout><div className="text-muted-foreground">Caricamento...</div></CrmLayout>;
  }

  return (
    <CrmLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          {businessId ? "Modifica Profilo Location" : "Crea Profilo Location"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {businessId ? "Aggiorna le informazioni della tua struttura" : "Completa il profilo per iniziare a ricevere prenotazioni"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Informazioni generali */}
        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Generali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="name">Nome della struttura *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Es. Villa delle Fate" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Descrivi la tua struttura, i servizi offerti, l'atmosfera..." rows={5} className="mt-1.5 resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="phone">Telefono di contatto</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+39 02 1234567" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="website">Sito web</Label>
                <Input id="website" name="website" type="text" value={form.website} onChange={handleChange} placeholder="www.example.com" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="rules">Regolamento interno</Label>
              <Textarea id="rules" name="rules" value={form.rules} onChange={handleChange} placeholder="Es. Non sono ammessi animali, i bambini devono essere sempre supervisionati..." rows={3} className="mt-1.5 resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* Posizione */}
        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Posizione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="city">Città *</Label>
                <select id="city" name="city" value={form.city} onChange={handleChange} required className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Seleziona città</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="address">Indirizzo *</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} required placeholder="Via Roma 1" className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="lat">Latitudine (opzionale)</Label>
                <Input id="lat" name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="45.4642" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="lng">Longitudine (opzionale)</Label>
                <Input id="lng" name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="9.1900" className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacità, tipo e prezzi */}
        <Card className="rounded-2xl border-none shadow-md shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Capacità e Prezzi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="locationType">Tipo di spazio *</Label>
              <select id="locationType" name="locationType" value={form.locationType} onChange={handleChange} required className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="capacity">Capienza massima (ospiti) *</Label>
                <Input id="capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required placeholder="50" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="basePrice">Prezzo base (€) *</Label>
                <Input id="basePrice" name="basePrice" type="number" min="0" step="0.01" value={form.basePrice} onChange={handleChange} required placeholder="300.00" className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="minAge">Età minima bambini</Label>
                <Input id="minAge" name="minAge" type="number" min="0" max="18" value={form.minAge} onChange={handleChange} placeholder="1" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="maxAge">Età massima bambini</Label>
                <Input id="maxAge" name="maxAge" type="number" min="0" max="18" value={form.maxAge} onChange={handleChange} placeholder="12" className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg" className="gap-2 rounded-xl px-8">
            <Save className="w-4 h-4" />
            {isSaving ? "Salvataggio..." : businessId ? "Salva modifiche" : "Crea profilo"}
          </Button>
        </div>
      </form>
    </CrmLayout>
  );
}
