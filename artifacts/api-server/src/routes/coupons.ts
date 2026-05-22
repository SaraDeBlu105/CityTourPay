import { Router, type IRouter } from "express";
import { db, couponsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ValidateCouponQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /coupons/validate?code=...
router.get("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.json({ valid: false, message: "Codice mancante" });
    return;
  }

  const code = parsed.data.code.toUpperCase();
  const today = new Date().toISOString().split("T")[0];

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(and(eq(couponsTable.code, code), eq(couponsTable.isActive, true)))
    .limit(1);

  if (!coupon) {
    res.json({ valid: false, message: "Codice coupon non valido" });
    return;
  }

  if (coupon.validUntil < today) {
    res.json({ valid: false, message: "Coupon scaduto" });
    return;
  }

  res.json({ valid: true, discountPercent: coupon.discountPercent, code: coupon.code });
});

export default router;
