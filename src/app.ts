import cors from "cors";
import express, { Application, Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/category/category.routes";
import {
  landlordPropertyRoutes,
  publicPropertyRoutes,
} from "./modules/property/property.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/properties", publicPropertyRoutes);
app.use("/api/landlord/properties", landlordPropertyRoutes);

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
