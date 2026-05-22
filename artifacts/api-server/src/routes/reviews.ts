import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable, experiencesTable } from "@workspace/db";
import { eq, and, avg, count } from "drizzle-orm";
import { CreateReviewBody, CreateReviewParams } from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request } from "express";

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

// GET /experiences/:id/reviews — approved reviews only
router.get("/experiences/:id/reviews", optionalAuth, async (req, res): Promise<void> => {
  const paramsResult = CreateReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid experience id" });
    return;
  }
  const experienceId = paramsResult.data.id;

  const rows = await db
    .select({
      review: reviewsTable,
      userName: usersTable.name,
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(and(eq(reviewsTable.experienceId, experienceId), eq(reviewsTable.isApproved, true)))
    .orderBy(reviewsTable.createdAt);

  res.json(rows.map((r) => serializeReview(r.review, r.userName)));
});

// POST /experiences/:id/reviews — submit a review (auth required)
router.post("/experiences/:id/reviews", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;
  const experienceId = Number(req.params.id);

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { rating, comment } = parsed.data;

  const [experience] = await db
    .select()
    .from(experiencesTable)
    .where(eq(experiencesTable.id, experienceId))
    .limit(1);

  if (!experience) {
    res.status(404).json({ error: "Experience not found" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ userId, experienceId, rating, comment })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.status(201).json(serializeReview(review, user?.name));
});

export async function recalcExperienceRating(experienceId: number): Promise<void> {
  const result = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .where(and(eq(reviewsTable.experienceId, experienceId), eq(reviewsTable.isApproved, true)));

  const avgRating = result[0]?.avgRating ? Number(result[0].avgRating) : null;
  const reviewCount = result[0]?.reviewCount ?? 0;

  if (avgRating !== null) {
    await db
      .update(experiencesTable)
      .set({ rating: avgRating, reviewCount })
      .where(eq(experiencesTable.id, experienceId));
  }
}

export default router;
