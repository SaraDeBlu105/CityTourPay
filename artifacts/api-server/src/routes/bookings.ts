import { Router, type IRouter } from "express";
import { db, bookingsTable, experiencesTable, couponsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateBookingBody, ListMyBookingsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request } from "express";

const router: IRouter = Router();

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { experienceId, bookedDate, participants, couponCode } = parsed.data;

  const [experience] = await db
    .select()
    .from(experiencesTable)
    .where(eq(experiencesTable.id, experienceId))
    .limit(1);

  if (!experience) {
    res.status(404).json({ error: "Experience not found" });
    return;
  }

  // Validate and apply coupon if provided
  let couponId: number | null = null;
  let discountPercent: number | null = null;
  let totalPrice = experience.price * participants;

  if (couponCode) {
    const today = new Date().toISOString().split("T")[0];
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(and(eq(couponsTable.code, couponCode.toUpperCase()), eq(couponsTable.isActive, true)))
      .limit(1);

    if (coupon && coupon.validUntil >= today) {
      couponId = coupon.id;
      discountPercent = coupon.discountPercent;
      totalPrice = totalPrice * (1 - coupon.discountPercent / 100);
    }
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId,
      experienceId,
      bookedDate,
      participants,
      couponId: couponId ?? undefined,
      discountPercent: discountPercent ?? undefined,
      totalPrice,
    })
    .returning();

  res.status(201).json({
    id: booking.id,
    userId: booking.userId,
    experienceId: booking.experienceId,
    bookedDate: booking.bookedDate,
    participants: booking.participants,
    couponId: booking.couponId ?? null,
    discountPercent: booking.discountPercent ?? null,
    totalPrice: booking.totalPrice ?? null,
    createdAt: booking.createdAt.toISOString(),
    experience: {
      ...experience,
      createdAt: experience.createdAt.toISOString(),
    },
  });
});

router.get("/bookings/my", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const bookings = await db
    .select({
      id: bookingsTable.id,
      userId: bookingsTable.userId,
      experienceId: bookingsTable.experienceId,
      bookedDate: bookingsTable.bookedDate,
      participants: bookingsTable.participants,
      couponId: bookingsTable.couponId,
      discountPercent: bookingsTable.discountPercent,
      totalPrice: bookingsTable.totalPrice,
      createdAt: bookingsTable.createdAt,
      experience: {
        id: experiencesTable.id,
        title: experiencesTable.title,
        shortDescription: experiencesTable.shortDescription,
        longDescription: experiencesTable.longDescription,
        price: experiencesTable.price,
        durationMinutes: experiencesTable.durationMinutes,
        category: experiencesTable.category,
        rating: experiencesTable.rating,
        reviewCount: experiencesTable.reviewCount,
        imageUrl: experiencesTable.imageUrl,
        createdAt: experiencesTable.createdAt,
      },
    })
    .from(bookingsTable)
    .innerJoin(experiencesTable, eq(bookingsTable.experienceId, experiencesTable.id))
    .where(eq(bookingsTable.userId, userId))
    .orderBy(bookingsTable.createdAt);

  res.json(
    ListMyBookingsResponse.parse(
      bookings.map((b) => ({
        ...b,
        couponId: b.couponId ?? null,
        discountPercent: b.discountPercent ?? null,
        totalPrice: b.totalPrice ?? null,
        createdAt: b.createdAt.toISOString(),
        experience: b.experience
          ? { ...b.experience, createdAt: b.experience.createdAt.toISOString() }
          : undefined,
      })),
    ),
  );
});

export default router;
