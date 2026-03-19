import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import businessesRouter from "./businesses.js";
import availabilityRouter from "./availability.js";
import bookingsRouter from "./bookings.js";
import quotesRouter from "./quotes.js";
import messagesRouter from "./messages.js";
import wishlistRouter from "./wishlist.js";
import crmRouter from "./crm.js";
import downloadRouter from "./download.js";
const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/businesses", businessesRouter);
router.use("/availability", availabilityRouter);
router.use("/bookings", bookingsRouter);
router.use("/quotes", quotesRouter);
router.use("/messages", messagesRouter);
router.use("/wishlist", wishlistRouter);
router.use("/crm", crmRouter);
router.use(downloadRouter);

export default router;
