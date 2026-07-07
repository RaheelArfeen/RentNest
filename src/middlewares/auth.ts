import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import AppError from "../utils/AppError";
import { Role } from "../generated/prisma/client";

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export const auth = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(401, "You are not authorized. Please login first");
      }

      const token = authHeader.split(" ")[1] as string;

      let decoded: JwtUser;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || ""
        ) as JwtUser;
      } catch {
        throw new AppError(401, "Invalid or expired token");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError(401, "User no longer exists");
      }

      if (user.status === "BANNED") {
        throw new AppError(403, "Your account has been banned");
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new AppError(403, "You do not have permission for this action");
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
};
