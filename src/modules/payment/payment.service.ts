import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import getStripe from "../../lib/stripe";
import { JwtUser } from "../../middlewares/auth";
import AppError from "../../utils/AppError";

const paymentInclude = {
  rentalRequest: {
    include: {
      property: {
        select: { id: true, title: true, location: true, landlordId: true },
      },
      tenant: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.PaymentInclude;

export const createPayment = async (
  tenantId: string,
  rentalRequestId: string
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only pay for your own rental requests");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      400,
      `Payment is only allowed for approved rental requests. Current status: ${rentalRequest.status}`
    );
  }

  if (rentalRequest.payment && rentalRequest.payment.status === "COMPLETED") {
    throw new AppError(400, "This rental request has already been paid");
  }

  const amount = rentalRequest.property.price;

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
      propertyId: rentalRequest.propertyId,
    },
  });

  let payment;

  if (rentalRequest.payment) {
    payment = await prisma.payment.update({
      where: { id: rentalRequest.payment.id },
      data: {
        transactionId: paymentIntent.id,
        amount,
        status: "PENDING",
      },
      include: paymentInclude,
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        transactionId: paymentIntent.id,
        amount,
        method: "card",
        provider: "STRIPE",
        rentalRequestId: rentalRequest.id,
      },
      include: paymentInclude,
    });
  }

  return { payment, clientSecret: paymentIntent.client_secret };
};

export const confirmPayment = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (!payment) {
    throw new AppError(404, "Payment not found for this transaction");
  }

  if (payment.status === "COMPLETED") {
    throw new AppError(400, "This payment has already been confirmed");
  }

  const paymentIntent = await getStripe().paymentIntents.retrieve(
    transactionId
  );

  if (paymentIntent.status !== "succeeded") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw new AppError(
      400,
      `Payment has not succeeded on Stripe. Status: ${paymentIntent.status}`
    );
  }

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: payment.rentalRequestId },
  });

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
      include: paymentInclude,
    }),
    prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    }),
    prisma.property.update({
      where: { id: rentalRequest.propertyId },
      data: { isAvailable: false },
    }),
  ]);

  return updatedPayment;
};

export const getMyPayments = async (user: JwtUser) => {
  if (user.role === "TENANT") {
    return prisma.payment.findMany({
      where: { rentalRequest: { tenantId: user.id } },
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.payment.findMany({
    where: { rentalRequest: { property: { landlordId: user.id } } },
    include: paymentInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getPaymentById = async (id: string, user: JwtUser) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const isTenant = payment.rentalRequest.tenant.id === user.id;
  const isLandlord = payment.rentalRequest.property.landlordId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new AppError(403, "You do not have access to this payment");
  }

  return payment;
};
