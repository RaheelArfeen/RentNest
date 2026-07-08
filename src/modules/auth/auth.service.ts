import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { Role } from "../../generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "TENANT" | "LANDLORD";
};

const generateToken = (payload: { id: string; email: string; role: Role }) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const registerUser = async (payload: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone ?? null,
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "Your account has been banned");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

export const updateProfile = async (
  userId: string,
  payload: UpdateProfilePayload
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const data: { name?: string; phone?: string; password?: string } = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.phone !== undefined) data.phone = payload.phone;

  if (payload.newPassword) {
    const isPasswordValid = await bcrypt.compare(
      payload.currentPassword || "",
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError(401, "Current password is incorrect");
    }

    data.password = await bcrypt.hash(payload.newPassword, 10);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};
