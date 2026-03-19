import { pgTable, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const locationTypeEnum = pgEnum("location_type", ["indoor", "outdoor", "both"]);

export const businessesTable = pgTable("businesses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city").notNull(),
  address: text("address").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  locationType: locationTypeEnum("location_type").notNull().default("indoor"),
  minAge: integer("min_age").default(0),
  maxAge: integer("max_age").default(18),
  capacity: integer("capacity").notNull(),
  basePrice: real("base_price").notNull(),
  photos: text("photos").array().default([]),
  services: text("services").array().default([]),
  rules: text("rules"),
  phone: text("phone"),
  website: text("website"),
  visibilityPoints: integer("visibility_points").notNull().default(100),
  views: integer("views").notNull().default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
