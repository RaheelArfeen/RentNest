import prisma from "../../lib/prisma";
import AppError from "../../utils/AppError";

type CreateReviewPayload = {
  propertyId: string;
  rating: number;
  comment: string;
};

export const createReview = async (
  tenantId: string,
  payload: CreateReviewPayload
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: "COMPLETED",
    },
  });

  if (!completedRental) {
    throw new AppError(
      403,
      "You can only review properties after completing a rental"
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { tenantId, propertyId: payload.propertyId },
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this property");
  }

  return prisma.review.create({
    data: { ...payload, tenantId },
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
  });
};
