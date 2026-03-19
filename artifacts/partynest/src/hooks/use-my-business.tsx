import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

async function fetchMyBusiness() {
  const res = await fetch("/api/crm/my-business", { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Errore nel recupero della struttura");
  return res.json();
}

export function useMyBusiness() {
  const { user, isBusiness } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-business", user?.id],
    queryFn: fetchMyBusiness,
    enabled: !!user && isBusiness,
    staleTime: 30_000,
  });

  return {
    business: data ?? undefined,
    businessId: data?.id ?? undefined,
    isLoading,
    refetch,
  };
}
