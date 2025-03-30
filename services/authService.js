import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/index.js';
import { emailService } from './index.js';

// Generar token de activación
const generateActivationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generar token de restablecimiento de contraseña
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Registrar cliente o delivery
const registerClient = async (userData, file = null) => {
  try {
    // Verificar si el email ya existe
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('El correo ya está registrado');
    }
    
    // Verificar si el username ya existe
    if (userData.username) {
      const existingUsername = await userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('El nombre de usuario ya está registrado');
      }
    }
    
    // Generar token de activación
    const activationToken = generateActivationToken();
    
    // Preparar datos del usuario
    const newUserData = {
      ...userData,
      activationToken,
      active: false
    };
    
    // Si se subió una imagen de perfil
    if (file) {
      newUserData.profileImage = `/uploads/profiles/${file.filename}`;
    }
    
    // Crear usuario
    const newUser = await userRepository.create(newUserData);
    
    return newUser;
  } catch (error) {
    throw error;
  }
};

// Registrar comercio
const registerCommerce = async (userData, commerceData, file = null) => {
  try {
    // Verificar si el email ya existe
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('El correo ya está registrado');
    }
    
    // Generar token de activación
    const activationToken = generateActivationToken();
    
    // Preparar datos del usuario
    const newUserData = {
      ...userData,
      role: 'commerce',
      activationToken,
      active: false
    };
    
    // Crear usuario
    const newUser = await userRepository.create(newUserData);
    
    // Preparar datos del comercio
    const newCommerceData = {
      ...commerceData,
      UserId: newUser.id
    };
    
    // Si se subió un logo
    if (file) {
      newCommerceData.logo = `/uploads/logos/${file.filename}`;
    }
    
    // Crear comercio
    const newCommerce = await commerceRepository.create(newCommerceData);
    
    return { user: newUser, commerce: newCommerce };
  } catch (error) {
    throw error;
  }
};

// Activar cuenta
const activateAccount = async (token) => {
  try {
    const user = await userRepository.activateUser(token);
    return user;
  } catch (error) {
    throw error;
  }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (email) => {
  try {
    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('No existe una cuenta con ese correo electrónico');
    }
    
    // Generar token de restablecimiento
    const resetToken = generateResetToken();
    const resetExpires = Date.now() + 3600000; // 1 hora
    
    // Actualizar usuario con token de restablecimiento
    await userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
    
    return { user, resetToken };
  } catch (error) {
    throw error;
  }
};

// Restablecer contraseña
const resetPassword = async (token, password) => {
  try {
    // Buscar usuario por token de restablecimiento
    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });
    
    if (!user) {
      throw new Error('El token de restablecimiento es inválido o ha expirado');
    }
    
    // Actualizar contraseña y limpiar tokens
    await userRepository.update(user.id, {
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export {
  generateActivationToken,
  generateResetToken,
  registerClient,
  registerCommerce,
  activateAccount,
  requestPasswordReset,
  resetPassword
};