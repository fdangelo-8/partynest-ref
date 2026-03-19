import { Router } from "express";
import { db, availabilityTable, businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.get("/:businessId", async (req, res) => {
  const { businessId } = req.params;
  const { startDate, endDate, month, year } = req.query;

  const rows = await db.select().from(availabilityTable).where(eq(availabilityTable.businessId, businessId));

  let filtered = rows;
  if (startDate) filtered = filtered.filter(r => r.date >= String(startDate));
  if (endDate) filtered = filtered.filter(r => r.date <= String(endDate));
  if (month && year) {
    const prefix = `${String(year)}-${String(month).padStart(2, "0")}`;
    filtered = filtered.filter(r => r.date.startsWith(prefix));
  }

  res.json(filtered);
});

router.post("/:businessId", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { businessId } = req.params;

  const { date, available, timeSlots, note } = req.body ?? {};

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "validation", message: "Campo 'date' non valido (formato YYYY-MM-DD atteso)" });
  }
  if (typeof available !== "boolean") {
    return res.status(400).json({ error: "validation", message: "Campo 'available' (boolean) richiesto" });
  }
  if (!Array.isArray(timeSlots)) {
    return res.status(400).json({ error: "validation", message: "Campo 'timeSlots' (array) richiesto" });
  }

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const slots: string[] = timeSlots.map(String);

  const existing = await db.select().from(availabilityTable)
    .where(and(
      eq(availabilityTable.businessId, businessId),
      eq(availabilityTable.date, date),
    )).limit(1);

  let slot;
  if (existing[0]) {
    [slot] = await db.update(availabilityTable)
      .set({ available, timeSlots: slots, note: note ?? null, updatedAt: new Date() })
      .where(eq(availabilityTable.id, existing[0].id))
      .returning();
  } else {
    [slot] = await db.insert(availabilityTable).values({
      businessId,
      date,
      available,
      timeSlots: slots,
      note: note ?? null,
    }).returning();
  }

  res.json(slot);
});

export default router;
