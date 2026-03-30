import { CookieOptions } from "express";

// Cookie options para REFRESH_TOKEN

const isProduction = process.env.NODE_ENV === "production";

export const getCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
