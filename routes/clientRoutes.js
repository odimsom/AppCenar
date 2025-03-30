import express from 'express';
import { clientController } from '../controllers/index.js';
import { isAuthenticated, checkRole, uploadProfile } from '../middlewares/index.js';

const router = express.Router();

// Middleware para verificar que el usuario sea cliente
router.use(isAuthenticated, checkRole(['client']));

// Rutas del cliente
router.get('/home', clientController.getHome);
router.get('/catalog/:id', clientController.getCatalog);
router.get('/orders', clientController.getOrders);
router.get('/order/:id', clientController.getOrderDetail);
router.get('/favorites', clientController.getFavorites);
router.get('/address', clientController.getAddresses);
router.get('/profile', clientController.getProfile);

// Rutas POST
router.post('/profile', uploadProfile, clientController.updateProfile);
router.post('/address', clientController.addAddress);
router.delete('/address/:id', clientController.deleteAddress);
router.post('/favorites', clientController.addToFavorites);
router.delete('/favorites/:commerceId', clientController.removeFromFavorites);
router.post('/order', clientController.createOrder);

export default router;