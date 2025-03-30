import express from 'express';
import { authController } from '../controllers/index.js';
import { uploadProfile, uploadLogo, isNotAuthenticated } from '../middlewares/index.js';

const router = express.Router();

router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authController.postLogin);

router.get('/register-client', isNotAuthenticated, authController.getRegisterClient);
router.post('/register-client', isNotAuthenticated, uploadProfile, authController.postRegisterClient);

router.get('/register-commerce', isNotAuthenticated, authController.getRegisterCommerce);
router.post('/register-commerce', isNotAuthenticated, uploadLogo, authController.postRegisterCommerce);

router.get('/activate/:token', authController.getActivate);

router.get('/reset-password', isNotAuthenticated, authController.getResetPassword);
router.post('/reset-password', isNotAuthenticated, authController.postResetPassword);

router.get('/reset-password/:token', isNotAuthenticated, authController.getResetPasswordToken);
router.post('/reset-password/:token', isNotAuthenticated, authController.postResetPasswordToken);

router.get('/logout', authController.logout);

router.get('/', (req, res) => {
  if (req.session.user) {
    switch (req.session.user.role) {
      case 'client':
        return res.redirect('/client/home');
      case 'delivery':
        return res.redirect('/delivery/home');
      case 'commerce':
        return res.redirect('/commerce/home');
      case 'admin':
        return res.redirect('/admin/dashboard');
      default:
        return res.redirect('/login');
    }
  }
  res.redirect('/login');
});

export default router;