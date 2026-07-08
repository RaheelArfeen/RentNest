import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { JwtUser } from "../../middlewares/auth";
import AppError from "../../utils/AppError";

const rentalInclude = {
  property: {
    select: {
      id: true,
      title: true,
      location: true,
      price: true,
      landlordId: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
  },
  tenant: { select: { id: true, name: true, email: true } },
  payment: true,
} satisfies Prisma.RentalRequestInclude;

type CreateRentalPayload = {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  message?: string;
};

export const createRentalRequest = async (
  tenantId: string,
  payload: CreateRentalPayload
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (!property.isAvailable) {
    throw new AppError(400, "This property is not available for rent");
  }

  if (property.landlordId === tenantId) {
    throw new AppError(400, "You cannot request to rent your own property");
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingRequest) {
    throw new AppError(
      409,
      "You already have an active rental request for this property"
    );
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      message: payload.message ?? null,
    },
    include: rentalInclude,
  });
};

export const getMyRentalRequests = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: rentalInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getRentalRequestById = async (id: string, user: JwtUser) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: rentalInclude,
  });

  if (!request) {
    throw new AppError(404, "Rental request not found");
  }

  const isTenant = request.tenantId === user.id;
  const isLandlord = request.property.landlordId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new AppError(403, "You do not have access to this rental request");
  }

  return request;
};

export const getLandlordRentalRequests = async (landlordId: string) => {
  return prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: rentalInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const updateRentalStatus = async (
  requestId: string,
  landlordId: string,
  status: "APPROVED" | "REJECTED"
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!request) {
    throw new AppError(404, "Rental request not found");
  }

  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      403,
      "You can only manage requests for your own properties"
    );
  }

  if (request.status !== "PENDING") {
    throw new AppError(
      400,
      `This request has already been ${request.status.toLowerCase()}`
    );
  }

  return prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status },
    include: rentalInclude,
  });
};

export const completeRental = async (requestId: string, landlordId: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!request) {
    throw new AppError(404, "Rental request not found");
  }

  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      403,
      "You can only manage requests for your own properties"
    );
  }

  if (request.status !== "ACTIVE") {
    throw new AppError(
      400,
      `Only active rentals can be completed. Current status: ${request.status}`
    );
  }

  const [completedRequest] = await prisma.$transaction([
    prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED" },
      include: rentalInclude,
    }),
    prisma.property.update({
      where: { id: request.propertyId },
      data: { isAvailable: true },
    }),
  ]);

  return completedRequest;
};
