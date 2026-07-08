import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import errorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/category/category.routes";
import {
  landlordPropertyRoutes,
  publicPropertyRoutes,
} from "./modules/property/property.routes";
import {
  landlordRentalRoutes,
  rentalRoutes,
} from "./modules/rental/rental.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import reviewRoutes from "./modules/review/review.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/properties", publicPropertyRoutes);
app.use("/api/landlord/properties", landlordPropertyRoutes);
app.use("/api/landlord/requests", landlordRentalRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RentNest API is running",
    errorDetails: null,
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
