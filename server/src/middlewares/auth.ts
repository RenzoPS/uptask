import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/Auth";
import { verifyAccessJWT } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json({ error: "No autorizado" });

  try {
    const token = bearer.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token no valido" });

    const decoded = verifyAccessJWT(token);

    const user = await User.findById(decoded.sub).select("_id name email");
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token no valido" });
  }
};
