import express from 'express';
import { adminController } from '../controllers/index.js';
import { isAuthenticated, checkRole, uploadIcon } from '../middlewares/index.js';

const router = express.Router();

// Middleware para verificar que el usuario sea administrador
router.use(isAuthenticated, checkRole(['admin']));

// Rutas del administrador
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/commerces', adminController.getCommerces);
router.get('/commerce-types', adminController.getCommerceTypes);
router.get('/configuration', adminController.getConfiguration);

// Rutas POST
router.post('/user/toggle/:id', adminController.toggleUserStatus);
router.post('/commerce-type', uploadIcon, adminController.addCommerceType);
router.put('/commerce-type', uploadIcon, adminController.updateCommerceType);
router.delete('/commerce-type/:id', adminController.deleteCommerceType);
router.post('/configuration', adminController.updateConfiguration);

export default router;