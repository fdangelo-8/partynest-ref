import { Router } from "express";
import { db, wishlistTable, businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToWishlistBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.get("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const items = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, user.id));

  const enriched = await Promise.all(
    items.map(async (item) => {
      const business = await db.select().from(businessesTable).where(eq(businessesTable.id, item.businessId)).limit(1);
      return { ...item, business: business[0] ?? null };
    })
  );

  res.json(enriched);
});

router.post("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const parsed = AddToWishlistBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, user.id), eq(wishlistTable.businessId, parsed.data.businessId)))
    .limit(1);

  if (existing[0]) return res.status(400).json({ error: "duplicate", message: "Già nei preferiti" });

  const [item] = await db.insert(wishlistTable).values({
    userId: user.id,
    businessId: parsed.data.businessId,
  }).returning();

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, item.businessId)).limit(1);
  res.status(201).json({ ...item, business: business[0] ?? null });
});

router.delete("/:businessId", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { businessId } = req.params;

  await db.delete(wishlistTable).where(
    and(eq(wishlistTable.userId, user.id), eq(wishlistTable.businessId, businessId))
  );

  res.json({ success: true });
});

export default router;
