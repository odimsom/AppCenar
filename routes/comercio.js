import express from "express"
import * as comercioController from "../controllers/comercioController.js"
import { uploadComercio, uploadProducto } from "../middlewares/upload.js"

const router = express.Router()

// Rutas del comercio
router.get("/home", comercioController.renderHome)
router.get("/pedidos/:pedidoId", comercioController.renderDetallePedido)
router.post("/pedidos/:pedidoId/asignar-delivery", comercioController.asignarDelivery)

// Perfil
router.get("/perfil", comercioController.renderPerfil)
router.post("/perfil", uploadComercio.single("logo"), comercioController.actualizarPerfil)

// Categorías
router.get("/categorias", comercioController.renderCategorias)
router.get("/categorias/crear", comercioController.renderCrearCategoria)
router.post("/categorias/crear", comercioController.crearCategoria)
router.get("/categorias/editar/:categoriaId", comercioController.renderEditarCategoria)
router.post("/categorias/editar/:categoriaId", comercioController.actualizarCategoria)
router.get("/categorias/eliminar/:categoriaId", comercioController.renderEliminarCategoria)
router.post("/categorias/eliminar/:categoriaId", comercioController.eliminarCategoria)

// Productos
router.get("/productos", comercioController.renderProductos)
router.get("/productos/crear", comercioController.renderCrearProducto)
router.post("/productos/crear", uploadProducto.single("imagen"), comercioController.crearProducto)
router.get("/productos/editar/:productoId", comercioController.renderEditarProducto)
router.post("/productos/editar/:productoId", uploadProducto.single("imagen"), comercioController.actualizarProducto)
router.get("/productos/eliminar/:productoId", comercioController.renderEliminarProducto)
router.post("/productos/eliminar/:productoId", comercioController.eliminarProducto)

export default router
