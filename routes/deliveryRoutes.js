import express from 'express';
import { deliveryController } from '../controllers/index.js';
import { isAuthenticated, checkRole, uploadProfile } from '../middlewares/index.js';

const router = express.Router();

// Middleware para verificar que el usuario sea delivery
router.use(isAuthenticated, checkRole(['delivery']));

// Rutas del delivery
router.get('/home', deliveryController.getHome);
router.get('/orders', deliveryController.getOrders);
router.get('/order/:id', deliveryController.getOrderDetail);
router.get('/profile', deliveryController.getProfile);

// Rutas POST
router.post('/profile', uploadProfile, deliveryController.updateProfile);
router.post('/update-status', deliveryController.updateStatus);
router.post('/take-order/:id', deliveryController.takeOrder);
router.post('/complete-order/:id', deliveryController.completeOrder);

export default router;