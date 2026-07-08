import {
  Prisma,
  RentalStatus,
  Role,
  UserStatus,
} from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import AppError from "../../utils/AppError";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { properties: true, rentalRequests: true },
  },
} satisfies Prisma.UserSelect;

export const getAllUsers = async (filters: {
  role?: Role | undefined;
  status?: UserStatus | undefined;
}) => {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getAllProperties = async () => {
  return prisma.property.findMany({
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true, status: true } },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllRentalRequests = async (filters: {
  status?: string | undefined;
}) => {
  const where: Prisma.RentalRequestWhereInput = {};

  if (filters.status) {
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "ACTIVE",
      "COMPLETED",
    ];
    if (!validStatuses.includes(filters.status)) {
      throw new AppError(
        400,
        `Invalid status filter. Allowed: ${validStatuses.join(", ")}`
      );
    }
    where.status = filters.status as RentalStatus;
  }

  return prisma.rentalRequest.findMany({
    where,
    include: {
      property: { select: { id: true, title: true, location: true } },
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserStatus = async (
  adminId: string,
  userId: string,
  status: UserStatus
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.id === adminId) {
    throw new AppError(400, "You cannot change your own status");
  }

  if (user.role === "ADMIN") {
    throw new AppError(403, "Admins cannot ban other admins");
  }

  if (user.status === status) {
    throw new AppError(400, `User is already ${status.toLowerCase()}`);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: userSelect,
  });
};
