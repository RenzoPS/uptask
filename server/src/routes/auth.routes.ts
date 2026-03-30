import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";

const router: Router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("Email no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.createAccount,
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.confirmAccount,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email no valido"),
  body("password").notEmpty().withMessage("La contraseña debe estar vacia"),
  handleInputErrors,
  AuthController.login,
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.requestConfirmationCode,
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.forgotPassword,
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.validateToken,
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken,
);

router.get("/user", authenticate, AuthController.user);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

// PROFILE
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.updateProfile,
);

router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("La contraseña actual no puede ir vacia"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener minimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword,
);

router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("La contraseña no puede ir vacia"),
  handleInputErrors,
  AuthController.checkPassword,
);

export default router;
