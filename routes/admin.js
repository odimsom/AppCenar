import express from "express"
import * as adminController from "../controllers/adminController.js"
import { uploadTipoComercio } from "../middlewares/upload.js"

const router = express.Router()

// Rutas del administrador
router.get("/home", adminController.renderDashboard)

// Clientes
router.get("/clientes", adminController.renderClientes)
router.get("/clientes/cambiar-estado/:clienteId", adminController.cambiarEstadoCliente)

// Deliveries
router.get("/deliveries", adminController.renderDeliveries)
router.get("/deliveries/cambiar-estado/:deliveryId", adminController.cambiarEstadoDelivery)

// Comercios
router.get("/comercios", adminController.renderComercios)
router.get("/comercios/cambiar-estado/:comercioId", adminController.cambiarEstadoComercio)

// Configuración
router.get("/configuracion", adminController.renderConfiguracion)
router.get("/configuracion/editar", adminController.renderEditarConfiguracion)
router.post("/configuracion/editar", adminController.actualizarConfiguracion)

// Administradores
router.get("/administradores", adminController.renderAdministradores)
router.get("/administradores/crear", adminController.renderCrearAdministrador)
router.post("/administradores/crear", adminController.crearAdministrador)
router.get("/administradores/editar/:adminId", adminController.renderEditarAdministrador)
router.post("/administradores/editar/:adminId", adminController.actualizarAdministrador)
router.get("/administradores/cambiar-estado/:adminId", adminController.cambiarEstadoAdministrador)

// Tipos de comercio
router.get("/tipos-comercios", adminController.renderTiposComercios)
router.get("/tipos-comercios/crear", adminController.renderCrearTipoComercio)
router.post("/tipos-comercios/crear", uploadTipoComercio.single("icono"), adminController.crearTipoComercio)
router.get("/tipos-comercios/editar/:tipoId", adminController.renderEditarTipoComercio)
router.post(
  "/tipos-comercios/editar/:tipoId",
  uploadTipoComercio.single("icono"),
  adminController.actualizarTipoComercio,
)
router.get("/tipos-comercios/eliminar/:tipoId", adminController.renderEliminarTipoComercio)
router.post("/tipos-comercios/eliminar/:tipoId", adminController.eliminarTipoComercio)

export default router
