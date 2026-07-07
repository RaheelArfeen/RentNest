import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import AppError from "../../utils/AppError";

type PropertyFilters = {
  location?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  categoryId?: string | undefined;
  searchTerm?: string | undefined;
  isAvailable?: boolean | undefined;
  page: number;
  limit: number;
};

type CreatePropertyPayload = {
  title: string;
  description: string;
  location: string;
  price: number;
  categoryId: string;
  amenities: string[];
  images: string[];
};

const publicInclude = {
  category: true,
  landlord: {
    select: { id: true, name: true, email: true, phone: true },
  },
} satisfies Prisma.PropertyInclude;

export const getAllProperties = async (filters: PropertyFilters) => {
  const where: Prisma.PropertyWhereInput = {};

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable;
  }

  if (filters.searchTerm) {
    where.OR = [
      { title: { contains: filters.searchTerm, mode: "insensitive" } },
      { description: { contains: filters.searchTerm, mode: "insensitive" } },
      { location: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const skip = (filters.page - 1) * filters.limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: publicInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
    properties,
  };
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      ...publicInclude,
      reviews: {
        include: {
          tenant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  return property;
};

export const createProperty = async (
  landlordId: string,
  payload: CreatePropertyPayload
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return prisma.property.create({
    data: { ...payload, landlordId },
    include: publicInclude,
  });
};

const assertOwnership = async (propertyId: string, landlordId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only manage your own properties");
  }

  return property;
};

export const updateProperty = async (
  propertyId: string,
  landlordId: string,
  payload: Partial<CreatePropertyPayload> & { isAvailable?: boolean }
) => {
  await assertOwnership(propertyId, landlordId);

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) {
      throw new AppError(404, "Category not found");
    }
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: publicInclude,
  });
};

export const deleteProperty = async (
  propertyId: string,
  landlordId: string
) => {
  await assertOwnership(propertyId, landlordId);

  const activeRequests = await prisma.rentalRequest.count({
    where: {
      propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (activeRequests > 0) {
    throw new AppError(
      400,
      "Cannot delete a property with pending or active rental requests"
    );
  }

  await prisma.property.delete({ where: { id: propertyId } });
};
