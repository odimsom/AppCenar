import express from "express";
import * as clienteController from "../controllers/clienteController.js";
import { uploadUser } from "../middlewares/upload.js";

const router = express.Router();

// Rutas del cliente
router.get("/home", clienteController.renderHome);
router.get("/comercios/:tipoId", clienteController.renderListadoComercios);
router.get("/catalogo/:comercioId", clienteController.renderCatalogoProductos);

// Carrito
router.get("/carrito", clienteController.renderCarrito);
router.post("/agregar-al-carrito", clienteController.agregarAlCarrito);
router.get(
  "/quitar-del-carrito/:productoId",
  clienteController.quitarDelCarrito
);
router.get(
  "/seleccionar-direccion",
  clienteController.renderSeleccionDireccion
);
router.post("/crear-pedido", clienteController.crearPedido);

// Perfil
router.get("/perfil", clienteController.renderPerfil);
router.post(
  "/perfil",
  uploadUser.single("foto"),
  clienteController.actualizarPerfil
);

// Pedidos
router.get("/pedidos", clienteController.renderPedidos);
router.get("/pedidos/:pedidoId", clienteController.renderDetallePedido);

// Direcciones
router.get("/direcciones", clienteController.renderDirecciones);
router.get("/direcciones/crear", clienteController.renderCrearDireccion);
router.post("/direcciones/crear", clienteController.crearDireccion);
router.get(
  "/direcciones/editar/:direccionId",
  clienteController.renderEditarDireccion
);
router.post(
  "/direcciones/editar/:direccionId",
  clienteController.actualizarDireccion
);
router.get(
  "/direcciones/eliminar/:direccionId",
  clienteController.renderEliminarDireccion
);
router.post(
  "/direcciones/eliminar/:direccionId",
  clienteController.eliminarDireccion
);

// Favoritos
router.get("/favoritos", clienteController.renderFavoritos);
router.get("/favoritos/agregar/:comercioId", clienteController.agregarFavorito);
router.get(
  "/favoritos/eliminar/:comercioId",
  clienteController.eliminarFavorito
);

export default router;
