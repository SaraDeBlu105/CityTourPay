import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import experiencesRouter from "./experiences";
import bookingsRouter from "./bookings";
import favoritesRouter from "./favorites";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(experiencesRouter);
router.use(bookingsRouter);
router.use(favoritesRouter);
router.use(usersRouter);

export default router;
