import express from "express"
import * as deliveryController from "../controllers/deliveryController.js"
import { uploadUser } from "../middlewares/upload.js"

const router = express.Router()

// Rutas del delivery
router.get("/home", deliveryController.renderHome)
router.get("/pedidos/:pedidoId", deliveryController.renderDetallePedido)
router.post("/pedidos/:pedidoId/completar", deliveryController.completarPedido)

// Perfil
router.get("/perfil", deliveryController.renderPerfil)
router.post("/perfil", uploadUser.single("foto"), deliveryController.actualizarPerfil)

export default router
