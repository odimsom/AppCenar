import express from 'express';
import { commerceController } from '../controllers/index.js';
import { isAuthenticated, checkRole, uploadLogo, uploadProduct } from '../middlewares/index.js';

const router = express.Router();

// Middleware para verificar que el usuario sea comercio
router.use(isAuthenticated, checkRole(['commerce']));

// Rutas del comercio
router.get('/home', commerceController.getHome);
router.get('/products', commerceController.getProducts);
router.get('/categories', commerceController.getCategories);
router.get('/orders', commerceController.getOrders);
router.get('/order/:id', commerceController.getOrderDetail);
router.get('/profile', commerceController.getProfile);

// Rutas POST
router.post('/profile', uploadLogo, commerceController.updateProfile);
router.post('/category', commerceController.addCategory);
router.put('/category', commerceController.updateCategory);
router.delete('/category/:id', commerceController.deleteCategory);
router.post('/product', uploadProduct, commerceController.addProduct);
router.put('/product', uploadProduct, commerceController.updateProduct);
router.delete('/product/:id', commerceController.deleteProduct);
router.post('/order/status', commerceController.updateOrderStatus);

export default router;