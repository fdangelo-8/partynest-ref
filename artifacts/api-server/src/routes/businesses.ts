import { Router } from "express";
import { db, businessesTable, packagesTable, wishlistTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, desc, arrayOverlaps } from "drizzle-orm";
import { CreateBusinessBody, UpdateBusinessBody, CreatePackageBody, UpdatePackageBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "unauthorized", message: "Non autenticato" });
  next();
}

router.get("/", async (req, res) => {
  const { city, minPrice, maxPrice, minAge, maxAge, locationType, services, page = "1", limit = "12" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(businessesTable) as any;
  const conditions: any[] = [];

  if (city) conditions.push(ilike(businessesTable.city, `%${city}%`));
  if (minPrice) conditions.push(gte(businessesTable.basePrice, parseFloat(minPrice as string)));
  if (maxPrice) conditions.push(lte(businessesTable.basePrice, parseFloat(maxPrice as string)));
  if (minAge) conditions.push(lte(businessesTable.minAge, parseInt(minAge as string)));
  if (maxAge) conditions.push(gte(businessesTable.maxAge, parseInt(maxAge as string)));
  if (locationType && locationType !== "all") conditions.push(eq(businessesTable.locationType, locationType as any));
  if (services) {
    const serviceList = (services as string).split(",").map(s => s.trim()).filter(Boolean);
    if (serviceList.length > 0) conditions.push(arrayOverlaps(businessesTable.services, serviceList));
  }

  const [countResult, businesses] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(businessesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
    db.select().from(businessesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(businessesTable.visibilityPoints), desc(businessesTable.rating))
      .limit(limitNum)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    businesses,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/", requireAuth, async (req, res) => {
  const user = req.user as any;
  const parsed = CreateBusinessBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const [business] = await db.insert(businessesTable).values({
    ...parsed.data,
    ownerId: user.id,
  }).returning();

  res.status(201).json(business);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const businesses = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!businesses[0]) return res.status(404).json({ error: "not_found", message: "Location non trovata" });

  const packages = await db.select().from(packagesTable)
    .where(and(eq(packagesTable.businessId, id), eq(packagesTable.isActive, true)));

  let isWishlisted = false;
  if (req.user) {
    const user = req.user as any;
    const wishlistItems = await db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, user.id), eq(wishlistTable.businessId, id))).limit(1);
    isWishlisted = wishlistItems.length > 0;
  }

  res.json({ ...businesses[0], packages, isWishlisted });
});

router.put("/:id", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;
  const parsed = UpdateBusinessBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const existing = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!existing[0] || existing[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [updated] = await db.update(businessesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(businessesTable.id, id))
    .returning();

  res.json(updated);
});

router.post("/:id/track-view", async (req, res) => {
  const { id } = req.params;
  await db.update(businessesTable)
    .set({ views: sql`${businessesTable.views} + 1` })
    .where(eq(businessesTable.id, id));
  res.json({ success: true });
});

router.get("/:id/packages", async (req, res) => {
  const { id } = req.params;
  const packages = await db.select().from(packagesTable).where(eq(packagesTable.businessId, id));
  res.json(packages);
});

router.post("/:id/packages", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id } = req.params;
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [pkg] = await db.insert(packagesTable).values({
    ...parsed.data,
    businessId: id,
  }).returning();

  res.status(201).json(pkg);
});

router.put("/:id/packages/:packageId", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id, packageId } = req.params;
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", message: "Dati non validi" });

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  const [updated] = await db.update(packagesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(packagesTable.id, packageId), eq(packagesTable.businessId, id)))
    .returning();

  res.json(updated);
});

router.delete("/:id/packages/:packageId", requireAuth, async (req, res) => {
  const user = req.user as any;
  const { id, packageId } = req.params;

  const business = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!business[0] || business[0].ownerId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Non autorizzato" });
  }

  await db.delete(packagesTable).where(and(eq(packagesTable.id, packageId), eq(packagesTable.businessId, id)));
  res.json({ success: true });
});

export default router;
