import { pgTable, serial, timestamp, integer, text, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { experiencesTable } from "./experiences";
import { couponsTable } from "./coupons";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  experienceId: integer("experience_id").notNull().references(() => experiencesTable.id),
  bookedDate: text("booked_date").notNull(),
  participants: integer("participants").notNull().default(1),
  couponId: integer("coupon_id").references(() => couponsTable.id),
  discountPercent: integer("discount_percent"),
  totalPrice: real("total_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
