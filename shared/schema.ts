import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: real("amount").notNull(),
  price: real("price").notNull(),
  bdcAmount: real("bdc_amount").notNull(),
  email: varchar("email").notNull(),
  referralCode: varchar("referral_code"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  referralCode: varchar("referral_code").unique(),
  username: varchar("username").unique(),
  password: varchar("password"),
  hasDeposited: varchar("has_deposited").default("false"),
  walletPhrase: text("wallet_phrase").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  price: real("price").notNull(),
  changePercent: real("change_percent").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const tokenStats = pgTable("token_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalSupply: bigint("total_supply", { mode: "number" }).notNull().default(600000000000),
  soldSupply: bigint("sold_supply", { mode: "number" }).notNull().default(271838183177),
  currentPrice: real("current_price").notNull().default(17.0000),
  totalDividendsDistributed: real("total_dividends_distributed").notNull().default(2847293.47),
  activeDividendHolders: bigint("active_dividend_holders", { mode: "number" }).notNull().default(15847),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  amount: true,
  price: true,
  bdcAmount: true,
  email: true,
  referralCode: true,
  transactionHash: true,
}).extend({
  amount: z.number().min(70, "Minimal pembelian adalah 70 USDC"),
  email: z.string().email("Format email tidak valid"),
  referralCode: z.string().optional(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  referralCode: true,
  username: true,
  password: true,
  hasDeposited: true,
  walletPhrase: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).pick({
  price: true,
  changePercent: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type User = typeof users.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type TokenStats = typeof tokenStats.$inferSelect;
