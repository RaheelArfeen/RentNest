import Stripe from "stripe";
import AppError from "../utils/AppError";

let stripeInstance: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new AppError(
        500,
        "Stripe is not configured. Set STRIPE_SECRET_KEY in the environment"
      );
    }

    stripeInstance = new Stripe(apiKey);
  }

  return stripeInstance;
};

export default getStripe;
