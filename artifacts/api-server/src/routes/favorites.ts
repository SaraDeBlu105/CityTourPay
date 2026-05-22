import { Router, type IRouter } from "express";
import { db, favoritesTable, experiencesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddFavoriteBody, RemoveFavoriteParams, ListFavoritesResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request } from "express";

const router: IRouter = Router();

router.get("/favorites", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const favorites = await db
    .select({
      id: favoritesTable.id,
      userId: favoritesTable.userId,
      experienceId: favoritesTable.experienceId,
      createdAt: favoritesTable.createdAt,
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
    .from(favoritesTable)
    .innerJoin(experiencesTable, eq(favoritesTable.experienceId, experiencesTable.id))
    .where(eq(favoritesTable.userId, userId))
    .orderBy(favoritesTable.createdAt);

  res.json(
    ListFavoritesResponse.parse(
      favorites.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        experience: f.experience
          ? { ...f.experience, createdAt: f.experience.createdAt.toISOString() }
          : undefined,
      })),
    ),
  );
});

router.post("/favorites", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const parsed = AddFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { experienceId } = parsed.data;

  const [experience] = await db
    .select()
    .from(experiencesTable)
    .where(eq(experiencesTable.id, experienceId))
    .limit(1);

  if (!experience) {
    res.status(404).json({ error: "Experience not found" });
    return;
  }

  const [favorite] = await db
    .insert(favoritesTable)
    .values({ userId, experienceId })
    .onConflictDoNothing()
    .returning();

  if (!favorite) {
    // Already favorited — return existing
    const [existing] = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.experienceId, experienceId)))
      .limit(1);
    res.status(201).json({
      id: existing.id,
      userId: existing.userId,
      experienceId: existing.experienceId,
      createdAt: existing.createdAt.toISOString(),
      experience: { ...experience, createdAt: experience.createdAt.toISOString() },
    });
    return;
  }

  res.status(201).json({
    id: favorite.id,
    userId: favorite.userId,
    experienceId: favorite.experienceId,
    createdAt: favorite.createdAt.toISOString(),
    experience: { ...experience, createdAt: experience.createdAt.toISOString() },
  });
});

router.delete("/favorites/:experienceId", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const raw = Array.isArray(req.params.experienceId)
    ? req.params.experienceId[0]
    : req.params.experienceId;
  const parsed = RemoveFavoriteParams.safeParse({ experienceId: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.experienceId, parsed.data.experienceId),
      ),
    );

  res.sendStatus(204);
});

export default router;
