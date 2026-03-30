import jwt, { JwtPayload } from "jsonwebtoken";

type UserPayload = {
  sub: string;
};

export const generateAccessJWT = (payload: UserPayload): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("La variable de entorno ACCESS_TOKEN_SECRET es requerida");
  }
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
  return accessToken;
};

export const generateRefreshJWT = (payload: UserPayload): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("La variable de entorno REFRESH_TOKEN_SECRET es requerida");
  }
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
  return refreshToken;
};

export const verifyAccessJWT = (token: string): UserPayload => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("La variable de entorno ACCESS_TOKEN_SECRET es requerida");
  }
  return jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
  ) as UserPayload;
};

export const verifyRefreshJWT = (token: string): UserPayload => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("La variable de entorno REFRESH_TOKEN_SECRET es requerida");
  }
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
  ) as UserPayload;
};
