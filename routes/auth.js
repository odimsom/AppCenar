import express from "express"
import * as authController from "../controllers/authController.js"
import { checkNotAuthenticated } from "../middlewares/auth.js"
import { uploadUser, uploadComercio } from "../middlewares/upload.js"

const router = express.Router()

// Rutas de autenticación
router.get("/login", checkNotAuthenticated, authController.renderLogin)
router.post("/login", checkNotAuthenticated, authController.login)
router.get("/logout", authController.logout)

// Rutas de registro
router.get("/registro-cliente-delivery", checkNotAuthenticated, authController.renderRegistroClienteDelivery)
router.post(
  "/registro-cliente-delivery",
  checkNotAuthenticated,
  uploadUser.single("foto"),
  authController.registroClienteDelivery,
)

router.get("/registro-comercio", checkNotAuthenticated, authController.renderRegistroComercio)
router.post("/registro-comercio", checkNotAuthenticated, uploadComercio.single("logo"), authController.registroComercio)

// Activación de cuenta
router.get("/activar/:token", authController.activarCuenta)

// Recuperación de contraseña
router.get("/solicitar-recuperacion", checkNotAuthenticated, authController.renderSolicitarRecuperacion)
router.post("/solicitar-recuperacion", checkNotAuthenticated, authController.solicitarRecuperacion)
router.get("/reset-password/:token", checkNotAuthenticated, authController.renderRestablecerPassword)
router.post("/reset-password/:token", checkNotAuthenticated, authController.restablecerPassword)

export default router
