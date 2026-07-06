import cors from "cors";
import express, { Application, Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(cors());
app.use(express.json());

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
