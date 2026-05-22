import { Router, type IRouter } from "express";
import { db, experiencesTable } from "@workspace/db";
import { eq, gte, lte, and, type SQL } from "drizzle-orm";
import {
  ListExperiencesQueryParams,
  GetExperienceParams,
  ListExperiencesResponse,
  GetExperienceResponse,
  GetExperienceStatsResponse,
} from "@workspace/api-zod";
import { avg, count, countDistinct } from "drizzle-orm";

const router: IRouter = Router();

router.get("/experiences", async (req, res): Promise<void> => {
  const parsed = ListExperiencesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, minPrice, maxPrice, duration, minRating, search } = parsed.data;

  const conditions: SQL[] = [];

  if (category) {
    conditions.push(eq(experiencesTable.category, category));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(experiencesTable.price, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(experiencesTable.price, maxPrice));
  }
  if (minRating !== undefined) {
    conditions.push(gte(experiencesTable.rating, minRating));
  }
  if (duration === "short") {
    conditions.push(lte(experiencesTable.durationMinutes, 119));
  } else if (duration === "medium") {
    conditions.push(gte(experiencesTable.durationMinutes, 120));
    conditions.push(lte(experiencesTable.durationMinutes, 240));
  } else if (duration === "long") {
    conditions.push(gte(experiencesTable.durationMinutes, 241));
  }

  let experiences;
  if (conditions.length > 0) {
    experiences = await db
      .select()
      .from(experiencesTable)
      .where(and(...conditions))
      .orderBy(experiencesTable.createdAt);
  } else {
    experiences = await db
      .select()
      .from(experiencesTable)
      .orderBy(experiencesTable.createdAt);
  }

  // Client-side search filter
  if (search) {
    const q = search.toLowerCase();
    experiences = experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.shortDescription.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }

  res.json(
    ListExperiencesResponse.parse(
      experiences.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    ),
  );
});

router.get("/experiences/stats/summary", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalExperiences: count(experiencesTable.id),
      avgPrice: avg(experiencesTable.price),
      totalCategories: countDistinct(experiencesTable.category),
      avgRating: avg(experiencesTable.rating),
    })
    .from(experiencesTable);

  res.json(
    GetExperienceStatsResponse.parse({
      totalExperiences: stats.totalExperiences ?? 0,
      avgPrice: parseFloat(String(stats.avgPrice ?? "0")),
      totalCategories: stats.totalCategories ?? 0,
      avgRating: parseFloat(String(stats.avgRating ?? "0")),
    }),
  );
});

router.get("/experiences/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetExperienceParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [experience] = await db
    .select()
    .from(experiencesTable)
    .where(eq(experiencesTable.id, parsed.data.id));

  if (!experience) {
    res.status(404).json({ error: "Experience not found" });
    return;
  }

  res.json(
    GetExperienceResponse.parse({
      ...experience,
      createdAt: experience.createdAt.toISOString(),
    }),
  );
});

export default router;
