import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request } from "express";

const router: IRouter = Router();

router.patch("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ name: parsed.data.name })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(
    UpdateProfileResponse.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    }),
  );
});

export default router;
