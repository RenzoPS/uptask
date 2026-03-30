import { CookieOptions, Request, Response } from "express";
import User from "../models/Auth";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import {
   generateAccessJWT,
   generateRefreshJWT,
   verifyRefreshJWT,
} from "../utils/jwt";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "../config/cookies";

export class AuthController {
   static createAccount = async (req: Request, res: Response) => {
      try {
         // Verificar que el usuario NO EXISTE
         const { password, email } = req.body;
         const userExists = await User.findOne({ email });
         if (userExists) {
            const error = new Error("El usuario ya esta registrado");
            return res.status(409).json({ error: error.message });
         }

         // Crear usuario
         const user = new User(req.body);

         // Llamar metodo para hashear password
         user.password = await hashPassword(password);

         // Generar token
         const token = new Token();
         token.token = generateToken();
         token.user = user._id;

         // Enviar email
         AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: token.token,
         });

         // Guardar tanto token como usuario en la base de datos
         await Promise.allSettled([user.save(), token.save()]);
         res.send("Cuenta creada, revisa tu email para confirmarla");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static confirmAccount = async (req: Request, res: Response) => {
      try {
         const { token } = req.body;
         const tokenExists = await Token.findOne({ token });
         if (!tokenExists) {
            const error = new Error("Token no valido");
            return res.status(401).json({ error: error.message });
         }

         const user = await User.findById(tokenExists.user);
         if (!user) {
            const error = new Error("El usuario no existe");
            return res.status(404).json({ error: error.message });
         }
         user.confirmed = true;
         await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
         res.send("Cuenta confirmada correctamente");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static login = async (req: Request, res: Response) => {
      try {
         const { email, password } = req.body;

         // Verificar si el usuario existe
         const user = await User.findOne({ email });
         if (!user) {
            const error = new Error("El usuario no existe");
            return res.status(404).json({ error: error.message });
         }

         // Verificar si ha confirmado la cuenta
         if (!user.confirmed) {
            const token = new Token();
            token.user = user._id;
            token.token = generateToken();
            await token.save();

            AuthEmail.sendConfirmationEmail({
               email: user.email,
               name: user.name,
               token: token.token,
            });

            const error = new Error(
               "La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion",
            );
            return res.status(401).json({ error: error.message });
         }

         // Verificar si la contraseña es correcta
         const isPassCorrect = await checkPassword(password, user.password);
         if (!isPassCorrect) {
            const error = new Error("Contraseña incorrecta");
            return res.status(401).json({ error: error.message });
         }

         // Generar JWTs
         const accessToken = generateAccessJWT({ sub: user._id.toString() });
         const refreshToken = generateRefreshJWT({ sub: user._id.toString() });

         // Setear refreshToken en cookies
         res.cookie("refreshToken", refreshToken, getCookieOptions);

         return res
            .status(200)
            .json({ accessToken, message: "Inicio de sesión exitoso" });
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static requestConfirmationCode = async (req: Request, res: Response) => {
      try {
         const { email } = req.body;

         // Verificar que el usuario EXISTE
         const user = await User.findOne({ email });
         if (!user) {
            const error = new Error("El usuario no existe");
            return res.status(404).json({ error: error.message });
         }

         if (user.confirmed) {
            const error = new Error("El usuario ya esta confirmado");
            return res.status(403).json({ error: error.message });
         }

         // Generar token
         const token = new Token();
         token.token = generateToken();
         token.user = user._id;

         // Enviar email
         AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: token.token,
         });

         // Guardar tanto token como usuario en la base de datos
         await Promise.allSettled([user.save(), token.save()]);
         res.send("Se envió un nuevo token a tu email");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static forgotPassword = async (req: Request, res: Response) => {
      try {
         const { email } = req.body;

         // Verificar que el usuario EXISTE
         const user = await User.findOne({ email });
         if (!user) {
            const error = new Error("El usuario no existe");
            return res.status(404).json({ error: error.message });
         }

         // Generar token
         const token = new Token();
         token.token = generateToken();
         token.user = user._id;
         await token.save();

         // Enviar email
         AuthEmail.sendPasswordResetToken({
            email: user.email,
            name: user.name,
            token: token.token,
         });

         res.send("Revisa tu email para reestablecer la contraseña");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static validateToken = async (req: Request, res: Response) => {
      try {
         const { token } = req.body;
         const tokenExists = await Token.findOne({ token });
         if (!tokenExists) {
            const error = new Error("Token no valido");
            return res.status(401).json({ error: error.message });
         }

         res.send("Token valido, define tu nuevo password");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static updatePasswordWithToken = async (req: Request, res: Response) => {
      try {
         const { token } = req.params;
         const { password } = req.body;
         const tokenExists = await Token.findOne({ token });
         if (!tokenExists) {
            const error = new Error("Token no valido");
            return res.status(401).json({ error: error.message });
         }

         const user = await User.findById(tokenExists.user);
         user!.password = await hashPassword(password);
         await Promise.allSettled([user!.save(), tokenExists.deleteOne()]);

         res.send("La contraseña ha sido actualizada");
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };

   static user = async (req: Request, res: Response) => {
      res.json(req.user);
   };

   static updateProfile = async (req: Request, res: Response) => {
      const { name, email } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== req.user._id.toString()) {
         const error = new Error("Ese email ya esta registrado");
         return res.status(409).json({ error: error.message });
      }

      req.user.name = name;
      req.user.email = email;

      try {
         await req.user.save();
         res.send("Perfil actualizado correctamente");
      } catch (e) {
         res.status(500).send("Hubo un error");
      }
   };

   static updateCurrentUserPassword = async (req: Request, res: Response) => {
      const { current_password, password } = req.body;

      const user = await User.findById(req.user._id);

      const isPasswordCorrect = await checkPassword(
         current_password,
         user!.password,
      );

      if (!isPasswordCorrect) {
         const error = new Error("La contraseña actual es incorrecta");
         return res.status(401).json({ error: error.message });
      }

      try {
         user!.password = await hashPassword(password);
         await user!.save();
         res.send("La contraseña se actualizo correctamente");
      } catch (e) {
         res.status(500).send("Hubo un error");
      }
   };

   static checkPassword = async (req: Request, res: Response) => {
      const { password } = req.body;

      const user = await User.findById(req.user._id);

      const isPasswordCorrect = await checkPassword(password, user!.password);

      if (!isPasswordCorrect) {
         const error = new Error("La contraseña actual es incorrecta");
         return res.status(401).json({ error: error.message });
      }

      res.send("Contraseña correcta");
   };

   static refreshToken = async (req: Request, res: Response) => {
      const refreshToken = req.cookies.refreshToken as string;
      if (!refreshToken)
         return res.status(401).json({ error: "Refresh token no encontrado" });

      try {
         const decoded = verifyRefreshJWT(refreshToken);
         const user = await User.findById(decoded.sub).select("_id name email");
         if (!user) return res.status(401).json({ error: "No autorizado" });

         const newAccessToken = generateAccessJWT({ sub: user._id.toString() });
         return res.status(200).json({ accessToken: newAccessToken });
      } catch (error) {
         res.clearCookie("refreshToken");
         res.clearCookie("accessToken");
         res.status(401).json({ error: "No autorizado" });
      }
   };

   static logout = async (req: Request, res: Response) => {
      try {
         res.clearCookie("refreshToken");
         res.json({ message: "Sesión cerrada correctamente" });
      } catch (error) {
         res.status(500).json({ error: "Hubo un error" });
      }
   };
}
