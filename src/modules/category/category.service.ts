import prisma from "../../lib/prisma";
import AppError from "../../utils/AppError";

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { properties: true },
      },
    },
  });
};

export const createCategory = async (payload: { name: string }) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(409, "A category with this name already exists");
  }

  return prisma.category.create({ data: payload });
};

export const updateCategory = async (id: string, payload: { name: string }) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const duplicate = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (duplicate && duplicate.id !== id) {
    throw new AppError(409, "A category with this name already exists");
  }

  return prisma.category.update({ where: { id }, data: payload });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { properties: true } } },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (category._count.properties > 0) {
    throw new AppError(
      400,
      "Cannot delete a category that has properties assigned to it"
    );
  }

  await prisma.category.delete({ where: { id } });
};
