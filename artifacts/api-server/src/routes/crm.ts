import { Router } from "express";
import { db, businessesTable, bookingsTable, quotesTable } from "@workspace/db";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import { PurchaseVisibilityBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.get("/my-business", requireAuth, async (req, res) => {
  const user = req.user as any;
  const businesses = await db.select().from(businessesTable)
    .where(eq(businessesTable.ownerId, user.id))
    .limit(1);
  if (!businesses[0]) return res.status(404).json({ error: "not_found", message: "Nessuna struttura trovata" });
  res.json(businesses[0]);
});

router.get("/dashboard", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ error: "validation", message: "businessId richiesto" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId as string)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [allBookings, allQuotes] = await Promise.all([
    db.select().from(bookingsTable).where(eq(bookingsTable.businessId, businessId as string)),
    db.select().from(quotesTable).where(eq(quotesTable.businessId, businessId as string)),
  ]);

  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === "pending").length;
  const acceptedBookings = allBookings.filter(b => b.status === "accepted").length;
  const totalViews = business[0].views;
  const totalQuotes = allQuotes.length;
  const visibilityPoints = business[0].visibilityPoints;

  const recentBookings = allBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentQuotes = allQuotes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const monthlyMap: Record<string, { bookings: number; views: number }> = {};
  allBookings.forEach(b => {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { bookings: 0, views: 0 };
    monthlyMap[key].bookings++;
  });

  const monthlyStats = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }));

  res.json({
    totalBookings,
    pendingBookings,
    acceptedBookings,
    totalViews,
    totalQuotes,
    visibilityPoints,
    recentBookings,
    recentQuotes,
    monthlyStats,
  });
});

router.post("/visibility", requireAuth, async (req, res) => {
  const user = req.user as any;
  const parsed = PurchaseVisibilityBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, parsed.data.businessId)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [updated] = await db.update(businessesTable)
    .set({ visibilityPoints: sql`${businessesTable.visibilityPoints} + ${parsed.data.points}` })
    .where(eq(businessesTable.id, parsed.data.businessId))
    .returning();

  res.json({ visibilityPoints: updated.visibilityPoints, message: "Punti visibilità aggiornati" });
});

export default router;
