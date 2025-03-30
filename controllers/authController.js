import crypto from 'crypto';
import { Op } from 'sequelize';
import { userRepository, commerceRepository, commerceTypeRepository } from '../repositories/index.js';
import { emailService } from '../services/index.js';
import { User } from '../models/index.js';

const getLogin = (req, res) => {
  // Si el usuario ya está logueado, redirigir a su home
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
        return res.redirect('/');
    }
  }
  
  res.render('auth/login', {
    layout: 'auth'
  });
};

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email o username
    let user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.findByUsername(email);
    }
    
    if (!user) {
      req.flash('error_msg', 'Credenciales incorrectas');
      return res.redirect('/login');
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Credenciales incorrectas');
      return res.redirect('/login');
    }
    
    // Verificar si el usuario está activo
    if (!user.active) {
      req.flash('error_msg', 'Tu cuenta está inactiva. Por favor, revisa tu correo o contacta a un administrador.');
      return res.redirect('/login');
    }
    
    // Guardar usuario en sesión
    req.session.user = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    };
    
    // Redirigir según el rol
    switch (user.role) {
      case 'client':
        return res.redirect('/client/home');
      case 'delivery':
        return res.redirect('/delivery/home');
      case 'commerce':
        return res.redirect('/commerce/home');
      case 'admin':
        return res.redirect('/admin/dashboard');
      default:
        return res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al iniciar sesión');
    res.redirect('/login');
  }
};

const getRegisterClient = async (req, res) => {
  res.render('auth/register-client', {
    layout: 'auth'
  });
};

const postRegisterClient = async (req, res) => {
  try {
    const { name, lastName, phone, email, username, role, password, confirmPassword } = req.body;
    let profileImage = null;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/register-client');
    }
    
    // Verificar si el email ya existe
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      req.flash('error_msg', 'El correo ya está registrado');
      return res.redirect('/register-client');
    }
    
    // Verificar si el username ya existe
    if (username) {
      const existingUsername = await userRepository.findByUsername(username);
      if (existingUsername) {
        req.flash('error_msg', 'El nombre de usuario ya está registrado');
        return res.redirect('/register-client');
      }
    }
    
    // Si se subió una imagen de perfil
    if (req.file) {
      profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Generar token de activación
    const activationToken = crypto.randomBytes(20).toString('hex');
    
    // Crear usuario
    const newUser = await userRepository.create({
      name,
      lastName,
      phone,
      email,
      username,
      password,
      profileImage,
      role: role === 'delivery' ? 'delivery' : 'client', // Asegurar que solo sea client o delivery
      activationToken,
      active: false
    });
    
    // Enviar correo de activación
    const activationUrl = `${req.protocol}://${req.get('host')}/activate/${activationToken}`;
    await emailService.sendActivationEmail(newUser.email, activationUrl);
    
    req.flash('success_msg', 'Te has registrado exitosamente. Por favor, revisa tu correo para activar tu cuenta.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al registrar usuario');
    res.redirect('/register-client');
  }
};

const getRegisterCommerce = async (req, res) => {
  try {
    const commerceTypes = await commerceTypeRepository.findAll();
    res.render('auth/register-commerce', {
      layout: 'auth',
      commerceTypes
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar los tipos de comercio');
    res.redirect('/login');
  }
};

const postRegisterCommerce = async (req, res) => {
  try {
    const { name, phone, email, openingTime, closingTime, commerceTypeId, password, confirmPassword } = req.body;
    let logo = null;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/register-commerce');
    }
    
    // Verificar si el email ya existe
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      req.flash('error_msg', 'El correo ya está registrado');
      return res.redirect('/register-commerce');
    }
    
    // Si se subió un logo
    if (req.file) {
      logo = `/uploads/logos/${req.file.filename}`;
    }
    
    // Generar token de activación
    const activationToken = crypto.randomBytes(20).toString('hex');
    
    // Crear usuario de tipo comercio
    const newUser = await userRepository.create({
      name,
      email,
      phone,
      password,
      role: 'commerce',
      activationToken,
      active: false
    });
    
    // Crear el comercio asociado al usuario
    await commerceRepository.create({
      name,
      logo,
      openingTime,
      closingTime,
      UserId: newUser.id,
      CommerceTypeId: commerceTypeId
    });
    
    // Enviar correo de activación
    const activationUrl = `${req.protocol}://${req.get('host')}/activate/${activationToken}`;
    await emailService.sendActivationEmail(newUser.email, activationUrl);
    
    req.flash('success_msg', 'Tu comercio se ha registrado exitosamente. Por favor, revisa tu correo para activar tu cuenta.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al registrar comercio');
    res.redirect('/register-commerce');
  }
};

const getActivate = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Activar usuario
    const user = await userRepository.activateUser(token);
    
    if (!user) {
      req.flash('error_msg', 'Token de activación inválido');
      return res.redirect('/login');
    }
    
    req.flash('success_msg', 'Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al activar la cuenta');
    res.redirect('/login');
  }
};

const getResetPassword = (req, res) => {
  res.render('auth/reset-password', {
    layout: 'auth'
  });
};

const postResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      req.flash('error_msg', 'No existe una cuenta con ese correo electrónico');
      return res.redirect('/reset-password');
    }
    
    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Actualizar usuario con token de restablecimiento
    await userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 3600000 // 1 hora
    });
    
    // Enviar correo de restablecimiento
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    await emailService.sendResetPasswordEmail(user.email, resetUrl);
    
    req.flash('success_msg', 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al solicitar restablecimiento de contraseña');
    res.redirect('/reset-password');
  }
};

const getResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Buscar usuario por token de restablecimiento
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });
    
    if (!user) {
      req.flash('error_msg', 'El token de restablecimiento es inválido o ha expirado');
      return res.redirect('/reset-password');
    }
    
    res.render('auth/reset-password-form', {
      layout: 'auth',
      token
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al procesar el token de restablecimiento');
    res.redirect('/reset-password');
  }
};

const postResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect(`/reset-password/${token}`);
    }
    
    // Buscar usuario por token de restablecimiento
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });
    
    if (!user) {
      req.flash('error_msg', 'El token de restablecimiento es inválido o ha expirado');
      return res.redirect('/reset-password');
    }
    
    // Actualizar contraseña y limpiar tokens
    await userRepository.update(user.id, {
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    req.flash('success_msg', 'Tu contraseña ha sido actualizada exitosamente');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar la contraseña');
    res.redirect('/reset-password');
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

export {
  getLogin,
  postLogin,
  getRegisterClient,
  postRegisterClient,
  getRegisterCommerce,
  postRegisterCommerce,
  getActivate,
  getResetPassword,
  postResetPassword,
  getResetPasswordToken,
  postResetPasswordToken,
  logout
};