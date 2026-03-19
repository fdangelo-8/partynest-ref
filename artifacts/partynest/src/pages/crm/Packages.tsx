import { useState } from "react";
import { CrmLayout } from "@/components/layout/CrmLayout";
import { useMyBusiness } from "@/hooks/use-my-business";
import {
  useGetBusinessPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, X, Check } from "lucide-react";

interface PackageForm {
  name: string;
  description: string;
  price: string;
  duration: string;
  maxGuests: string;
}

const emptyForm: PackageForm = { name: "", description: "", price: "", duration: "", maxGuests: "" };

export default function CrmPackages() {
  const { businessId, isLoading: loadingBusiness } = useMyBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: packages, isLoading } = useGetBusinessPackages(
    businessId!,
    { query: { enabled: !!businessId } }
  );

  const { mutate: createPkg, isPending: creating } = useCreatePackage();
  const { mutate: updatePkg, isPending: updating } = useUpdatePackage();
  const { mutate: deletePkg } = useDeletePackage();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);

  const pkgList = Array.isArray(packages) ? packages : [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["getBusinessPackages", businessId] });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (pkg: (typeof pkgList)[0]) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price?.toString() || "",
      duration: pkg.duration?.toString() || "",
      maxGuests: pkg.maxGuests?.toString() || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessId) return;

    const price = parseFloat(form.price);
    const duration = parseInt(form.duration);
    const maxGuests = parseInt(form.maxGuests);

    if (isNaN(price) || isNaN(duration) || isNaN(maxGuests)) {
      toast({ title: "Compila tutti i campi obbligatori", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price,
      duration,
      maxGuests,
    };

    if (editingId !== null) {
      updatePkg(
        { id: businessId, packageId: editingId, data: payload },
        {
          onSuccess: () => { toast({ title: "Pacchetto aggiornato!" }); invalidate(); handleCancel(); },
          onError: () => toast({ title: "Errore durante l'aggiornamento", variant: "destructive" }),
        }
      );
    } else {
      createPkg(
        { id: businessId, data: payload },
        {
          onSuccess: () => { toast({ title: "Pacchetto creato!" }); invalidate(); handleCancel(); },
          onError: (err: any) => toast({ title: err?.message || "Errore durante la creazione", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (pkgId: string) => {
    if (!businessId) return;
    if (!confirm("Vuoi davvero eliminare questo pacchetto?")) return;
    deletePkg(
      { id: businessId, packageId: pkgId },
      {
        onSuccess: () => { toast({ title: "Pacchetto eliminato" }); invalidate(); },
        onError: () => toast({ title: "Errore durante l'eliminazione", variant: "destructive" }),
      }
    );
  };

  if (loadingBusiness || isLoading) {
    return <CrmLayout><p className="text-muted-foreground">Caricamento pacchetti...</p></CrmLayout>;
  }

  if (!businessId) {
    return (
      <CrmLayout>
        <div className="text-center py-24">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-medium">Prima crea il profilo della tua struttura nella sezione "Profilo Location".</p>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Pacchetti
          </h1>
          <p className="text-muted-foreground mt-1">Gestisci le offerte disponibili per la tua struttura</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Nuovo Pacchetto
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="rounded-2xl border-none shadow-md shadow-black/5 mb-8">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-5">{editingId ? "Modifica Pacchetto" : "Nuovo Pacchetto"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pkg-name">Nome *</Label>
                  <Input id="pkg-name" name="name" value={form.name} onChange={handleChange} required placeholder="Es. Festa Deluxe" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="pkg-price">Prezzo (€) *</Label>
                  <Input id="pkg-price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="500.00" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="pkg-duration">Durata (ore) *</Label>
                  <Input id="pkg-duration" name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required placeholder="4" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="pkg-guests">Max ospiti *</Label>
                  <Input id="pkg-guests" name="maxGuests" type="number" min="1" value={form.maxGuests} onChange={handleChange} required placeholder="30" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="pkg-desc">Descrizione</Label>
                <Textarea id="pkg-desc" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Incluso: decorazioni, torta, DJ, ecc." className="mt-1.5 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="gap-2 rounded-xl">
                  <X className="w-4 h-4" /> Annulla
                </Button>
                <Button type="submit" disabled={creating || updating} className="gap-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  {creating || updating ? "Salvataggio..." : editingId ? "Salva modifiche" : "Crea pacchetto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {pkgList.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nessun pacchetto ancora</p>
          <p className="text-sm mt-1">Crea il tuo primo pacchetto per attrarre i genitori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pkgList.map(pkg => (
            <Card key={pkg.id} className="rounded-2xl border-none shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/8 transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-base">{pkg.name}</h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => startEdit(pkg)} className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {pkg.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary text-lg">€{pkg.price?.toLocaleString('it-IT')}</span>
                  <div className="text-right text-muted-foreground">
                    {pkg.duration && <div>{pkg.duration}h</div>}
                    {pkg.maxGuests && <div>max {pkg.maxGuests} ospiti</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CrmLayout>
  );
}
