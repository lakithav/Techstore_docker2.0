import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  specifications: text("specifications"),
  category: text("category").notNull().default("electronics"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Cart item type for frontend
export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;
