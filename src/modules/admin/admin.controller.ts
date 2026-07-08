import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/client";
import * as adminService from "./admin.service";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, status } = req.query;
    const users = await adminService.getAllUsers({
      role: role as Role | undefined,
      status: status as UserStatus | undefined,
    });
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await adminService.updateUserStatus(
      req.user!.id,
      req.params.id as string,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: `User ${user.status === "BANNED" ? "banned" : "unbanned"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
