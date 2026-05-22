import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable, couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ReplyToReviewBody,
  ApproveReviewParams,
  ReplyToReviewParams,
  DeleteReviewParams,
  CreateCouponBody,
  UpdateCouponParams,
  UpdateCouponBody,
  DeleteCouponParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { recalcExperienceRating } from "./reviews";

const router: IRouter = Router();

function serializeReview(review: typeof reviewsTable.$inferSelect, userName?: string | null) {
  return {
    id: review.id,
    userId: review.userId,
    experienceId: review.experienceId,
    rating: review.rating,
    comment: review.comment,
    reply: review.reply ?? null,
    isApproved: review.isApproved,
    userName: userName ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

function serializeCoupon(coupon: typeof couponsTable.$inferSelect) {
  return {
    id: coupon.id,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    validUntil: coupon.validUntil,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
  };
}

// ─── REVIEWS ────────────────────────────────────────────────────────────────

// GET /admin/reviews/pending
router.get("/admin/reviews/pending", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({ review: reviewsTable, userName: usersTable.name })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.isApproved, false))
    .orderBy(reviewsTable.createdAt);

  res.json(rows.map((r) => serializeReview(r.review, r.userName)));
});

// PATCH /admin/reviews/:id/approve
router.patch("/admin/reviews/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const paramsResult = ApproveReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid review id" });
    return;
  }

  const [review] = await db
    .update(reviewsTable)
    .set({ isApproved: true, updatedAt: new Date() })
    .where(eq(reviewsTable.id, paramsResult.data.id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  await recalcExperienceRating(review.experienceId);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, review.userId)).limit(1);
  res.json(serializeReview(review, user?.name));
});

// PATCH /admin/reviews/:id/reply
router.patch("/admin/reviews/:id/reply", requireAdmin, async (req, res): Promise<void> => {
  const paramsResult = ReplyToReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid review id" });
    return;
  }

  const bodyResult = ReplyToReviewBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const [review] = await db
    .update(reviewsTable)
    .set({ reply: bodyResult.data.reply, updatedAt: new Date() })
    .where(eq(reviewsTable.id, paramsResult.data.id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, review.userId)).limit(1);
  res.json(serializeReview(review, user?.name));
});

// DELETE /admin/reviews/:id
router.delete("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const paramsResult = DeleteReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid review id" });
    return;
  }

  const [deleted] = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, paramsResult.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  await recalcExperienceRating(deleted.experienceId);
  res.status(204).end();
});

// ─── COUPONS ─────────────────────────────────────────────────────────────────

// GET /admin/coupons
router.get("/admin/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable).orderBy(couponsTable.createdAt);
  res.json(coupons.map(serializeCoupon));
});

// POST /admin/coupons
router.post("/admin/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code, discountPercent, validUntil, isActive } = parsed.data;

  try {
    const [coupon] = await db
      .insert(couponsTable)
      .values({ code: code.toUpperCase(), discountPercent, validUntil, isActive: isActive ?? true })
      .returning();
    res.status(201).json(serializeCoupon(coupon));
  } catch {
    res.status(400).json({ error: "Coupon code already exists" });
  }
});

// PATCH /admin/coupons/:id
router.patch("/admin/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const paramsResult = UpdateCouponParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid coupon id" });
    return;
  }

  const bodyResult = UpdateCouponBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const updates: Partial<typeof couponsTable.$inferInsert> = {};
  if (bodyResult.data.isActive !== undefined) updates.isActive = bodyResult.data.isActive;
  if (bodyResult.data.code !== undefined) updates.code = bodyResult.data.code.toUpperCase();
  if (bodyResult.data.discountPercent !== undefined) updates.discountPercent = bodyResult.data.discountPercent;
  if (bodyResult.data.validUntil !== undefined) updates.validUntil = bodyResult.data.validUntil;

  const [coupon] = await db
    .update(couponsTable)
    .set(updates)
    .where(eq(couponsTable.id, paramsResult.data.id))
    .returning();

  if (!coupon) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }

  res.json(serializeCoupon(coupon));
});

// DELETE /admin/coupons/:id
router.delete("/admin/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const paramsResult = DeleteCouponParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid coupon id" });
    return;
  }

  const [deleted] = await db
    .delete(couponsTable)
    .where(eq(couponsTable.id, paramsResult.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }

  res.status(204).end();
});

export default router;
